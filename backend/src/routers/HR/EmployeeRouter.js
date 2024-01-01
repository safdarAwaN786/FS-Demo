const express = require('express');
const User = require('../../models/AccountCreation/UserModel');
const router = new express.Router();
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const authMiddleware = require('../../middleware/auth');
const CryptoJS = require('crypto-js');
const emailTemplates = require('../../EmailTemplates/userEmail.json');
const template = emailTemplates.registrationConfirmation;
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const axios = require('axios')
const { rgb, degrees, PDFDocument, StandardFonts } = require('pdf-lib');

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
        CVFile = req.files['CV'][0];
        const response = await axios.get(req.user.Company.CompanyLogo, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFDocument.load(CVFile.buffer);
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
        addFirstPage(firstPage, pdfLogoImage, req.user.Company, req.user);
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
          const companyText = `${req.user.Company.CompanyName}`;
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

        // Upload the document  to Cloudinary and obtain the URLs
        CVUrl = await uploadToCloudinary(modifiedPdfBuffer).then((result) => {
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

    const employeesToSend = employee.filter((Obj) => {
      if (Obj.User.Department.equals(req.user.Department)) {
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