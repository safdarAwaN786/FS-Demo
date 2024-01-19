const mongoose = require('mongoose');
const { Schema } = mongoose;
const DepartmentModel = require('../../models/AccountCreation/DepartmentModel');
const UserModel = require('../../models/AccountCreation/UserModel');
const Company = require('../../models/AccountCreation/CompanyModel');

const PlanSchema = new mongoose.Schema({
    Decision : {
        type : Schema.Types.ObjectId,
        ref : 'Decision'
    },
    HazardToControl: {
        type: String
    },

    ControlMeasures: {
        type: String
    },

    JustificationLink: {
        type: String
    },

    CorrectiveAction: {
        type: String
    },

    MonitoringRef: {
        type: String
    },

    VerificationRef: {
        type: String
    },

    ProcessLimit: {

        TargetRange: {
            type: String
        },

        ActionPoint: {
            type: String
        },

        CriticalCtrlPoint: {
            type: String
        },

    },

    MonitoringPlan: {

        Who: {
            type: String
        },

        When: {
            type: String
        },

        What: {
            type: String
        },

        How: {
            type: String
        }
    },

    VerificationPlan: {

        Who: {
            type: String
        },

        When: {
            type: String
        },

        What: {
            type: String
        },

        How: {
            type: String
        }

    }
})

const PlanModel = mongoose.model('Plan', PlanSchema);

// * Creation of FoodSafety Schema
const FoodSafetySchema = new mongoose.Schema({

    DocumentId: {
        type: String,
        unique: true,
    },
    UserDepartment : {
        type : Schema.Types.ObjectId,
        ref : 'Department'
    },

    Department: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },

    DocumentType: {
        type: String,
        required: true,
        enum: ['Manuals', 'Procedures', 'SOPs', 'Forms']
    },

    DecisionTree: {
        type: Schema.Types.ObjectId,
        ref: 'DecisionTree',
    },

    Plans : [{
        type : Schema.Types.ObjectId,
        ref : 'Plan'
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

    DisapprovalBy: {
        type: String,
    },

    DisapprovalDate: {
        type: Date,

    },

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

FoodSafetySchema.pre('save', async function (next) {
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
const FoodSafety = mongoose.model('FoodSafety', FoodSafetySchema);
module.exports = {FoodSafety, PlanModel};