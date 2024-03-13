const mongoose = require('mongoose');
const { Schema } = mongoose;

// * Creation of ChangeRequest Schema
const ChangeRequestSchema = new mongoose.Schema({

  ChangeRequestId: {
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

  PageNo: {
    type: Number
  },

  ParagraphNo: {
    type: Number
  },

  LineNo: {
    type: Number
  },

  ReasonForChange: {
    type: String
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

  Document: {
    type: Schema.Types.ObjectId,
    refPath: 'documentModel', 
    required: true
  },

  documentModel: {
    type: String,
    required: true,
    enum: ['Document', 'UploadDocuments']
  },

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// ? Pre-save middleware to generate the next Change Request Code
ChangeRequestSchema.pre('save', async function (next) {
  try {
    const latestChangeRequest = await this.constructor.findOne(
      {},
      { ChangeRequestId: 1 },
      { sort: { ChangeRequestId: -1 } }
    ).exec();

    let nextNumericPart = 1;
    if (latestChangeRequest) {
      const numericPart = parseInt(latestChangeRequest.ChangeRequestId.slice(2), 10); // Slice from index 2 to remove 'CR'
      if (!isNaN(numericPart)) {
        nextNumericPart = numericPart + 1;
      }
    }

    this.ChangeRequestId = 'CR' + nextNumericPart.toString().padStart(3, '0');
    next();
  } catch (error) {
    next(error);
  }
});

// * Creation of model
const ChangeRequest = mongoose.model('ChangeRequest', ChangeRequestSchema);
module.exports = ChangeRequest;