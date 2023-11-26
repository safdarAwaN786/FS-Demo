const mongoose = require('mongoose');
const { Schema } = mongoose;

const AgendaSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Description: {
        type: String
    }
})

const Agenda = mongoose.model('Agenda', AgendaSchema);


// * Creation of Notification Schema
const NotificationSchema = new mongoose.Schema({

    Venue: {
        type: String
    },

    User: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    MRMNo: {
        type: String
    },

    Agendas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agenda'
    }],

    Date: {
        type: Date
    },

    Time: {
        type: String
    },

    Participants: [{
        type: Schema.Types.ObjectId,
        ref: 'Participants',
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
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },

});

// * Creation of model
const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = {Notification,  Agenda };