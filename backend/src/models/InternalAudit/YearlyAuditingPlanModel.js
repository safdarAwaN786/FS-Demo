const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// * Creation of YearlyAuditingPlan Schema
const yearlyAuditingPlanSchema = new Schema({

  Year: {
    type: Number,
    required: true
  },
  User : {
    type : Schema.Types.ObjectId,
    ref : 'User'
  },
  Selected: [{
    Process: {
      type: Schema.Types.ObjectId,
      ref: 'ProcessOwner'
    },
    monthNames: []
  }],

  CreatedBy: {
    type: String
  },

  CreationDate: {
    type: Date
  }

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// * Creation of Model
const YearlyAuditingPlan = mongoose.model('YearlyAuditingPlan', yearlyAuditingPlanSchema);
module.exports = YearlyAuditingPlan;