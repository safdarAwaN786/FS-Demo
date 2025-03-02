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

  // Function to wrap text to fit within a specific width
  const wrapText = (text, maxWidth, font, fontSize) => {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testLineWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Draw company logo
  page.drawImage(logoImage, { 
    x: centerTextX - logoDims.width / 2, 
    y: height - 400, 
    width: logoDims.width, 
    height: logoDims.height 
  });

  // Add company name
  const fontSize = 25;
  const maxWidth = width - 100; // Allow some padding
  const companyNameText = Company.CompanyName;
  page.drawText(companyNameText, { 
    x: centerTextX - helveticaFont.widthOfTextAtSize(companyNameText, fontSize) / 2, 
    y: height - 420, 
    color: rgb(0, 0, 0), 
    fontSize 
  });

  // Add company contact
  const companyContactText = `Contact # ${Company.PhoneNo}`;
  page.drawText(companyContactText, { 
    x: centerTextX - helveticaFont.widthOfTextAtSize(companyContactText, fontSize) / 2, 
    y: height - 450, 
    color: rgb(0, 0, 0), 
    fontSize 
  });

  // Add company email
  const companyEmailText = `${Company.Email}`;
  page.drawText(companyEmailText, { 
    x: centerTextX - helveticaFont.widthOfTextAtSize(companyEmailText, fontSize) / 2, 
    y: height - 480, 
    color: rgb(0, 0, 0), 
    fontSize 
  });

  // Add wrapped company address
  const companyAddressText = `${Company.Address}`;
  const wrappedAddress = wrapText(companyAddressText, maxWidth, helveticaFont, fontSize);
  let yPosition = height - 510;
  for (const line of wrappedAddress) {
    page.drawText(line, { 
      x: centerTextX - helveticaFont.widthOfTextAtSize(line, fontSize) / 2, 
      y: yPosition, 
      color: rgb(0, 0, 0), 
      fontSize 
    });
    yPosition -= 30; // Adjust line spacing
  }

  // Add uploaded by and date
  const uploadByText = `Uploaded By : ${user.Name}`;
  page.drawText(uploadByText, { 
    x: centerTextX - helveticaFont.widthOfTextAtSize(uploadByText, 20) / 2, 
    y: yPosition - 50, 
    color: rgb(0, 0, 0), 
    size: 20 
  });

  const uploadDateText = `Uploaded Date : ${formatDate(new Date())}`;
  page.drawText(uploadDateText, { 
    x: centerTextX - helveticaFont.widthOfTextAtSize(uploadDateText, 20) / 2, 
    y: yPosition - 80, 
    color: rgb(0, 0, 0), 
    size: 20 
  });
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
        const isJpg = requestUser.Company.CompanyLogo.includes('.jpeg') || requestUser.Company.CompanyLogo.includes('.jpg');
        const isPng = requestUser.Company.CompanyLogo.includes('.png');
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
          const { width, height } = page.getSize();
          const extraSpace = 24; // Increase this value for more space at the top
                    // Resize the page to add extra space at the top
                    page.setSize(width, height + extraSpace);
                    // Move the original content down
                    page.translateContent(0, -extraSpace);
                    // Now add your custom text at the top
                    const watermarkText = 'Trainer Document';
                    const watermarkFontSize = 15;
                    const watermarkTextWidth = helveticaFont.widthOfTextAtSize(watermarkText, watermarkFontSize);
                    const centerWatermarkX = width / 2 - watermarkTextWidth / 2;
                    const centerWatermarkY = height + extraSpace - 10; // Place in new space
                    page.drawText(watermarkText, {
                        x: centerWatermarkX,
                        y: centerWatermarkY,
                        size: watermarkFontSize,
                        color: rgb(0, 0, 0)
                    });
                    const companyText = `${requestUser.Company.CompanyName}`;
                    const companyTextFontSize = 10;
                    const companyTextWidth = helveticaFont.widthOfTextAtSize(companyText, companyTextFontSize);
                    const centerCompanyTextX = width - companyTextWidth - 20;
                    const centerCompanyTextY = height + extraSpace; // Place in new space
                    page.drawText(companyText, {
                        x: centerCompanyTextX,
                        y: centerCompanyTextY,
                        size: companyTextFontSize,
                        color: rgb(0, 0, 0)
                    });
                   
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
    await User.findByIdAndUpdate(
      updatedTrainer._id,
      updatedTrainer,
      { new: true }
  );
    // await updatedTrainer.save();

    console.log(`Trainer document with ID: ${trainerId} updated successfully`);
    res.status(200).json({ status: true, message: 'Trainer document updated successfully', data: updatedTrainer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating Trainer document', error: error.message });
  }
});


module.exports = router;