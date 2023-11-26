const express = require('express');
const Training = require('../../models/HR/TrainingModel')
const router = new express.Router();
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require("fs");
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

// * Cloudinary Setup 
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

const upload = multer();

// * Upload Documents To Cloudinary
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

// * Post Training Data Into MongoDB Database
router.post('/addTraining',  upload.fields([{ name: 'TrainingMaterial' }]), async (req, res) => {
  console.log("request made training..")
  try {

    var trainingMaterial;
    if (req.files['TrainingMaterial']) {
      trainingMaterial = req.files['TrainingMaterial'][0];
    }

    var materialUrl;
    if (trainingMaterial) {
      materialUrl = await uploadToCloudinary(trainingMaterial.buffer).then((result) => {
        return (result.secure_url)
      }).catch((err) => {
        console.log(err);
      })
    }

    console.log(materialUrl);

    const createdBy = req.user.Name;
    const training = new Training({
      ...req.body,
      User : req.user._id,
      TrainingMaterial: materialUrl,
      CreatedBy: createdBy,
      CreationDate: new Date()
    });

    await training.save();

    console.log(new Date().toLocaleString() + ' ' + 'Loading Training...');
    res.status(201).send({ status: true, message: "The Training has been Added!", data: training });
    console.log(new Date().toLocaleString() + ' ' + 'ADD Training Successfully!');

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// * GET All Training Data From MongooDB Database
router.get('/readTraining',  async (req, res) => {
  console.log("request made for training")
  try {

    const training = await Training.find().populate('User');

    const trainingsToSend = training.filter((Obj)=>{
      if(Obj.User.Department.equals(req.user.Department)){
        console.log('got Equal');
        return Obj
      }
    });

  

    res.status(201).send({ status: true, message: "The Following are Trainings!", data: trainingsToSend, });
    console.log(new Date().toLocaleString() + ' ' + 'READ Training Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// * DELETE Training Data By Id From MongooDB Database
router.delete('/deleteTraining/:id',  async (req, res) => {
  try {

    const training = await Training.findOneAndDelete({ _id: req.params.id })
    console.log(new Date().toLocaleString() + ' ' + 'Checking Trainings...')

    if (!training) {
      res.status(404).send({ status: false, message: "This Training is Not found!" })
    }

    res.status(201).send({ status: true, message: "The Following Training has been Deleted!", data: training });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE Training Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
})

// * DELETE All Trainings Data From MongooDB Database
router.delete('/deleteAllTrainings',  async (req, res) => {
  try {

    const training = await Training.deleteMany({})
    console.log(new Date().toLocaleString() + ' ' + 'Checking Trainings...')

    if (training.deletedCount === 0) {
      res.status(404).send({ status: false, message: "No Trainings Found to Delete!" })
    }

    res.status(201).send({ status: true, message: "All Trainings have been Deleted!", data: training });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE Trainings Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
})

module.exports = router