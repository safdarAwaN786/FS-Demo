const mongoose = require('mongoose');
const { Schema } = mongoose;
const DepartmentModel = require('../../models/AccountCreation/DepartmentModel');
const UserModel = require('../../models/AccountCreation/UserModel');
const Company = require('../../models/AccountCreation/CompanyModel');

// * Creation of Document Schema
const DocumentSchema = new mongoose.Schema({

  DocumentId: {
    type: String,
    unique: true
  },
  UserDepartment : {
    type : Schema.Types.ObjectId,
    ref : 'Department'
  },

  DocumentTitle: {
    type: String,
    required: true,
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

  ReviewedBy: {
    type: String,
  },

  ReviewDate: {
    type: Date,

  },


  ApprovedBy: {
    type: String,
  },

  ApprovalDate: {
    type: Date,

  },

  EditorData: {
    type: String
  },

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

DocumentSchema.pre('save', async function (next) {
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
const ListOfDocuments = mongoose.model('Document', DocumentSchema);
module.exports = ListOfDocuments;