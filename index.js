const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const routes = require('./routes/api');
const { seedInternships } = require('./utils/seedInternships');

const app = express();
const port = process.env.PORT || 5000;

// Platform proxies (Render, Railway, etc.) terminate TLS before the app.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(express.json({ limit: '20kb' }));

/**
 * CORS. CLIENT_ORIGIN accepts a comma-separated list. When it is not set,
 * requests are allowed from any origin (handy for previews); set it in
 * production to lock the API down to the deployed frontend.
 */
const configuredOrigins = (process.env.CLIENT_ORIGIN || process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    const isLocalhost = origin && /^http:\/\/localhost:\d+$/.test(origin);
    const isVercelPreview = origin && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
    const isAllowed =
        !origin ||
        configuredOrigins.length === 0 ||
        configuredOrigins.includes(origin) ||
        isLocalhost ||
        isVercelPreview;

    if (origin && isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    return next();
});

app.use('/api', routes);

// Unknown API routes should never fall through to the React app.
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

// In single-service deployments the built React app is served from client/dist.
const clientDist = path.join(__dirname, 'client', 'dist');
const clientIndex = path.join(clientDist, 'index.html');

if (fs.existsSync(clientIndex)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
        res.sendFile(clientIndex);
    });
}

// Central error handler: normalises validation, cast and duplicate-key errors.
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let errors = err.details;

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        errors = Object.values(err.errors).map((error) => ({
            field: error.path,
            message: error.message,
        }));
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid value for ${err.path}`;
    } else if (err.code === 11000) {
        statusCode = 409;
        message = 'You have already applied for this internship with this email ID';
        errors = [{ field: 'email', message }];
    } else if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'Request body must be valid JSON';
    }

    if (statusCode >= 500) {
        console.error('[server error]', err);
        if (process.env.NODE_ENV === 'production') {
            message = 'Internal server error';
        }
    }

    res.status(statusCode).json({
        message,
        ...(errors ? { errors } : {}),
    });
});

async function start() {
    const mongoUri = process.env.MONGO_DB_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error(
            'MONGO_DB_URI is not set. Copy env-example to .env and add your MongoDB connection string.'
        );
    }

    mongoose.connection.on('error', (error) => {
        console.error('[mongo] connection error:', error.message);
    });

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');

    const result = await seedInternships();
    if (result.seeded) {
        console.log(`Seeded ${result.count} internships`);
    }

    const server = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });

    const shutdown = async (signal) => {
        console.log(`${signal} received, shutting down gracefully`);
        server.close(async () => {
            await mongoose.disconnect();
            process.exit(0);
        });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    return server;
}

if (require.main === module) {
    start().catch((error) => {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    });
}

module.exports = { app, start };
