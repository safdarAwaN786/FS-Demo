const mongoose = require('mongoose');
const { Schema } = mongoose;
const DepartmentModel = require('../../models/AccountCreation/DepartmentModel');
const UserModel = require('../../models/AccountCreation/UserModel');
const Company = require('../../models/AccountCreation/CompanyModel');

const decisionSchema = new mongoose.Schema({
    Hazard: {
        type: Schema.Types.ObjectId,
        ref : 'Hazard'
    },

    Q1: {
        type: Boolean,
        default : null
    },

    Q1A: {
        type: Boolean,
        default : null
    },

    Q2: {
        type: Boolean,
        default : null
    },

    Q3: {
        type: Boolean,
        default : null
    },

    Q4: {
        type: Boolean,
        default : null
    },

})

const DecisionModel = mongoose.model('Decision', decisionSchema);

// * Creation of DecisionTree Schema
const DecisionTreeSchema = new mongoose.Schema({

    DocumentId: {
        type: String,
        unique: true,
    },

    Department: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    UserDepartment : {
        type : Schema.Types.ObjectId,
        ref : 'Department'
    },

    DocumentType: {
        type: String,
        required: true,
        enum: ['Manuals', 'Procedures', 'SOPs', 'Forms']
    },

    ConductHaccp: {
        type: Schema.Types.ObjectId,
        ref: 'ConductHaccp',
    },

    Decisions : [{
        type : Schema.Types.ObjectId,
        ref : 'Decision'
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
        type: String
    },

    DisapprovalDate: {
        type: Date
    }

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

DecisionTreeSchema.pre('save', async function (next) {
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

        this.DocumentId = `${department.Company.ShortName}/${department.ShortName}/${documentTypeNumber}/${nextNumericPart.toString().padStart(3, '0')}`;
        console.log('Generated DocumentId:', this.DocumentId);
        next();
    } catch (error) {
        next(error);
    }
});

// * Creation of model
const DecisionTree = mongoose.model('DecisionTree', DecisionTreeSchema);
module.exports = {DecisionTree, DecisionModel};