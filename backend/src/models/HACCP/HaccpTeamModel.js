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
    teamName : {
        type : String,
        required : true
    },

    Department: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    UserDepartment: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
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
    DisapprovedBy: {
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
        const department = await Department.findById(this.Department).populate('Company');

        if (!department) {
            throw new Error('Department not found');
        }

        const documentTypeNumber = { 'Manuals': 1, 'Procedures': 2, 'SOPs': 3, 'Forms': 4 }[this.DocumentType];
        if (!documentTypeNumber) {
            throw new Error('Invalid Document Type');
        }

        const latestDocument = await this.constructor.findOne(
            { Department: this.Department, DocumentType: this.DocumentType },
            { DocumentId: 1 },
            { sort: { DocumentId: -1 } }
        ).exec();

        let nextNumericPart = 1;
        if (latestDocument) {
            const parts = latestDocument.DocumentId.split('/');
            nextNumericPart = parseInt(parts[3]) + 1;
        }

        this.DocumentId = `${department.Company.ShortName}/${department.ShortName}/${documentTypeNumber}/${nextNumericPart.toString().padStart(3, '0')}`;
        console.log('Generated DocumentId:', this.DocumentId);
        next();
    } catch (error) {
        next(error);
    }
});

// * Creation of model
const HaccpTeam = mongoose.model('HaccpTeam', HaccpTeamSchema);
module.exports = HaccpTeam;