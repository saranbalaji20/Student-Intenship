const mongoose = require('mongoose');

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLL_NUMBER_PATTERN = /^[A-Z0-9][A-Z0-9/_-]{2,19}$/i;

const asText = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Validates and normalises the body of POST /api/applications.
 * Returns `{ value, errors }`; `errors` is keyed by field name.
 */
function validateApplicationInput(body = {}) {
    const errors = {};

    const name = asText(body.name);
    if (!name) {
        errors.name = 'Student name is required';
    } else if (name.length < 2 || name.length > 80) {
        errors.name = 'Name must be between 2 and 80 characters';
    } else if (!NAME_PATTERN.test(name)) {
        errors.name = "Name may only contain letters, spaces, dots, hyphens and apostrophes";
    }

    const email = asText(body.email).toLowerCase();
    if (!email) {
        errors.email = 'Email ID is required';
    } else if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
        errors.email = 'Please enter a valid email ID (for example, student@college.edu)';
    }

    const rollNumber = asText(body.rollNumber).toUpperCase();
    if (!rollNumber) {
        errors.rollNumber = 'Roll number is required';
    } else if (!ROLL_NUMBER_PATTERN.test(rollNumber)) {
        errors.rollNumber =
            'Roll number must be 3-20 characters using letters, numbers, hyphen, underscore or slash';
    }

    const internship = asText(body.internship);
    if (!internship) {
        errors.internship = 'Please select an internship';
    } else if (!mongoose.isValidObjectId(internship)) {
        errors.internship = 'Selected internship is invalid';
    }

    return {
        value: { name, email, rollNumber, internship },
        errors,
    };
}

module.exports = {
    validateApplicationInput,
    NAME_PATTERN,
    EMAIL_PATTERN,
    ROLL_NUMBER_PATTERN,
};
