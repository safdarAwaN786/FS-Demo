const express = require('express');
const router = express.Router();
const ConductAudits = require('../../models/Auditor/ConductAuditsModel').ConductAudits;
const { ChecklistAnswerModel } = require('../../models/Auditor/ConductAuditsModel');
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { rgb, degrees, PDFDocument, StandardFonts } = require('pdf-lib');
// const authMiddleware = require('../../middleware/auth');
const axios = require('axios');
const user = require('../../models/AccountCreation/UserModel');
// router.use(authMiddleware);

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
            console.log(error);
            reject(new Error('Failed to upload file to Cloudinary'));
          } else {
            console.log('success');
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
const formatDate = (date) => {

  const newDate = new Date(date);
  const formatDate = newDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return formatDate;
}

function generateEvidenceDocArray() {
  const array = [];
  for (let i = 0; i <= 100; i++) {
    array.push({ name: `EvidenceDoc-${i}` });
  }
  return array;
}

// * POST ConductAudit Data Into MongoDB Database
router.post('/addConductAudit', upload.fields(generateEvidenceDocArray()), async (req, res) => {

  try {
    const requestUser = await user.findById(req.header('Authorization')).populate('Company Department')

    const auditBy = requestUser.Name;
    const answers = JSON.parse(req.body.Answers);

    const filesObj = req.files;
    if (filesObj.length !== 0) {

      // Process each question in the Questions array
      for (const key in filesObj) {
        const fileData = filesObj[key][0];
        const index = fileData.fieldname.split('-')[1];

        const response = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFDocument.load(fileData.buffer);
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
        console.log(modifiedPdfBuffer);
        answers[index].EvidenceDoc = await uploadToCloudinary(modifiedPdfBuffer).then(async (result) => {
          await axios.get(result.secure_url, { responseType: 'arraybuffer' }).then((res) => {
            console.log(res)
          }).catch(err => {
            console.log(err);
          });
          // return (result.secure_url)
        }).catch((err) => {
          console.log(err);
        });
        console.log('EvidenceDoc:', answers[index].EvidenceDoc)
      }
    }
    console.log(answers);
    const createdAnswers = await ChecklistAnswerModel.create(answers);
    const answersArr = Object.values(createdAnswers);
    const answersIds = answersArr.map(answerObj => answerObj._id);
    console.log(answersIds);
    // Create ConductAudit for this question
    const conductAudit = new ConductAudits({
      ...req.body,
      AuditBy: auditBy,
      AuditDate: new Date(),
      Answers: answersIds,
      UserDepartment: requestUser.Department._id
    });

    await conductAudit.save();
    res.status(201).send({ status: true, message: "ConductAudits added successfully!", data: conductAudit });
    console.log(new Date().toLocaleString() + ' ' + 'ADD ConductAudit Successfully!');

  } catch (e) {
    console.error(e.message);
    res.status(400).json({ message: e.message });
  }
});



// * GET All ConductAudit Data From MongoDB Database
router.get('/readConductAudits', async (req, res) => {
  try {
    const conductAudits = await ConductAudits.find({ UserDepartment: req.header('Authorization') }).populate({
      path: 'Checklist',
      model: 'Checklist',
      populate: {
        path: 'Department',
        model: 'Department'
      }
    }).populate({
      path: 'Answers',
      model: 'ChecklistAnswer',
      populate: {
        path: 'question',
        model: 'ChecklistQuestion'
      }
    }).populate({
      path: 'UserDepartment',

      model: 'Department'
    });


    res.status(200).send({ status: true, message: "The following are ConductAudits!", data: conductAudits });
    console.log(new Date().toLocaleString() + ' ' + 'READ ConductAudits Successfully!')

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

// * Get ConductAudit By Id
router.get('/get-conduct-audits-by-ChecklistId/:ChecklistId', async (req, res) => {
  try {
    const checklistId = req.params.ChecklistId;
    const conductAudits = await ConductAudits.find({ Checklist: checklistId, UserDepartment: req.header('Authorization') }).populate({
      path: 'Checklist',
      model: 'Checklist',
      populate: {
        path: 'Department',
        model: 'Department'
      }
    }).populate({
      path: 'Answers',
      model: 'ChecklistAnswer',
      populate: {
        path: 'question',
        model: 'ChecklistQuestion'
      }
    }).populate('UserDepartment');

    if (!conductAudits) {
      console.log(new Date().toLocaleString() + ' ' + 'Conduct audits not found for the form');
      return res.status(404).json({ error: 'Conduct audits not found' });
    }
    res.status(200).send({ status: true, message: "The following are ConductAudits!", data: conductAudits });
    console.log(new Date().toLocaleString() + ' ' + 'Conduct Audit Responses Retrieved Successfully');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting conduct audit responses' });
  }
});
router.get('/get-conduct-audit-by-auditId/:auditId', async (req, res) => {
  try {
    const auditId = req.params.auditId;
    const conductAudit = await ConductAudits.findById(auditId).populate({
      path: 'Checklist',
      model: 'Checklist',
      populate: {
        path: 'Department',
        model: 'Department'
      }
    }).populate({
      path: 'Answers',
      model: 'ChecklistAnswer',
      populate: {
        path: 'question',
        model: 'ChecklistQuestion'
      }
    }).populate('UserDepartment');

    if (!conductAudit) {
      console.log(new Date().toLocaleString() + ' ' + 'Conduct audits not found for the form');
      return res.status(404).json({ error: 'Conduct audits not found' });
    }

    res.status(200).send({ status: true, message: "The following are ConductAudits!", data: conductAudit });
    console.log(new Date().toLocaleString() + ' ' + 'Conduct Audit Responses Retrieved Successfully');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting conduct audit responses' });
  }
});

// * DELETE ConductAudit Data by ID From MongoDB Database
router.delete('/deleteConductAudit', async (req, res) => {
  try {

    const conductAudit = await ConductAudits.findByIdAndDelete(req.body.id);
    if (!conductAudit) {
      return res.status(404).send({ status: false, message: "ConductAudit not found!" });
    }

    res.status(200).send({ status: true, message: "ConductAudit has been deleted!", data: conductAudit });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE ConductAudit Successfully!');

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

// * DELETE All ConductAudit Data From MongoDB Database
router.delete('/deleteAllConductAudits', async (req, res) => {
  try {

    const result = await ConductAudits.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).send({ status: false, message: "No ConductAudits Found to Delete!" });
    }
    res.status(200).send({ status: true, message: "All ConductAudits have been deleted!", data: result });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE All ConductAudits Successfully!');

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;