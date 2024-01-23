const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// * Creation of MonthlyTrainingPlan Schema
const monthlyTrainingPlanSchema = new mongoose.Schema({

  Assigned: {
    type: Boolean,
    default: false
  },
  UserDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
  },
  ActualDate: {
    type: Date,
  },

  TrainingResultStatus: {
    type: String,
    enum: ['Conducted', 'Not Conducted'],
    default: 'Not Conducted'
  },

  Date: {
    type: Number
  },

  Year: {
    type: String,
    required: true,
  },

  Month: {
    type: String,
    required: true,
  },

  Time: {
    type: String,
    required: true
  },

  DepartmentText: {
    type: String,
    required: true
  },

  Training: {
    type: Schema.Types.ObjectId,
    ref: 'Training'
  },

  Trainer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  Employee: [{
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  }],

  YearlyTrainingPlan: {
    type: Schema.Types.ObjectId,
    ref: 'YearlyTrainingPlan'
  },

  Venue: {
    type: String,
    required: true
  },

  Duration: {
    type: String,
    required: true
  },

  Images: [],

  InternalExternal: {
    type: String,
    enum: ['Internal', 'External'],
    required: true
  },

  CreatedBy: {
    type: String
  },

  CreationDate: {
    type: Date
  },

  AssignedBy: {
    type: String
  },

  AssignedDate: {
    type: Date
  }

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// * Define the getMonthlyTrainings method within the schema
monthlyTrainingPlanSchema.statics.getMonthlyTrainings = async function (
  year,
  monthName
) {
  try {
    const monthlyTrainings = await this.find({
      Year: year,
      Month: monthName,
    }).populate('Training Trainer Employee'); // Populate relevant fields

    return monthlyTrainings;
  } catch (error) {
    throw error;
  }
};

// * Properly initialized the Attendees property for the Trainer model.
monthlyTrainingPlanSchema.pre('save', function (next) {
  if (!this.Trainer || !this.Training || !this.Employee) {
    this.Trainer = [];
    this.Training = [];
    this.Employee = [];
  }
  next();
});

// * Creation of Model
const MonthlyTrainingPlan = mongoose.model('MonthlyTrainingPlan', monthlyTrainingPlanSchema);
module.exports = MonthlyTrainingPlan;