const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const calibrationSchema = new Schema({
  Equipment: {
    type: Schema.Types.ObjectId,
    ref: 'Equipment',
  },
  UserDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
  },
  CR: {
    type: String,
    required: true
  },
  callibrationCode: {
    type: String,
    unique: true
  },
  lastCallibrationDate: {
    type: Date,
    required: true,
  },
  dateType: {
    type: String,
    required: true
  },
  callibrationType: {
    type: String,
    enum: ['Internal', 'External'],
    required: true
  },
  measuredReading: {
    firstReading: {
      type: Number,
      required: true,
    },
    secondReading: {
      type: Number,
      required: true,
    },
    thirdReading: {
      type: Number,
      required: true,
    },
  },
  nextCallibrationDate: {
    type: Date,
    required: true,
  },
  comment: {
    type: String,
    required: true
  },
  internal: {
    ImageURL: {
      type: String,
    },
    CertificateURL: {
      type: String,
    },
    masterCertificateURL: {
      type: String,
    },
  },
  external: {
    companyName: {
      type: String,
    },
    masterReference: {
      type: String,
    },
    exCertificateURL: {
      type: String,
    },
  },

  CaliberateBy:{
    type: String
  },

  CaliberatDate: {
    type: Date
  },

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

calibrationSchema.pre('save', async function (next) {
  try {
    if (!this.callibrationCode) {
      const latestCallibrationWithCode = await this.constructor
        .findOne({ callibrationCode: { $ne: null } }, { callibrationCode: 1 }, { sort: { callibrationCode: -1 } })
        .exec();

      console.log('Latest callibration code:', latestCallibrationWithCode ? latestCallibrationWithCode.callibrationCode : 'No callibration code found');

      let nextNumericPart = 1;
      if (latestCallibrationWithCode && latestCallibrationWithCode.callibrationCode) {
        const numericPart = parseInt(latestCallibrationWithCode.callibrationCode.slice(1), 10);
        nextNumericPart = numericPart + 1;
      }

      this.callibrationCode = 'C' + nextNumericPart.toString().padStart(3, '0');
    }
    next();
  } catch (error) {
    next(error);
  }
});


const Calibration = mongoose.model('CalibrationRecord', calibrationSchema);
module.exports = Calibration;
