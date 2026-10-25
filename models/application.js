const mongoose = require('mongoose');

const { Schema } = mongoose;

const applicationSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Student name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [80, 'Name must be at most 80 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email ID is required'],
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please provide a valid email ID'],
        },
        rollNumber: {
            type: String,
            required: [true, 'Roll number is required'],
            trim: true,
            uppercase: true,
            match: [
                /^[A-Z0-9][A-Z0-9/_-]{2,19}$/,
                'Roll number must be 3-20 characters (letters, numbers, -, _ or /)',
            ],
        },
        internship: {
            type: Schema.Types.ObjectId,
            ref: 'Internship',
            required: [true, 'Please select an internship'],
        },
        status: {
            type: String,
            enum: ['submitted', 'under-review', 'accepted', 'rejected'],
            default: 'submitted',
        },
    },
    { timestamps: true }
);

// A student may apply to a given internship only once.
applicationSchema.index({ email: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
