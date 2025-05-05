const mongoose = require('mongoose');
const { Schema } = mongoose;

// * Agenda Schema Definition
const AgendaSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    Description: {
        type: String
    }
});

// * Agenda Model Creation
const Agenda = mongoose.model('Agenda', AgendaSchema);

// * Notification Schema Definition
const NotificationSchema = new Schema({
    Venue: {
        type: String
    },

    UserDepartment: {
        type: Schema.Types.ObjectId,
        ref: 'Department', // Ensure this model exists as well
    },

    MRMNo: {
        type: String
    },

    Agendas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agenda' // Reference to Agenda model
    }],

    Date: {
        type: Date
    },

    Time: {
        type: String
    },

    Participants: [{
        type: Schema.Types.ObjectId,
        ref: 'Participants', // Ensure this model exists as well
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

// * Notification Model Creation
const Notification = mongoose.model('Notification', NotificationSchema);

// Export models
module.exports = { Notification, Agenda };
