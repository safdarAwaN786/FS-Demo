const express = require('express');
const Training = require('../../models/HR/TrainingModel')
const router = new express.Router();
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const authMiddleware = require('../../middleware/auth');
const { rgb, degrees, PDFDocument, StandardFonts } = require('pdf-lib');
// router.use(authMiddleware);
const axios = require('axios');
const user = require('../../models/AccountCreation/UserModel');
const { addFirstPage } = require('../Admin/UploadDocumentRouter');

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
        { resource_type: 'auto' },
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

// * Post Training Data Into MongoDB Database
router.post('/addTraining', upload.fields([{ name: 'TrainingMaterial' }]), async (req, res) => {
  console.log("request made training..")
  try {
    const requestUser = await user.findById(req.header('Authorization')).populate('Company Department')

    var trainingMaterial;
    if (req.files['TrainingMaterial']) {
      trainingMaterial = req.files['TrainingMaterial'][0];
    }

    var materialUrl;
    if (trainingMaterial) {

      const response = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
      const pdfDoc = await PDFDocument.load(trainingMaterial.buffer);
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
                    const watermarkText = 'Training Document';
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

      materialUrl = await uploadToCloudinary(modifiedPdfBuffer).then((result) => {
        return (result.secure_url)
      }).catch((err) => {
        console.log(err);
      })
    }

    console.log(materialUrl);

    const createdBy = requestUser.Name;
    const training = new Training({
      ...req.body,
      UserDepartment: requestUser.Department._id,
      TrainingMaterial: materialUrl,
      CreatedBy: createdBy,
      CreationDate: new Date()
    });

    await training.save();

    console.log(new Date().toLocaleString() + ' ' + 'Loading Training...');
    res.status(201).send({ status: true, message: "The Training has been Added!", data: training });
    console.log(new Date().toLocaleString() + ' ' + 'ADD Training Successfully!');

  } catch (e) {
    console.log(e);
    res.status(400).json({ message: e.message });
  }
});

// * GET All Training Data From MongooDB Database
router.get('/readTraining', async (req, res) => {
  console.log("request made for training")
  try {

    const training = await Training.find({UserDepartment : req.header('Authorization')}).populate('UserDepartment');

   

    res.status(201).send({ status: true, message: "The Following are Trainings!", data: training, });
    console.log(new Date().toLocaleString() + ' ' + 'READ Training Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// * DELETE Training Data By Id From MongooDB Database
router.delete('/deleteTraining/:id', async (req, res) => {
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
router.delete('/deleteAllTrainings', async (req, res) => {
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