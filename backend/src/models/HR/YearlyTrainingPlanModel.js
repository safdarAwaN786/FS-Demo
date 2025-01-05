const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// * Creation of YearlyTrainingPlan Schema
const yearlyTrainingPlanSchema = new Schema({

  UserDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
  },

  Year: {
    type: Number,
    required: true
  },

  Month: [{
    MonthName: {
      type: String,
      required: true
    },

    Trainings: [{
      Training: {
        type: Schema.Types.ObjectId,
        ref: 'Training'
      },

      WeekNumbers: [{
        type: Number,
        required: true
      }]
    }]
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
const YearlyTrainingPlan = mongoose.model('YearlyTrainingPlan', yearlyTrainingPlanSchema);
module.exports = YearlyTrainingPlan;