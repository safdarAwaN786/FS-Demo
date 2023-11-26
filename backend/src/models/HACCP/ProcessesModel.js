const mongoose = require('mongoose');
const { Schema } = mongoose;
const Department = require('../../models/AccountCreation/DepartmentModel')
const Company = require('../../models/AccountCreation/CompanyModel')
const User = require('../../models/AccountCreation/UserModel');




const ProcessDetailsSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    ProcessNum : {
        type : String
    },
    Description: {
        type: String,
        required: true,
    },
    subProcesses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProcessDetail'
    }]
});

const ProcessDetailModel = mongoose.model('ProcessDetail', ProcessDetailsSchema)


// * Creation of Process Schema
const ProcessSchema = new mongoose.Schema({

    DocumentId: {
        type: String,
        unique: true,
    },
    User: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    Department: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    ProcessName : {
        type : String
    },
    DocumentType: {
        type: String,
        required: true,
        enum: ['Manuals', 'Procedures', 'SOPs', 'Forms']
    },

    ProcessName: {
        type: String
    },

    ProcessDetails: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProcessDetail'
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
    },

    UpdatedBy: {
        type: String
    },

    UpdationDate: {
        type: Date
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

ProcessSchema.pre('save', async function (next) {
    try {
        const department = await Department.findById(this.Department);

        if (!department) {
            throw new Error('Department not found');
        }

        const user = await User.findById(this.User); // Assuming you attach the user object to the request before calling this middleware
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
const Processes = mongoose.model('Processes', ProcessSchema);
module.exports = {Processes, ProcessDetailModel};