const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// * Creation of MonthlyAuditingPlan Schema
const monthlyAuditingPlanSchema = new mongoose.Schema({

  ActualDate: {
    type: Date,
  },

  AuditResultStatus: {
    type: String,
    enum: ['Conducted', 'Not Conducted'],
    default: 'Not Conducted'
  },
  
  UserDepartment : {
    type : Schema.Types.ObjectId,
    ref : 'Department'
  },

  Date: {
    type: Number,
    required: true
  },

  Month: {
    type: String,
    required: true,
  },

  Year: {
    type: String,
    required: true
  },

  Department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },

  ProcessOwner: {
    type: Schema.Types.ObjectId,
    ref: 'ProcessOwner'
  },

  LeadAuditor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  TeamAuditor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  YearlyAuditingPlan: {
    type: Schema.Types.ObjectId,
    ref: 'YearlyAuditingPlan'
  },

  CreatedBy: {
    type: String
  },

  CreationDate: {
    type: Date
  }

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

monthlyAuditingPlanSchema.pre('save', function (next) {
  if (!this.Auditor || !this.Process) {
    this.Auditor = [];
    this.Process = [];
  }
  next();
});

// * Creation of Model
const MonthlyAuditingPlan = mongoose.model('MonthlyAuditingPlan', monthlyAuditingPlanSchema);
module.exports = MonthlyAuditingPlan;