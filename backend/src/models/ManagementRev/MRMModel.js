const mongoose = require('mongoose');
const { Schema } = mongoose;

// Creation of MRM Schema
const MRMSchema = new mongoose.Schema({
    Notification: {
        type: Schema.Types.ObjectId,
        ref: 'Notification',
        required: true
    },
    UserDepartment: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
    },
    AgendaDetails: [{
        Agenda: {
            type: Schema.Types.ObjectId,
            ref: 'Agenda',  // Reference to the Agenda model
            required: true
        },
        TargetDate: {
            type: Date
        },
        Discussion: {
            type: String
        },
        Responsibilities: {
            type: String
        },
        Participants: [{
            type: Schema.Types.ObjectId,
            ref: 'Participants'
        }],
    }],
    CreatedBy: {
        type: String
    },
    CreationDate: {
        type: Date
    },
    UpdatedBy: {
        type: String
    },
    UpdationDate: {
        type: Date
    }

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Creation of MRM model
const MRM = mongoose.model('MRM', MRMSchema);
module.exports = MRM;
