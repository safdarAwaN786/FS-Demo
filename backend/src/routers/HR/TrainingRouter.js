const express = require('express');
const Training = require('../../models/HR/TrainingModel')
const router = new express.Router();
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const authMiddleware = require('../../middleware/auth');
const { rgb, degrees, PDFDocument, StandardFonts } = require('pdf-lib');
router.use(authMiddleware);
const axios = require('axios')

// * Cloudinary Setup 
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

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
router.post('/addTraining', upload.fields([{ name: 'TrainingMaterial' }]), async (req, res) => {
  console.log("request made training..")
  try {

    var trainingMaterial;
    if (req.files['TrainingMaterial']) {
      trainingMaterial = req.files['TrainingMaterial'][0];
    }

    var materialUrl;
    if (trainingMaterial) {

      const response = await axios.get(req.user.Company.CompanyLogo, { responseType: 'arraybuffer' });
      const pdfDoc = await PDFDocument.load(trainingMaterial.buffer);
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

      materialUrl = await uploadToCloudinary(modifiedPdfBuffer).then((result) => {
        return (result.secure_url)
      }).catch((err) => {
        console.log(err);
      })
    }

    console.log(materialUrl);

    const createdBy = req.user.Name;
    const training = new Training({
      ...req.body,
      User: req.user._id,
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
router.get('/readTraining', async (req, res) => {
  console.log("request made for training")
  try {

    const training = await Training.find().populate('User');

    const trainingsToSend = training.filter((Obj) => {
      if (Obj.User.Department.equals(req.user.Department)) {
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