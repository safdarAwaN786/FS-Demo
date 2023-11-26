const express = require("express");
const User = require("../../models/AccountCreation/UserModel");
const router = new express.Router();
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require("fs");
const CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const emailTemplates = require('../../EmailTemplates/userEmail.json');
const template = emailTemplates.registrationConfirmation;
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
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            reject(new Error('Failed to upload file to Cloudinary'));
          } else {
            resolve(result.secure_url);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.log('error inside uploadation' + error);
  }
};

const transporter = nodemailer.createTransport(smtpTransport({
  host: process.env.host,
  port: process.env.port,
  auth: {
    user: process.env.email,
    pass: process.env.pass
  }
}));

// * Send email to trainer  
// router.post('/send-email-to-trainer', async (req, res) => {
//   try {
//     const { trainerId } = req.body;
//     const trainer = await Trainer.findById(trainerId);

//     if (!trainer) {
//       return res.status(404).json({ message: 'Trainer not found' });
//     }

//     const emailBody = template.body.replace('{{name}}', user.user.Name)
//       .replace('{{username}}', user.user.UserName)
//       .replace('{{password}}', user.user.Password);

//     const mailOptions = {
//       from: process.env.email, // Sender email address
//       to: user.user.Email, // Recipient's email address
//       subject: template.subject,
//       text: emailBody
//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.error('Error sending email:', error);
//         return res.status(500).json({ message: 'Error sending email', error: error.message });
//       } else {
//         console.log('Email sent: ' + info.response);
//         return res.status(200).json({ message: 'Email sent successfully' });
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error sending email', error: error.message });
//   }
// });

// * Post Trainer Data Into MongooDB Database


router.post("/addTrainer", upload.fields([{ name: 'TrainerImage' }, { name: 'TrainerDocument' }]), async (req, res) => {
  console.log("request made trainer..");
  try {

    const userNameExist = await User.findOne({ UserName: req.body.UserName });

    if (userNameExist) {
      console.log('Exists already');
      res.status(201).json({ status: false, message: 'UserName already exists!' });
    } else {

      // Get the files of the uploaded image and document
      let imageUrl;
      let documentUrl;

      if (req.files['TrainerImage']) {
        const imageFile = req.files['TrainerImage'][0];
        // Upload the image buffer to Cloudinary and obtain the URL
        imageUrl = await uploadToCloudinary(imageFile.buffer);
        console.log(imageUrl);
      }

      if (req.files['TrainerDocument']) {
        const documentFile = req.files['TrainerDocument'][0];
        // Upload the document buffer to Cloudinary and obtain the URL
        documentUrl = await uploadToCloudinary(documentFile.buffer);
        console.log(documentUrl);
      }

      const createdBy = req.user.Name;
      // Create a new employee document with the image and document URLs
      const newUser = new User({
        ...req.body,
        User: req.user._id,
        Department: req.user.Department,
        Company: req.user.Company,
        isTrainer: true,
        TrainerImage: imageUrl,
        TrainerDocument: documentUrl,
        CreatedBy: createdBy,
        CreationDate: new Date(),
        Password: CryptoJS.AES.encrypt(req.body.Password, process.env.PASS_CODE).toString(),

      });

      // Send email to the new user
      const emailBody = template.body.replace('{{name}}', newUser.Name)
        .replace('{{username}}', newUser.UserName)
        .replace('{{password}}', req.body.Password);

      const mailOptions = {
        from: process.env.email, // Sender email address
        to: newUser.Email, // Recipient's email address
        subject: template.subject,
        text: emailBody
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Error sending email', error: error.message });
        } else {
          console.log('Email sent: ' + info.response);
          // Save the new user after sending email
          newUser.save().then(() => {
            res.status(200).send({ status: true, message: "The Trainer is added!", data: newUser });
          }).catch((error) => {
            console.error(error);
            res.status(500).json({ message: 'Error adding Trainer!', error: error.message });
          });
        }
      });

    }

  } catch (e) {
    if (e.name === 'MongoError' && e.code === 11000) {
      let errorMessage = "Trainer with this ";

      // Extract the duplicate field names from the error message
      const duplicateFieldNames = Object.keys(e.keyPattern);

      if (duplicateFieldNames.includes('Email')) {
        errorMessage += "Email is already exist!";
      }

      res.status(400).send({ status: false, message: errorMessage });
    } else {
      res.status(400).send({ status: false, message: e.message });
    }
  }
});

// * GET All Trainer Data From MongooDB Database
router.get("/readTrainer", async (req, res) => {
  try {

    const trainer = await User.find({ isTrainer: true }).populate('User')

    const trainersToSend = trainer.filter((Obj) => Obj.User.Department.equals(req.user.Department));

res.status(201).send({ status: true, message: "The Following are the Trainers!", data: trainersToSend });
    

  } catch (e) {
  res.status(500).json({ message: e.message });
}
});

// * DELETE Trainer Data By Id From MongooDB Database
router.delete('/deleteTrainer/:id', async (req, res) => {
  try {

    const trainer = await User.findOneAndDelete({ _id: req.params.id })
    console.log(new Date().toLocaleString() + ' ' + 'Loading Trainers...')

    if (!trainer) {
      res.status(404).send({ status: false, message: "This Trainer is Not found!" })
    }

    res.status(201).send({ status: true, message: "The following Trainer has been Deleted!", data: trainer });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE Trainer Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
})

// * DELETE All Trainers Data From MongooDB Database
router.delete('/deleteAllTrainers', async (req, res) => {
  try {

    const trainer = await User.deleteMany({})
    console.log(new Date().toLocaleString() + ' ' + 'Loading Trainers...')

    if (trainer.deletedCount === 0) {
      res.status(404).send({ status: false, message: "No Trainers Found to Delete!" })
    }

    res.status(201).send({ status: true, message: "All Trainers have been Deleted!", data: trainer });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE Trainers Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
})

// * Assign Tabs To Trainer document by ID
router.patch('/trainer/assign-tabs/:trainerId', async (req, res) => {
  try {
    const trainerId = req.params.trainerId;
    const updatedTrainer = await User.findById(trainerId);

    if (!updatedTrainer) {
      console.log(`Trainer document with ID: ${trainerId} not found`);
      return res.status(404).json({ message: `Trainer document with ID: ${trainerId} not found` });
    }

    // Assuming req.body.Tabs is an array of tab objects
    updatedTrainer.Tabs = req.body.Tabs;
    await updatedTrainer.save();

    console.log(`Trainer document with ID: ${trainerId} updated successfully`);
    res.status(200).json({ status: true, message: 'Trainer document updated successfully', data: updatedTrainer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating Trainer document', error: error.message });
  }
});


module.exports = router;