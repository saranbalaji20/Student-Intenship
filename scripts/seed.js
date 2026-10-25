/**
 * Refreshes the demo internship catalogue.
 * Usage: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { seedInternships } = require('../utils/seedInternships');

async function run() {
    const mongoUri = process.env.MONGO_DB_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error('MONGO_DB_URI is not set');
    }

    await mongoose.connect(mongoUri);
    const result = await seedInternships({ reset: true });
    console.log(`Seeded ${result.count} internships`);
    await mongoose.disconnect();
}

run().catch(async (error) => {
    console.error('Seed failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
});
