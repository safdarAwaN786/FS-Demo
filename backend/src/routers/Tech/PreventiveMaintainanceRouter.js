const express = require('express');
const router = express.Router();
const Maintainance = require('../../models/Tech/PreventiveMaintainanceModel');
const Machine = require('../../models/Tech/MachineryModel');
const fs = require('fs');
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { error } = require('console');
const upload = multer();
const authMiddleware = require('../../middleware/auth');


// router.use(authMiddleware);

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

const uploadToCloudinary = (buffer) => {
  try {

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            reject(new Error('Failed to upload file to Cloudinary'));
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.log('error inside uploadation' + error);
  }
};

// * POST route to add a Calibration Record
router.post('/addPreventiveMaintaince/:MachineId',  upload.fields([{ name: 'Image' }]), async (req, res) => {
  try {

    console.log('Received request to add preventive maintenance.');

    const machineId = req.params.MachineId;
    if (!machineId) {
      return res.status(404).json({ error: 'Please Provide Machine ID' });
    }

    console.log('Checking if machine exists...');
    const machine = await Machine.findById({ _id: machineId });
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    console.log('Machine found.');

    let {
      maintenanceType,
      natureOfFault,
      rootCause,
      dateType,
      detailOfWork,
      replacement,
      generateCertificate
    } = req.body;

    if (!natureOfFault || !dateType || !rootCause || !replacement || !detailOfWork) {
      console.log("fields missing");
      return res.status(400).json({ error: 'Required fields missing.' });
    }

    console.log('Validating maintenance frequency...');
    maintenanceType = maintenanceType.toLowerCase();
    let imageUrl;
    if (req.files['Image']) {
      
      
      console.log('Uploading image...');
      
      const imageFile = req.files['Image'][0];
      console.log(imageFile);
      
      imageUrl = await uploadToCloudinary(imageFile.buffer).then((result) => {
        return (result.secure_url)
      }).catch((err) => {
        console.log(err);
      })
    }

    

    let nextDate;
    console.log(dateType);
    switch (dateType) {
      case 'Daily':
        nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1);
        console.log('case daily');
        break;
      case 'Weekly':
        nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 7);
        console.log("case weekly");
        break;
      case 'Monthly':
        nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 1);
        console.log("case monthly");

        break;
      case 'Quarterly':
        nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 3);
        console.log("case quarterly");

        break;
      case 'Yearly':
        nextDate = new Date();
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        console.log("case yearly");

        break;
      default:
        console.log('error in cases');
        return res.status(400).json({ error: 'Invalid maintenance frequency provided' });
    }

    console.log('Creating maintenance record...' + nextDate);

    const submitBy = req.body.submitBy;
    const maintainanceRecord = new Maintainance({
      Machinery: machineId,
      UserDepartment : req.header('Authorization'),
      lastMaintainanceDate: new Date(),
      nextMaintainanceDate: nextDate,
      maintenanceType,
      replacement,
      dateType,
      natureOfFault,
      rootCause,
      detailOfWork,
      uploadImage: 'LATER',
      generateCertificate,
      SubmitBy: submitBy,
      SubmitDate: new Date()
    });

    try {

      await maintainanceRecord.save();
      console.log('Maintainance record saved successfully');
      res.status(200).json({ message: 'Maintainance record added successfully', data: maintainanceRecord });

    } catch (err) {
      console.error('Error while saving the maintainance record: ', err);
      res.status(500).json({ error: 'Server Error' });
    }

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to add Maintainance', message: error.message });
  }
});

// * GET All Machinery Data From MongooDB Database
router.get('/getAllMaintenanceRecords',  async (req, res) => {
  try {

    console.log('Received request to fetch all maintenance records.');
    const allMaintenanceRecords = await Maintainance.find({UserDepartment : req.header('Authorization')}).populate('Machinery').populate('UserDepartment');


    
    res.status(200).json({ message: 'Fetched all maintenance records successfully', data: allMaintenanceRecords });

  } catch (error) {
    console.error('Failed to fetch maintenance records: ', error.message);
    res.status(500).json({ error: 'Failed to fetch maintenance records', message: error.message });
  }
});

