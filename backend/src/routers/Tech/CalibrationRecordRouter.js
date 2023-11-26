const express = require('express');
const router = express.Router();
const Calibration = require('../../models/Tech/CalibrationRecordModel');
const Equipment = require('../../models/Tech/EquipmentModel');
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer();
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

const uploadToCloudinaryImg = (buffer) => {
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
    console.log('from inside of function' + error);
  }
};

// * POST route to add a Calibration Record
router.post('/addCalibration/:EquipmentId',  upload.fields([{ name: 'Image' }, { name: 'exCertificate' }, { name: 'masterCertificate' }, { name: 'Certificate' }]), async (req, res) => {
  console.log(req.body);
  console.log(req.files);
  try {

    const EquipmentId = req.params.EquipmentId;
    const caliberateBy = req.user.Name

    if (!EquipmentId) {
      return res.status(404).json({ error: 'Please Provide Machine ID' });
    }

    // Get the Equipment by ID
    const equipment = await Equipment.findById(EquipmentId);

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    let ImageURL = '';
    let CertificateURL = '';
    let exCertificateURL = '';
    let masterCertificateURL = '';

    if (req.files['Image']) {
      // Get the file buffers of the uploaded image and document
      const imageBuffer = req.files['Image'][0].buffer;
      console.log('uploading');

      // Upload the image buffer to Cloudinary and obtain the URL
      ImageURL = await uploadToCloudinaryImg(imageBuffer).then((res) => {
        return res.secure_url;
      }).catch((err) => {
        console.log('from outside of function ' + err);
      });

    }

    if (req.files['Certificate']) {
      const fileBuffers = req.files['Certificate'][0].buffer;
      CertificateURL = await uploadToCloudinaryImg(fileBuffers).then((res) => {
        return res.secure_url;
      }).catch((err) => {
        console.log('from outside of function ' + err);
      });
    }

    if (req.files['exCertificate']) {
      const fileBuffers = req.files['exCertificate'][0].buffer;
      exCertificateURL = await uploadToCloudinaryImg(fileBuffers).then((res) => {
        return res.secure_url;
      }).catch((err) => {
        console.log('from outside of function ' + err);
      });
    }

    if (req.files['masterCertificate']) {
      const fileBuffers = req.files['exCertificate'][0].buffer;
      masterCertificateURL = await uploadToCloudinaryImg(fileBuffers).then((res) => {
        return res.secure_url;
      }).catch((err) => {
        console.log('from outside of function ' + err);
      });
    }

    // Create a new Calibration record
    const calibrationRecord = new Calibration({
      Equipment: EquipmentId,
      lastCallibrationDate: new Date(Date.parse(req.body.lastDate.replace(/^"(.*)"$/, '$1'))),
      nextCallibrationDate: new Date(Date.parse(req.body.nextDate.replace(/^"(.*)"$/, '$1'))),
      CaliberateBy: caliberateBy,
      User : req.user._id,
      CaliberatDate: new Date(),
      dateType: req.body.dateType,
      callibrationType: req.body.callibrationType,
      CR: req.body.CR,
      comment: req.body.comment,
      measuredReading: {
        firstReading: req.body.firstReading,
        secondReading: req.body.secondReading,
        thirdReading: req.body.thirdReading
      },
      internal: {
        ImageURL,
        CertificateURL,
        masterCertificateURL,
      },
      external: {
        companyName: req.body.companyName,
        masterReference: req.body.masterReference,
        exCertificateURL
      }

    });

    console.log('saving this object' + calibrationRecord);

    // Save the Calibration record
    try {
      await calibrationRecord.save();
      console.log('Calliobration record saved successfully');
      res.status(200).json({ message: 'Callibration record added successfully' });
    } catch (err) {
      console.error('Error while saving the Callibration record: ', err);
      res.status(500).json({ error: 'Server Error' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to add Calibration Record', message: error.message });
  }
});

// * GET All Machinery Data From MongooDB Database
router.get('/readAllCalibration',  async (req, res) => {
  try {

    const callibration = await Calibration.find().populate('Equipment').populate('User');
   
    const callibrationsToSend = callibration.filter((Obj)=>{
      if(Obj.User.Department.equals(req.user.Department)){
        console.log('got Equal');
        return Obj
      }
    });

    res.status(201).send({ status: true, message: "The following are Callibration!", data: callibrationsToSend, });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Callibration', message: error.message });
  }
});

// * GET route to fetch callibration by equipment ID
router.get('/readCalibrationByEquipmentId/:equipmentId',  async (req, res) => {
  try {

    const equipmentId = req.params.equipmentId;
    if (!equipmentId) {
      return res.status(404).json({ error: 'Please Provide Machine ID' });
    }

    const calibration = await Calibration.find({ equipment: equipmentId }).populate('Equipment');
    if (!calibration) {
      return res.status(404).json({ error: 'calibration not found' });
    }

    res.status(201).send({ status: true, message: "The following calibration!", data: calibration });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calibration', message: error.message });
  }
});
module.exports = router;