const mongoose = require('mongoose');
const { Schema } = mongoose;
const DepartmentModel = require('../../models/AccountCreation/DepartmentModel');
const UserModel = require('../../models/AccountCreation/UserModel');
const Company = require('../../models/AccountCreation/CompanyModel');

// * Creation of CreateChecklists Schema
const ChecklistQuestionSchema = new mongoose.Schema({

  questionText: {
    type: String,
    required: true,
  },

  ComplianceType: {
    type: String,
    enum: ['Yes/No', 'GradingSystem', 'Good/Fair/Poor', 'Safe/AtRisk', 'Pass/Fail', 'Compliant/NonCompliant', 'Conform/MinorNonComform/MajorNonConform/CriticalNonConform/Observation'],
    required: true,
  },

  Required: {
    type: Boolean,
    default: false
  }

});

const ChecklistQuestionModel = mongoose.model('ChecklistQuestion', ChecklistQuestionSchema);

// Form schema
const ChecklistSchema = new mongoose.Schema({

  ChecklistId: {
    type: String,
    unique: true,
  },

  DocumentType: {
    type: String,
    required: true,
    enum: ['Manuals', 'Procedures', 'SOPs', 'Forms']
  },

  Department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },

  ChecklistQuestions: [{
    type : Schema.Types.ObjectId,
    ref : 'ChecklistQuestion'
  }],

  RevisionNo: {
    type: Number,
    default: 0
  },

  UserDepartment : {
    type : Schema.Types.ObjectId,
    ref : 'Department'
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

  DisapprovedBy: {
    type: String,
  },

  DisapprovalDate: {
    type: Date,
  },

  ApprovedBy: {
    type: String,
  },

  ApprovalDate: {
    type: Date,
  },

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

ChecklistSchema.pre('save', async function (next) {
  try {
    const department = await DepartmentModel.findById(this.Department).populate('Company');

    if (!department) {
      throw new Error('Department not found');
    }

    const documentTypeNumber = { 'Manuals': 1, 'Procedures': 2, 'SOPs': 3, 'Forms': 4 }[this.DocumentType];
    if (!documentTypeNumber) {
      throw new Error('Invalid Document Type');
    }

    const latestChecklist = await this.constructor.findOne(
      { Department: this.Department, DocumentType: this.DocumentType },
      { ChecklistId: 1 },
      { sort: { ChecklistId: -1 } }
    ).exec();

    let nextNumericPart = 1;
    if (latestChecklist) {
      const parts = latestChecklist.ChecklistId.split('/');
      nextNumericPart = parseInt(parts[3]) + 1;
    }

    this.ChecklistId = `${department.Company.ShortName}/${department.ShortName}/${documentTypeNumber}/${nextNumericPart.toString().padStart(3, '0')}`;
    console.log('Generated ChecklistId:', this.ChecklistId);
    next();
    
  } catch (error) {
    next(error);
  }
});

// * Creation of model
const Checklists = mongoose.model('Checklist', ChecklistSchema);
module.exports = {Checklists, ChecklistQuestionModel};