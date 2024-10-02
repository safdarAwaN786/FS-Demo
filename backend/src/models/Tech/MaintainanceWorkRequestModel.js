const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workRequestSchema = new Schema({
  MWRId: {
    type: String,
    unique: true,
  },

  Machinery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machinery'
  },
  UserDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
  },

  Date: {
    type: Date,
  },

  Time: {
    type: Date,
  },
  Area: {
    type: String,
    ref: 'Machinery.machinaryLocation'
  },
  Priority: {
    type: String,
    required: true,
  },
  Discipline: {
    type: Array,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  SpecialInstruction: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
    required: true,
  },
  StartTime: {
    type: Date,
  },
  EndTime: {
    type: Date,
  },
  Status: {
    type: String,
    enum: ['Approved', 'Completed', 'Pending', 'Rejected'],
    default: 'Pending',
  },
  JobAssigned: {
    type: String,
  },
  Designation: {
    type: String,
  },
  DetailOfWork: {
    type: String,
  },
  Department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  Reason: {
    type: String,
  },
  CreatedBy: {
    type: String
  },
  CreationDate: {
    type: Date
  },
  RejectedBy: {
    type: String
  },
  RejectionDate: {
    type: Date
  },
  AcceptedBy: {
    type: String
  },
  AcceptionDate: {
    type: Date
  },
  CompletedBy: {
    type: String
  },
  CompletionDate: {
    type: Date
  }

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

workRequestSchema.pre('save', async function (next) {
  try {
    if (!this.MWRId) {
      let latestMWR
      latestMWR = await this.constructor
        .findOne({ MWRId: { $ne: null } }, { MWRId: 1 }, { sort: { MWRId: -1 } })
        .exec();

      console.log('Latest MWR code:', latestMWR ? latestMWR.MWRId : 'No MWR code found');

      let nextNumericPart = 1;
      if (latestMWR && latestMWR.MWRId) {
        const numericPart = parseInt(latestMWR.MWRId.slice(3), 10);

        // Check if numericPart is a valid number.
        if (isNaN(numericPart)) {
          console.error('Unable to parse numeric part of latest MWRId:', latestMWR.MWRId);
          next(new Error('Failed to generate a unique MWRId due to unexpected format of latest MWRId'));
          return;
        }

        nextNumericPart = numericPart + 1;
      }

      this.MWRId = 'MWR' + nextNumericPart.toString().padStart(3, '0');
    }
    next();
  } catch (error) {
    next(error);
  }
});

const WorkRequest = mongoose.model('WorkRequest', workRequestSchema);
module.exports = WorkRequest;