const mongoose = require('mongoose');
const validator = require('validator')
const Schema = mongoose.Schema;

const machinarySchema = new mongoose.Schema({

  machineCode: {
    type: String,
    unique: true,
  },
  UserDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
  },

  machineName: {
    type: String,
    required: true
  },
  machinaryLocation: {
    type: String,
    required: true
  },
  maintenanceFrequency: {
    type: Object,
    required: true,
  },
  maintainanceType: {
    type: String,
    defualt: 'Preventive'
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

machinarySchema.pre('save', async function (next) {
  try {
    if (!this.machineCode) {
      const latestMachineWithCode = await this.constructor
        .findOne({ machineCode: { $ne: null } }, { machineCode: 1 }, { sort: { machineCode: -1 } })
        .exec();

      console.log('Latest machine code:', latestMachineWithCode ? latestMachineWithCode.machineCode : 'No machine code found');

      let nextNumericPart = 1;
      if (latestMachineWithCode && latestMachineWithCode.machineCode) {
        const numericPart = parseInt(latestMachineWithCode.machineCode.slice(1), 10);
        nextNumericPart = numericPart + 1;
      }

      this.machineCode = 'M' + nextNumericPart.toString().padStart(3, '0');
    }
    next();
  } catch (error) {
    next(error);
  }
});

// * Creation of Model
const Machinery = mongoose.model('Machinery', machinarySchema);
module.exports = Machinery;