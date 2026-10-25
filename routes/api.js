const express = require('express');
const mongoose = require('mongoose');

const Internship = require('../models/internship');
const Application = require('../models/application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { validateApplicationInput } = require('../utils/validateApplication');

const router = express.Router();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/health
 * Lightweight probe used by hosting platforms.
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: Math.round(process.uptime()),
    });
});

/**
 * GET /api/internships?search=react&mode=Remote
 * Returns the active internship catalogue, ordered by application deadline.
 */
router.get(
    '/internships',
    asyncHandler(async (req, res) => {
        const { search, mode } = req.query;
        const filter = { isActive: true };

        if (mode) {
            const allowedModes = ['Remote', 'Hybrid', 'On-site'];
            if (!allowedModes.includes(mode)) {
                throw new ApiError(400, `Mode must be one of: ${allowedModes.join(', ')}`);
            }
            filter.mode = mode;
        }

        if (typeof search === 'string' && search.trim()) {
            const pattern = new RegExp(escapeRegex(search.trim()), 'i');
            filter.$or = [
                { title: pattern },
                { company: pattern },
                { location: pattern },
                { skills: pattern },
            ];
        }

        const internships = await Internship.find(filter).sort({ deadline: 1 }).lean();

        res.json({ count: internships.length, internships });
    })
);

/**
 * GET /api/internships/:id
 * Returns the full detail document for one internship.
 */
router.get(
    '/internships/:id',
    asyncHandler(async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            throw new ApiError(400, 'Invalid internship id');
        }

        const internship = await Internship.findOne({
            _id: req.params.id,
            isActive: true,
        }).lean();

        if (!internship) {
            throw new ApiError(404, 'Internship not found');
        }

        res.json({ internship });
    })
);

/**
 * POST /api/applications
 * Validates and stores a student application.
 */
router.post(
    '/applications',
    asyncHandler(async (req, res) => {
        const { value, errors } = validateApplicationInput(req.body);

        if (Object.keys(errors).length > 0) {
            throw new ApiError(
                400,
                'Please correct the highlighted fields',
                Object.entries(errors).map(([field, message]) => ({ field, message }))
            );
        }

        const internship = await Internship.findOne({
            _id: value.internship,
            isActive: true,
        });

        if (!internship) {
            throw new ApiError(404, 'The selected internship is no longer available');
        }

        if (internship.deadline.getTime() < Date.now()) {
            throw new ApiError(400, 'Applications for this internship have closed');
        }

        const application = await Application.create({
            name: value.name,
            email: value.email,
            rollNumber: value.rollNumber,
            internship: internship._id,
        });

        await application.populate('internship', 'title company location mode stipend deadline');

        res.status(201).json({
            message: 'Application submitted successfully',
            application,
        });
    })
);

/**
 * GET /api/applications?internship=<id>&email=<email>
 * Retrieves stored applications (newest first) for the demo admin view.
 */
router.get(
    '/applications',
    asyncHandler(async (req, res) => {
        const { internship, email, status } = req.query;
        const filter = {};

        if (internship) {
            if (!mongoose.isValidObjectId(internship)) {
                throw new ApiError(400, 'Invalid internship id');
            }
            filter.internship = internship;
        }

        if (typeof email === 'string' && email.trim()) {
            filter.email = email.trim().toLowerCase();
        }

        if (status) {
            const allowedStatuses = ['submitted', 'under-review', 'accepted', 'rejected'];
            if (!allowedStatuses.includes(status)) {
                throw new ApiError(400, `Status must be one of: ${allowedStatuses.join(', ')}`);
            }
            filter.status = status;
        }

        const applications = await Application.find(filter)
            .populate('internship', 'title company location mode stipend deadline')
            .sort({ createdAt: -1 })
            .limit(200)
            .lean();

        res.json({ count: applications.length, applications });
    })
);

/**
 * GET /api/applications/:id
 * Returns one application with its internship details.
 */
router.get(
    '/applications/:id',
    asyncHandler(async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            throw new ApiError(400, 'Invalid application id');
        }

        const application = await Application.findById(req.params.id)
            .populate('internship', 'title company location mode stipend deadline')
            .lean();

        if (!application) {
            throw new ApiError(404, 'Application not found');
        }

        res.json({ application });
    })
);

module.exports = router;
