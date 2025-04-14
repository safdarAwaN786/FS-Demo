const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;

// * Creation of User Schema
const TeamMemberSchema = new mongoose.Schema({

  


    UserId: {
        type: String
    },

    Name: {
        type: String
    },

    Designation: {
        type: String
    },

    Department: {
        type: String
    },



 

    CreatedBy: {
        type: String
    },

    CreationDate: {
        type: Date
    },


    Email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    isMember: {
        type: Boolean,
        required: true,
        default: false
    },

    Education: {
        type: String
    },

    Experience: {
        type: String
    },

    RoleInTeam: {
        type: String
    },

    TrainingsAttended: {
        type: String
    },

    TrainingDate: {
        type: Date
    },

    Document: {
        type: String
    },

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

TeamMemberSchema.pre('save', async function (next) {
    try {
        const latestUser = await this.constructor.findOne(
            {},
            { UserId: 1 },
            { sort: { UserId: -1 } }
        ).exec();

        let nextNumericPart = 1;

        if (latestUser) {
            const numericPart = parseInt(latestUser.UserId?.slice(1), 10);
            if (!isNaN(numericPart)) {
                nextNumericPart = numericPart + 1;
            }
        }

        this.UserId = 'U' + nextNumericPart.toString().padStart(3, '0');
        next();

    } catch (error) {
        next(error);
    }
});

// * Creation of model
const haccpTeamMember = mongoose.model('haccpTeamMember', TeamMemberSchema);
module.exports = haccpTeamMember;