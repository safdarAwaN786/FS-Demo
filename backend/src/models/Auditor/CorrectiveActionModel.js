const mongoose = require('mongoose');
const { Schema } = mongoose;

// * Creation of CorrectiveAction Schema
const CorrectiveActionSchema = new mongoose.Schema({

    Report: {
        type: Schema.Types.ObjectId,
        ref: 'Reports',
        required: true,
    },
    UserDepartment : {
        type : Schema.Types.ObjectId,
        ref : 'UserDepartment'
    },

    Answers: [{

        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChecklistAnswer',
            required: true,
        },

        Remarks: {
            type: String,
        },

        Correction: {
            type: String
        },

        CorrectiveAction: {
            type: String
        },

        RootCause: {
            type: String
        },

        EvidenceDoc: {
            type: Object,
        },

        CorrectiveDoc: {
            type: Object,
        },

        ComplianceLevelValue: {
            type: Object,
        },
    }],

    CorrectionBy: {
        type: String
    },

    CorrectionDate: {
        type: Date
    }

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


// * Creation of model
const CorrectiveAction = mongoose.model('CorrectiveAction', CorrectiveActionSchema);
module.exports = CorrectiveAction;