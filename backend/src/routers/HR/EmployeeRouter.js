const express = require('express');
const User = require('../../models/AccountCreation/UserModel');
const Employee = require('../../models/HR/EmployeeModel');
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
const { addFirstPage } = require('../Admin/UploadDocumentRouter');

// router.use(authMiddleware);

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
// const addFirstPage = async (page, logoImage, Company, user) => {
//   const { width, height } = page.getSize();

//   const pdfDoc = await PDFDocument.create();
//   const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const logoDims = { width: 300, height: 300 };
//   const centerTextX = width / 2;

//   // Function to wrap text to fit within a specific width
//   const wrapText = (text, maxWidth, font, fontSize) => {
//     const words = text.split(' ');
//     let lines = [];
//     let currentLine = '';

//     for (const word of words) {
//       const testLine = currentLine ? `${currentLine} ${word}` : word;
//       const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
//       if (testLineWidth <= maxWidth) {
//         currentLine = testLine;
//       } else {
//         lines.push(currentLine);
//         currentLine = word;
//       }
//     }
//     if (currentLine) lines.push(currentLine);
//     return lines;
//   };

//   // Draw company logo
//   page.drawImage(logoImage, { 
//     x: centerTextX - logoDims.width / 2, 
//     y: height - 400, 
//     width: logoDims.width, 
//     height: logoDims.height 
//   });

//   // Add company name
//   const fontSize = 25;
//   const maxWidth = width - 100; // Allow some padding
//   const companyNameText = Company.CompanyName;
//   page.drawText(companyNameText, { 
//     x: centerTextX - helveticaFont.widthOfTextAtSize(companyNameText, fontSize) / 2, 
//     y: height - 420, 
//     color: rgb(0, 0, 0), 
//     fontSize 
//   });

//   // Add company contact
//   const companyContactText = `Contact # ${Company.PhoneNo}`;
//   page.drawText(companyContactText, { 
//     x: centerTextX - helveticaFont.widthOfTextAtSize(companyContactText, fontSize) / 2, 
//     y: height - 450, 
//     color: rgb(0, 0, 0), 
//     fontSize 
//   });

//   // Add company email
//   const companyEmailText = `${Company.Email}`;
//   page.drawText(companyEmailText, { 
//     x: centerTextX - helveticaFont.widthOfTextAtSize(companyEmailText, fontSize) / 2, 
//     y: height - 480, 
//     color: rgb(0, 0, 0), 
//     fontSize 
//   });

//   // Add wrapped company address
//   const companyAddressText = `${Company.Address}`;
//   const wrappedAddress = wrapText(companyAddressText, maxWidth, helveticaFont, fontSize);
//   let yPosition = height - 510;
//   for (const line of wrappedAddress) {
//     page.drawText(line, { 
//       x: centerTextX - helveticaFont.widthOfTextAtSize(line, fontSize) / 2, 
//       y: yPosition, 
//       color: rgb(0, 0, 0), 
//       fontSize 
//     });
//     yPosition -= 30; // Adjust line spacing
//   }

//   // Add uploaded by and date
//   const uploadByText = `Uploaded By : ${user.Name}`;
//   page.drawText(uploadByText, { 
//     x: centerTextX - helveticaFont.widthOfTextAtSize(uploadByText, 20) / 2, 
//     y: yPosition - 50, 
//     color: rgb(0, 0, 0), 
//     size: 20 
//   });

//   const uploadDateText = `Uploaded Date : ${formatDate(new Date())}`;
//   page.drawText(uploadDateText, { 
//     x: centerTextX - helveticaFont.widthOfTextAtSize(uploadDateText, 20) / 2, 
//     y: yPosition - 80, 
//     color: rgb(0, 0, 0), 
//     size: 20 
//   });
// };


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
const formatDate = (date) => {

  const newDate = new Date(date);
  const formatDate = newDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return formatDate;
}
// * POST Employee Data Into MongooDB Database
router.post('/addEmployee', upload.fields([{ name: 'Image' }, { name: 'CV' }]), async (req, res) => {
  try {
    const requestUser = await User.findById(req.header('Authorization')).populate('Company Department');
    const emailExist = await Employee.findOne({ Email: req.body.Email });
    if (emailExist) {
      res.status(400).json({ message: 'Employee with Email already exists!' });
      return;
    }

    // Ensure CNIC is a string
    let CNIC = req.body.CNIC;
    if (Array.isArray(CNIC)) {
      CNIC = CNIC.join(''); // Join array values into a single string
    }

    let imageUrl = null;
    let CVUrl = null;

    if (req.files) {
      // Get the file buffers of the uploaded image and document
      if (req.files['Image']) {
        const imageFile = req.files['Image'][0];
        // Upload the image to Cloudinary and obtain the URL
        imageUrl = await uploadToCloudinary(imageFile.buffer).then((result) => {
          return result.secure_url;
        }).catch((err) => {
          console.log(err);
        });
      }

      if (req.files['CV']) {
        const CVFile = req.files['CV'][0];
        const response = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFDocument.load(CVFile.buffer);
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
          const extraSpace = 24;
          page.setSize(width, height + extraSpace);
          page.translateContent(0, -extraSpace);
          const watermarkText = 'Employee Document';
          const watermarkFontSize = 15;
          const watermarkTextWidth = helveticaFont.widthOfTextAtSize(watermarkText, watermarkFontSize);
          const centerWatermarkX = width / 2 - watermarkTextWidth / 2;
          const centerWatermarkY = height + extraSpace - 10;
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
          const centerCompanyTextY = height + extraSpace;
          page.drawText(companyText, {
            x: centerCompanyTextX,
            y: centerCompanyTextY,
            size: companyTextFontSize,
            color: rgb(0, 0, 0)
          });
        });
        const modifiedPdfBuffer = await pdfDoc.save();

        // Upload the document to Cloudinary and obtain the URL
        CVUrl = await uploadToCloudinary(modifiedPdfBuffer).then((result) => {
          return result.secure_url;
        }).catch((err) => {
          console.log(err);
        });
      }
    }

    const createdBy = requestUser?.Name;
    const newEmployee = new Employee({
      ...req.body,
      UserDepartment: requestUser.Department._id,
      DepartmentText: req.body.Department,
      Department: requestUser.Department,
      Company: requestUser.Company,
      isEmployee: true,
      EmployeeImage: imageUrl,
      EmployeeCV: CVUrl,
      CreatedBy: createdBy,
      CreationDate: new Date(),
      CNIC: CNIC  // Make sure CNIC is a string
    });

    newEmployee.save().then(() => {
      res.status(200).send({ status: true, message: "The employee is added!", data: newEmployee });
    }).catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Error adding Employee!', error: error.message });
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "error in adding employee" + e.message });
  }
});

// * GET All Employee Data From MongooDB Database
router.get('/readEmployee', async (req, res) => {
  try {

    const employee = await Employee.find({ UserDepartment: req.header('Authorization') }).populate('Department').populate('UserDepartment')
    res.status(201).send({ status: true, message: "The Following Are Employees!", data: employee, });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// * DELETE Employee Data By Id From MongooDB Database
router.delete('/deleteEmployee/:id', async (req, res) => {
  try {

    const employee = await Employee.findOneAndDelete({ _id: req.params.id })
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

    const employee = await Employee.deleteMany({})
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