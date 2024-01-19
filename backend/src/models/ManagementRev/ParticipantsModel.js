const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator')

// * Creation of Participants Schema
const ParticipantsSchema = new mongoose.Schema({

    Name: {
        type: String
    },
    UserDepartment: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
    },
    ParticipantId: {
        type: String,
        unique: true
    },

    Designation: {
        type: String
    },

    Department: {
        type: String,
    },

    RoleInTeam: {
        type: String
    },

    ContactNo: {
        type: Number
    },

    Email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },

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

ParticipantsSchema.pre('save', async function (next) {
    try {
        const latestParticipant = await this.constructor.findOne(
            {},
            { ParticipantId: 1 },
            { sort: { ParticipantId: -1 } }
        ).exec();

        let nextNumericPart = 1;
        if (latestParticipant) {
            const numericPart = parseInt(latestParticipant.ParticipantId.slice(1), 10); // Update to CreateChecklistId
            nextNumericPart = numericPart + 1;
        }

        this.ParticipantId = 'P' + nextNumericPart.toString().padStart(3, '0'); // Update to CreateChecklistId
        console.log('Generated DocumentId:', this.ParticipantId); // Update to CreateChecklistId
        next();
    } catch (error) {
        next(error);
    }
});

// * Creation of model
const Participants = mongoose.model('Participants', ParticipantsSchema);
module.exports = Participants;