// * GET  Machine ID From MongooDB Database
router.get('/getMaintenanceByMachineId/:MachineId',  async (req, res) => {
  try {

    const machineId = req.params.MachineId;
    console.log(`Received request to fetch maintenance records for Machine ID: ${machineId}`);

    const maintenanceRecords = await Maintainance.find({ Machinery: machineId, UserDepartment : req.header('Authorization') }).populate('Machinery');
    if (maintenanceRecords.length === 0) {
      console.log('No maintenance records found for the given Machine ID.');
      return res.status(404).json({ message: 'No maintenance records found for the given Machine ID' });
    }

    console.log(`Found ${maintenanceRecords.length} maintenance records for the given Machine ID.`);
    res.status(200).json({ message: 'Fetched maintenance records successfully', data: maintenanceRecords });

  } catch (error) {
    console.error('Failed to fetch maintenance records by Machine ID: ', error.message);
    res.status(500).json({ error: 'Failed to fetch maintenance records by Machine ID', message: error.message });
  }
});

// * GET  Maintenance ID From MongooDB Database
router.get('/getMaintenanceById/:MaintainanceId',  async (req, res) => {
  try {

    const maintainanceId = req.params.MaintainanceId;
    console.log(`Received request to fetch maintenance record for Maintenance ID: ${maintainanceId}`);

    const maintenanceRecord = await Maintainance.findById(maintainanceId).populate('Machinery');
    if (!maintenanceRecord) {
      console.log('No maintenance record found for the given Maintenance ID.');
      return res.status(404).json({ message: 'No maintenance record found for the given Maintenance ID' });
    }

    console.log('Successfully fetched the maintenance record for the given Maintenance ID.');
    res.status(200).json({ message: 'Fetched maintenance record successfully', data: maintenanceRecord });

  } catch (error) {
    console.error('Failed to fetch maintenance record by Maintenance ID: ', error.message);
    res.status(500).json({ error: 'Failed to fetch maintenance record by Maintenance ID', message: error.message });
  }
});

// * Delete All Records From MongooDB Database
router.delete('/deleteAllMaintenanceRecords',  async (req, res) => {
  try {

    console.log('Received request to delete all maintenance records.')
    const result = await Maintainance.deleteMany();

    if (result.deletedCount === 0) {
      console.log('No records to delete.');
      return res.status(404).json({ message: 'No maintenance records found to delete.' });
    }

    console.log(`Deleted ${result.deletedCount} maintenance records.`);
    res.status(200).json({ message: `Successfully deleted ${result.deletedCount} maintenance records.` });

  } catch (error) {
    console.error('Failed to delete maintenance records: ', error.message);
    res.status(500).json({ error: 'Failed to delete maintenance records', message: error.message });
  }
});

// * Delete Record By ID From MongooDB Database
router.delete('/deleteMaintenanceById/:MaintainanceId',  async (req, res) => {
  try {

    const maintainanceId = req.params.MaintainanceId;
    console.log(`Received request to delete maintenance record for Maintenance ID: ${maintainanceId}`);

    const result = await Maintainance.findByIdAndDelete(maintainanceId);
    if (!result) {
      console.log('No maintenance record found for the given Maintenance ID to delete.');
      return res.status(404).json({ message: 'No maintenance record found for the given Maintenance ID to delete.' });
    }

    console.log('Successfully deleted the maintenance record for the given Maintenance ID.');
    res.status(200).json({ message: 'Successfully deleted the maintenance record.' });

  } catch (error) {
    console.error('Failed to delete maintenance record by Maintenance ID: ', error.message);
    res.status(500).json({ error: 'Failed to delete maintenance record by Maintenance ID', message: error.message });
  }
});

module.exports = router;