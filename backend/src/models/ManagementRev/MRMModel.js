const mongoose = require('mongoose');
const { Schema } = mongoose;

// * Creation of MRM Schema
const MRMSchema = new mongoose.Schema({
    // Reference to Notification model to store MRM numbers and agendas
    Notification: {
        type: Schema.Types.ObjectId,
        ref: 'Notification',
        required: true
    },
    User: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    // Agenda details for the MRM
    AgendaDetails: [{
       Agenda : {
        type: Schema.Types.ObjectId,
        ref: 'Agenda',
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

// * Creation of model
const MRM = mongoose.model('MRM', MRMSchema);
module.exports = MRM;