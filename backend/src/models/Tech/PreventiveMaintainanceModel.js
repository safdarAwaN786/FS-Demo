const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const maintainanceSchema = new Schema({
  maintenanceCode: {
    type: String,
    unique: true,
  },
  Machinery: {
    type: Schema.Types.ObjectId,
    ref: 'Machinery',
  },
  User: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  dateType: {
    type: String,
    required: true
  },
  lastMaintainanceDate: {
    type: Date,
    // required: true,
  },
  nextMaintainanceDate: {
    type: Date,
    // required: true,
  },
  natureOfFault: {
    type: String,
    required: true,
  },
  rootCause: {
    type: String,
    required: true,
  },
  detailOfWork: {
    type: String,
    required: true,
  },
  replacement: {
    type: String,
    required: true
  },
  uploadImage: {
    type: String,
    required: true,
  },
  generateCertificate: {
    type: String,
  },
  SubmitBy: {
    type: String
  },
  SubmitDate: {
    type: Date
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

maintainanceSchema.pre('save', async function (next) {
  try {
    if (!this.maintenanceCode) {
      const latestMaintenanceWithCode = await this.constructor
        .findOne({ maintenanceCode: { $ne: null } }, { maintenanceCode: 1 }, { sort: { maintenanceCode: -1 } })
        .exec();

      console.log('Latest machine code:', latestMaintenanceWithCode ? latestMaintenanceWithCode.maintenanceCode : 'No machine code found');

      let nextNumericPart = 1;
      if (latestMaintenanceWithCode && latestMaintenanceWithCode.maintenanceCode) {
        const numericPart = parseInt(latestMaintenanceWithCode.maintenanceCode.slice(1), 10);
        nextNumericPart = numericPart + 1;
      }

      this.maintenanceCode = 'M' + nextNumericPart.toString().padStart(3, '0');
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Maintainance = mongoose.model('PreventiveMaintainance', maintainanceSchema);
module.exports = Maintainance;