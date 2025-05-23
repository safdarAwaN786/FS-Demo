const mongoose = require('mongoose');
const { Schema } = mongoose;
const DepartmentModel = require('../../models/AccountCreation/DepartmentModel');
const UserModel = require('../../models/AccountCreation/UserModel');
const Company = require('../../models/AccountCreation/CompanyModel');

const HazardSchema = new mongoose.Schema({
    Process: {
        type: Schema.Types.ObjectId,
        ref: 'ProcessDetails'
    },
    type: {
        type: String,
        enum: ['Biological', 'Chemical', 'Physical', 'Halal', 'Allergen'],
        required: true,
    },
    Description: {
        type: String,
    },
    ControlMeasures: {
        type: String,
    },
    Occurence: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
    },
    Severity: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
    },
    SignificanceLevel: {
        type: Number,
    },
});

const HazardModel = mongoose.model('Hazard', HazardSchema);


// * Creation of ConductHaccp Schema
const ConductHaccpSchema = new mongoose.Schema({

    DocumentId: {
        type: String,
        unique: true,
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

    Process: {
        type: Schema.Types.ObjectId,
        ref: 'Processes',
        required: true
    },

    Teams: [{
        type: Schema.Types.ObjectId,
        ref: 'HaccpTeam',
        required: true
    }],

    Hazards: [{
        type : Schema.Types.ObjectId,
        ref : 'Hazard'
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

    DisapprovedBy: {
        type: String,
    },

    DisapprovalDate: {
        type: Date,

    },

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

ConductHaccpSchema.pre('save', async function (next) {
    try {
        const department = await DepartmentModel.findById(this.Department).populate('Company');

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
const ConductHaccp = mongoose.model('ConductHaccp', ConductHaccpSchema);
module.exports = {ConductHaccp, HazardModel};