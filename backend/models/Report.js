const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Making this optional for now since we're not using authentication
    },
    reportId: {
        type: String,
        required: true,
        default: () => require('crypto').randomBytes(12).toString('hex')
    },
    patientName: {
        type: String,
        required: true
    },
    reportType: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    base64Data: {
        type: String,
        required: true
    },
    hasSummary: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Report', reportSchema);