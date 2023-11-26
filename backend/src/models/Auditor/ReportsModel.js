const mongoose = require('mongoose');
const { Schema } = mongoose;

// * Creation of Reports Schema
const ReportsSchema = new mongoose.Schema({

    ConductAudit: {
        type: Schema.Types.ObjectId,
        ref: 'ConductAudits',
        required: true,
    },
    User : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },

    TargetDate: {
        type: Date
    },

    ReportDate: {
        type: Date
    },

    ReportBy: {
        type: String
    },

    ReportDate: {
        type: Date
    }

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


// * Creation of model
const Reports = mongoose.model('Reports', ReportsSchema);
module.exports = Reports;