const mongoose = require('mongoose');
const { Schema } = mongoose;
const DepartmentModel = require('../../models/AccountCreation/DepartmentModel');
const UserModel = require('../../models/AccountCreation/UserModel');
const Company = require('../../models/AccountCreation/CompanyModel');

// Question schema containing different question types
const QuestionSchema = new mongoose.Schema({

  questionType: {
    type: String,
    enum: ['Checkbox', 'Multiplechoice', 'ShortText', 'LongText', 'Time', 'Date', 'Dropdown', 'Multiplechoicegrid', 'Checkboxgrid', 'Linearscale'],
    required: true,
  },

  questionText: {
    type: String,
    required: true,
  },

  options: {
    type: Array,
  },

  rows: {
    type: Array
  },

  columns: {
    type: Array
  },

  minValue: {
    type: Number
  },

  maxValue: {
    type: Number
  },

  Required: {
    type: Boolean,
    default: false
  }

});

const QuestionModel = mongoose.model('Question', QuestionSchema);

// Form schema
const FormSchema = new mongoose.Schema({

  FormId: {
    type: String,
    unique: true,
  },

  FormName: {
    type: String,
    required: true,
  },

  FormDescription: {
    type: String,
    required: true,
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
  MaintenanceFrequency: {
    type: String,
    required: true,
  },

  questions: [{
    type : Schema.Types.ObjectId,
    ref : 'Question'
  }],
  SendToDepartments : [{
    type : Schema.Types.ObjectId,
    ref : 'Department'
  }],

  RevisionNo: {
    type: Number,
    default: 0
  },

  Status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Rejected', 'Approved', 'Disapproved'],
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

  ReviewedBy: {
    type: String,
  },

  ReviewDate: {
    type: Date,
  },

  RejectedBy: {
    type: String,
  },

  RejectionDate: {
    type: Date,
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

FormSchema.pre('save', async function (next) {
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
      { FormId: 1 },
      { sort: { FormId: -1 } }
    ).exec();

    let nextNumericPart = 1;
    if (latestDocument) {
      const parts = latestDocument.FormId.split('/');
      nextNumericPart = parseInt(parts[3]) + 1;
    }
    console.log(nextNumericPart);
    this.FormId = `${department.Company.ShortName}/${department.ShortName}/${documentTypeNumber}/${nextNumericPart.toString().padStart(3, '0')}`;
    console.log('Generated FormId:', this.FormId);
    next();
  } catch (error) {
    next(error);
  }
});


// Model for the form schema
const ListOfForms = mongoose.model('Form', FormSchema);
module.exports = {ListOfForms, QuestionModel};