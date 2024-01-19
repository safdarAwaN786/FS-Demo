const mongoose = require('mongoose');
const validator = require('validator')
const Schema = mongoose.Schema;

const equipmentSchema = new mongoose.Schema({

    equipmentCode:{
        type: String,
        unique: true,
    },
    UserDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    equipmentName:{
        type:String,
        required:true
    },
    equipmentLocation:{
        type:String,
        required:true
    },
    Range:{
      type:Number,
      Required:true
    },
    callibration:{
      type:Object,
      required:true
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

equipmentSchema.pre('save', async function (next) {
  try {
    if (!this.equipmentCode) {
      const latestEquipmentCode = await this.constructor
        .findOne({ equipmentCode: { $ne: null } }, { equipmentCode: 1 }, { sort: { equipmentCode: -1 } })
        .exec();
      
      console.log('Latest Equipment code:', latestEquipmentCode ? latestEquipmentCode.equipmentCode : 'No Equipment code found');

      let nextNumericPart = 1;
      if (latestEquipmentCode && latestEquipmentCode.equipmentCode) {
        const numericPart = parseInt(latestEquipmentCode.equipmentCode.slice(2), 10);
        nextNumericPart = numericPart + 1;
      }

      this.equipmentCode = 'MD' + (nextNumericPart).toString().padStart(3, '0');
    }
    next();
  } catch (error) {
    next(error);
  }
});

// * Creation of Model
const Equipment = mongoose.model('Equipment', equipmentSchema);
module.exports = Equipment;