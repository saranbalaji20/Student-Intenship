const Internship = require('../models/internship');
const internships = require('../data/internships');

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Adds cover images to catalogues seeded before the images were introduced.
 * Only documents without an image are touched, so existing deadlines are kept.
 */
async function backfillCoverImages() {
    const operations = internships
        .filter((internship) => internship.coverImage)
        .map((internship) => ({
            updateOne: {
                filter: {
                    slug: internship.slug,
                    $or: [{ coverImage: { $exists: false } }, { coverImage: '' }],
                },
                update: { $set: { coverImage: internship.coverImage } },
            },
        }));

    if (operations.length === 0) return 0;

    const result = await Internship.bulkWrite(operations, { ordered: false });
    return result.modifiedCount;
}

/**
 * Inserts the demo internship catalogue.
 * With `{ reset: true }` the catalogue is upserted and deadlines are refreshed.
 */
async function seedInternships({ reset = false } = {}) {
    if (!reset) {
        const count = await Internship.estimatedDocumentCount();
        if (count > 0) {
            const updated = await backfillCoverImages();
            return { seeded: false, count, updated };
        }
    }

    const now = Date.now();
    const operations = internships.map(({ deadlineInDays, ...internship }) => ({
        updateOne: {
            filter: { slug: internship.slug },
            update: {
                $set: {
                    ...internship,
                    deadline: new Date(now + deadlineInDays * DAY_IN_MS),
                    isActive: true,
                },
            },
            upsert: true,
        },
    }));

    await Internship.bulkWrite(operations, { ordered: false });
    const count = await Internship.countDocuments();
    return { seeded: true, count };
}

module.exports = { seedInternships };
