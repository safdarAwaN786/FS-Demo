const mongoose = require('mongoose');
const { Schema } = mongoose;

// * Creation of Reports Schema
const ReportsSchema = new mongoose.Schema({

    ConductAudit: {
        type: Schema.Types.ObjectId,
        ref: 'ConductAudits',
        required: true,
    },
    UserDepartment: {
        type: Schema.Types.ObjectId,
        ref: 'Department'
    },
    SelectedAnswers: [
        {
            Answer: {
                type: Schema.Types.ObjectId,
                ref: 'ChecklistAnswer',
            },
            TargetDate: {
                type: Date
            }
        }
    ],

    ReportDate: {
        type: Date
    },

    ReportBy: {
        type: String
    },



}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


// * Creation of model
const Reports = mongoose.model('Reports', ReportsSchema);
module.exports = Reports;