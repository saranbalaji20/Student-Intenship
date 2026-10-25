const mongoose = require('mongoose');

const { Schema } = mongoose;

const internshipSchema = new Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        title: {
            type: String,
            required: [true, 'Internship title is required'],
            trim: true,
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        coverImage: {
            type: String,
            trim: true,
            default: '',
        },
        mode: {
            type: String,
            enum: ['Remote', 'Hybrid', 'On-site'],
            default: 'Remote',
        },
        stipend: {
            type: Number,
            min: 0,
            default: 0,
        },
        duration: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        skills: {
            type: [String],
            default: [],
        },
        responsibilities: {
            type: [String],
            default: [],
        },
        eligibility: {
            type: String,
            default: 'Open to all enrolled undergraduate students.',
        },
        openings: {
            type: Number,
            default: 1,
            min: 1,
        },
        deadline: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Text index powers the optional ?search= filter on the list endpoint.
internshipSchema.index({ title: 'text', company: 'text', skills: 'text' });

module.exports = mongoose.model('Internship', internshipSchema);
