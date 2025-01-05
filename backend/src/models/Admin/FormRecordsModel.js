const mongoose = require('mongoose');
const { Schema } = mongoose;

const FormRecordsSchema = new mongoose.Schema({

  FormRecordId: {
    type: String,
    unique: true
  },
  UserDepartment : {
    type : Schema.Types.ObjectId,
    ref : 'Department'
  },
  Form : {
    type : Schema.Types.ObjectId,
    ref : 'Form'
  },
  FillBy: {
    type: String
  },
  VerifiedBy: {
    type: String
  },
  Status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  FillDate: {
    type: Date,
    default: Date.now,
  },
  VerificationDate: {
    type: Date
  },

  Comment: {
    type: String,
  },

  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },

      CheckboxesAnswers: {
        type: Array
      },

      multipleChoiceAnswer: {
        type: String
      },

      shortTextAnswer: {
        type: String,
      },

      longTextAnswer: {
        type: String
      },

      checkboxGridAnswers: {
        type: Array
      },

      multipleChoiceGridAnswers: {
        type: Array
      },

      dropdownAnswer: {
        type: String,
      },
      

      timeAnswer: {
        time: Date,
      },

      dateAnswer: {
        date: Date,
      },

      linearScaleAnswer: {
        type: Number,
      },
    },
  ],
});

FormRecordsSchema.pre('save', async function (next) {
  try {
    const latestRecord = await this.constructor.findOne(
      {},
      { FormRecordId: 1 },
      { sort: { FormRecordId: -1 } }
    ).exec();

    let nextNumericPart = 1;
    if (latestRecord) {
      const numericPart = parseInt(latestRecord.FormRecordId.slice(2), 10); // Update to CreateChecklistId
      nextNumericPart = numericPart + 1;
    }

    this.FormRecordId = 'FR' + nextNumericPart.toString().padStart(3, '0'); // Update to CreateChecklistId
    console.log('Generated DocumentId:', this.FormRecordIdId); // Update to CreateChecklistId
    next();
  } catch (error) {
    next(error);
  }
});

const FormRecords = mongoose.model('FormRecords', FormRecordsSchema);
module.exports = FormRecords;