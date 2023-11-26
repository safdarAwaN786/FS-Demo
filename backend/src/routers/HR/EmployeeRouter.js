const express = require('express');
const User = require('../../models/AccountCreation/UserModel');
const router = new express.Router();
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require("fs");
const authMiddleware = require('../../middleware/auth');
const CryptoJS = require('crypto-js');
const emailTemplates = require('../../EmailTemplates/userEmail.json');
const template = emailTemplates.registrationConfirmation;
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
router.use(authMiddleware);

// * Cloudinary Setup 
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});
const transporter = nodemailer.createTransport(smtpTransport({
  host: process.env.host,
  port: process.env.port,
  auth: {
    user: process.env.email,
    pass: process.env.pass
  }
}));

const upload = multer();

// * Upload Documents To Cloudinary
const uploadToCloudinary = (buffer) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            console.log(error);
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

// * POST Employee Data Into MongooDB Database
router.post('/addEmployee', upload.fields([{ name: 'Image' }, { name: 'CV' }]), async (req, res) => {
 
  try {
    console.log(req.body);
    const userNameExist = await User.findOne({ UserName: req.body.UserName });

    if (userNameExist) {
      console.log('Exists already');
      res.status(201).json({ status: false, message: 'UserName already exists!' });
    } else {  
      // Get the file buffers of the uploaded image and document
      var imageUrl;
    if (req.files['Image']) {
      imageFile = req.files['Image'][0];
      // Upload the image  to Cloudinary and obtain the URL
      imageUrl = await uploadToCloudinary(imageFile.buffer).then((result) => {
        return (result.secure_url)
      }).catch((err) => {
        console.log(err);
      });
    }

    var CVFile;
    var CVUrl;
    if (req.files['CV']) {
      // Upload the document  to Cloudinary and obtain the URLs
      CVFile = req.files['CV'][0];
      CVUrl = await uploadToCloudinary(CVFile.buffer).then((result) => {
        return (result.secure_url)
      }).catch((err) => {
        console.log(err);
      })
    }
    
    const createdBy = req.user.Name;
    // Create a new employee document with the image and document URLs
    const newUser = new User({
      ...req.body,
      User: req.user._id,
      DepartmentText: req.body.Department,
      Department: req.user.Department,
      Company: req.user.Company,
      isEmployee: true,
      EmployeeImage: imageUrl,
      EmployeeCV: CVUrl,
      CreatedBy: createdBy,
      Password: CryptoJS.AES.encrypt(req.body.Password, process.env.PASS_CODE).toString(),
      CreationDate: new Date()
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
          res.status(200).send({ status: true, message: "The employee is added!", data: newUser });
        }).catch((error) => {
          console.error(error);
          res.status(500).json({ message: 'Error adding Employee!', error: error.message });
        });
      }
    });
    
  }



  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "error in adding employee" + e.message });
  }
})

// * GET All Employee Data From MongooDB Database
router.get('/readEmployee', async (req, res) => {
  try {

    const employee = await User.find({ isEmployee: true }).populate('Department').populate('User')
    
    const employeesToSend = employee.filter((Obj)=>{
      if(Obj.User.Department.equals(req.user.Department)){
        console.log('got Equal');
        return Obj
      }
    });


    res.status(201).send({ status: true, message: "The Following Are Employees!", data: employeesToSend, });
  

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// * DELETE Employee Data By Id From MongooDB Database
router.delete('/deleteEmployee/:id', async (req, res) => {
  try {

    const employee = await User.findOneAndDelete({ _id: req.params.id })
    console.log(new Date().toLocaleString() + ' ' + 'Checking Employees...')

    if (!employee) {
      res.status(404).send({ status: false, message: "This Employee is Not found!" })
    }

    res.status(201).send({ status: true, message: "The Following Employee has been Deleted!", data: employee });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE Employee Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
})

// * DELETE All Employees Data From MongooDB Database
router.delete('/deleteAllEmployees', async (req, res) => {
  try {

    const employee = await User.deleteMany({})
    console.log(new Date().toLocaleString() + ' ' + 'Checking Employees...')

    if (employee.deletedCount === 0) {
      res.status(404).send({ status: false, message: "No Employees Found to Delete!" })
    }

    res.status(201).send({ status: true, message: "All employees have been deleted!", data: employee });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE Employees Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
})

module.exports = router