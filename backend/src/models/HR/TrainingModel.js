const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// * Creation of Training Schema
const trainingSchema = new Schema({

  TrainingCode: {
    type: String,
    unique: true,
  },

  TrainingName: {
    type: String,
    required: true
  },

  Description: {
    type: String,
    required: true
  },
  UserDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
  },

  EvaluationCriteria: {
    type: String,
    required: true
  },

  TrainingMaterial: {
    type: String
  },

  CreatedBy: {
    type: String
  },

  CreationDate: {
    type: Date
  },

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

trainingSchema.pre('save', async function (next) {
  try {
    const latestTraining = await this.constructor.findOne(
      {},
      { TrainingCode: 1 },
      { sort: { TrainingCode: -1 } }
    ).exec();

    let nextNumericPart = 1;
    if (latestTraining) {
      const numericPart = parseInt(latestTraining.TrainingCode.slice(2), 10);
      nextNumericPart = numericPart + 1;
    }

    this.TrainingCode = 'TR' + nextNumericPart.toString().padStart(3, '0');
    next();
  } catch (error) {
    next(error);
  }
});

// * Creation of Model
const Training = mongoose.model('Training', trainingSchema);
module.exports = Training;