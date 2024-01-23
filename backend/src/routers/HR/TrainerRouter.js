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
const axios = require('axios');
// router.use(authMiddleware);
const { rgb, degrees, PDFDocument, StandardFonts } = require('pdf-lib');
// * Cloudinary Setup 
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

const upload = multer();
const formatDate = (date) => {

  const newDate = new Date(date);
  const formatDate = newDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
  });
  return formatDate;
}
// Function to add the company logo and information to the first page
const addFirstPage = async (page, logoImage, Company, user) => {
  const { width, height } = page.getSize();

  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const logoDims = { width: 300, height: 300 };
  const centerTextX = width / 2;
  page.drawImage(logoImage, { x: centerTextX - logoDims.width / 2, y: height - 400, width: logoDims.width, height: logoDims.height });
  // Add company name (centered)
  const companyNameText = Company.CompanyName;
  const companyNameTextWidth = (helveticaFont.widthOfTextAtSize(companyNameText, 25));
  page.drawText(companyNameText, { x: centerTextX - companyNameTextWidth / 2, y: height - 420, color: rgb(0, 0, 0), fontSize: 25 });
  // Add company contact (centered)
  const companyContactText = `Contact # ${Company.PhoneNo}`;
  const companyContactTextWidth = (helveticaFont.widthOfTextAtSize(companyContactText, 25));
  page.drawText(companyContactText, { x: centerTextX - companyContactTextWidth / 2, y: height - 450, color: rgb(0, 0, 0), fontSize: 25 });
  // Add company email (centered)
  const companyEmailText = `${Company.Email}`;
  const companyEmailTextWidth = (helveticaFont.widthOfTextAtSize(companyEmailText, 25));
  page.drawText(companyEmailText, { x: centerTextX - companyEmailTextWidth / 2, y: height - 480, color: rgb(0, 0, 0), fontSize: 25 });
  // Add company email (centered)
  const companyAddressText = `${Company.Address}`;
  const companyAddressTextWidth = (helveticaFont.widthOfTextAtSize(companyAddressText, 25));
  page.drawText(companyAddressText, { x: centerTextX - companyAddressTextWidth / 2, y: height - 510, color: rgb(0, 0, 0), fontSize: 25 });

  const uploadByText = `Uploaded By : ${user.Name}`;
  const uploadByTextWidth = (helveticaFont.widthOfTextAtSize(uploadByText, 20));
  page.drawText(uploadByText, { x: centerTextX - uploadByTextWidth / 2, y: height - 560, color: rgb(0, 0, 0), size: 20 });

  const uploadDateText = `Uploaded Date : ${formatDate(new Date())}`;
  const uploadDateTextWidth = (helveticaFont.widthOfTextAtSize(uploadDateText, 20));
  page.drawText(uploadDateText, { x: centerTextX - uploadDateTextWidth / 2, y: height - 590, color: rgb(0, 0, 0), size: 20 });
};

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



router.post("/addTrainer", upload.fields([{ name: 'TrainerImage' }, { name: 'TrainerDocument' }]), async (req, res) => {
  try {
    const requestUser = await User.findById(req.header('Authorization')).populate('Company Department')
 
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

        const response = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFDocument.load(documentFile.buffer);
        const logoImage = Buffer.from(response.data);
        const logoImageDataUrl = `data:image/jpeg;base64,${logoImage.toString('base64')}`;
        const isJpg = logoImageDataUrl.includes('data:image/jpeg') || logoImageDataUrl.includes('data:image/jpg');
        const isPng = logoImageDataUrl.includes('data:image/png');
        let pdfLogoImage;
        if (isJpg) {
          pdfLogoImage = await pdfDoc.embedJpg(logoImage);
        } else if (isPng) {
          pdfLogoImage = await pdfDoc.embedPng(logoImage);
        }
        const firstPage = pdfDoc.insertPage(0);
        addFirstPage(firstPage, pdfLogoImage, requestUser.Company, requestUser);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        pdfDoc.getPages().slice(1).forEach(async (page) => {
          page.translateContent(0, -30);
          const { width, height } = page.getSize();
          const watermarkText = 'Powered By Feat Technology';
          const watermarkFontSize = 15;
          const watermarkTextWidth = (helveticaFont.widthOfTextAtSize(watermarkText, watermarkFontSize));
          const centerWatermarkX = width / 2 - watermarkTextWidth / 2;
          const centerWatermarkY = height - 18;
          page.drawText(watermarkText, { x: centerWatermarkX, y: centerWatermarkY, size: watermarkFontSize, color: rgb(0, 0, 0) });
          const companyText = `${requestUser.Company.CompanyName}`;
          const companyTextFontSize = 10;
          const companyTextWidth = (helveticaFont.widthOfTextAtSize(companyText, companyTextFontSize));
          const centerCompanyTextX = width - companyTextWidth - 20;
          const centerCompanyTextY = height - 16;
          page.drawText(companyText, { x: centerCompanyTextX, y: centerCompanyTextY, size: companyTextFontSize, color: rgb(0, 0, 0) });
          const dateText = `Upload Date : ${formatDate(new Date())}`;
          const dateTextFontSize = 10;
          const dateTextWidth = (helveticaFont.widthOfTextAtSize(dateText, dateTextFontSize));
          const centerDateTextX = width - dateTextWidth - 20;
          const centerDateTextY = height - 30;
          page.drawText(dateText, { x: centerDateTextX, y: centerDateTextY, size: dateTextFontSize, color: rgb(0, 0, 0) });
        });
        // Save the modified PDF
        const modifiedPdfBuffer = await pdfDoc.save();

        documentUrl = await uploadToCloudinary(modifiedPdfBuffer);
        console.log(documentUrl);
      }

      const createdBy = requestUser.Name;
      // Create a new employee document with the image and document URLs
      const newUser = new User({
        ...req.body,
        UserDepartment: requestUser.Department._id,
        Department: requestUser.Department._id,
        Company: requestUser.Company._id,
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
    const trainer = await User.find({ isTrainer: true, UserDepartment: req.header('Authorization') }).populate('UserDepartment')
    res.status(201).send({ status: true, message: "The Following are the Trainers!", data: trainer });
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