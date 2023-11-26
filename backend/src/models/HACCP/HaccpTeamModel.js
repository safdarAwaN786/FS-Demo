const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { Schema } = mongoose;
const Company = require('../../models/AccountCreation/CompanyModel');
const Department = require('../../models/AccountCreation/DepartmentModel');
const UserModel = require('../../models/AccountCreation/UserModel');

// * Creation of HaccpTeam Schema
const HaccpTeamSchema = new mongoose.Schema({

    DocumentId: {
        type: String,
        unique: true,
    },

    Department: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    User: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    DocumentType: {
        type: String,
        required: true,
        enum: ['Manuals', 'Procedures', 'SOPs', 'Forms']
    },

    TeamName: {
        type: String
    },
    TeamMembers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    RevisionNo: {
        type: Number,
        default: 0
    },

    Status: {
        type: String,
        enum: ['Pending', 'Approved', 'Disapproved'],
        default: 'Pending'
    },

    Reason: {
        type: String
    },

    CreatedBy: {
        type: String,
    },

    CreationDate: {
        type: Date,
        default: Date.now
    },

    ApprovedBy: {
        type: String,
    },

    ApprovalDate: {
        type: Date,

    },
    DisapproveBy: {
        type: String,
    },

    DisapprovalDate: {
        type: Date,
    },



}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

HaccpTeamSchema.pre('save', async function (next) {
    try {
        const department = await Department.findById(this.Department);

        if (!department) {
            throw new Error('Department not found');
        }

        const user = await UserModel.findById(this.User); // Assuming you attach the user object to the request before calling this middleware
        if (!user) {
            throw new Error('User not found');
        }

        const company = await Company.findById(user.Company);
        if (!company) {
            throw new Error('Company not found');
        }

        const documentTypeNumber = { 'Manuals': 1, 'Procedures': 2, 'SOPs': 3, 'Forms': 4 }[this.DocumentType];
        if (!documentTypeNumber) {
            throw new Error('Invalid Document Type');
        }

        const latestDocument = await this.constructor.findOne(
            {},
            { DocumentId: 1 },
            { sort: { DocumentId: -1 } }
        ).exec();
        let nextNumericPart = 1;
        if (latestDocument) {
            const numericPart = parseInt(latestDocument.DocumentId.slice(1), 10);
            if (!isNaN(numericPart)) {
                nextNumericPart = numericPart + 1;
            }
        }

        this.DocumentId = `${company.ShortName}/${department.ShortName}/${documentTypeNumber}/${nextNumericPart.toString().padStart(3, '0')}`;
        console.log('Generated DocumentId:', this.DocumentId);
        next();
    } catch (error) {
        next(error);
    }
});







// * Creation of model
const HaccpTeam = mongoose.model('HaccpTeam', HaccpTeamSchema);
module.exports = HaccpTeam;