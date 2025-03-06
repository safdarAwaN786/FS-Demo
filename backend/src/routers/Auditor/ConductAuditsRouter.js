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
const { Checklists } = require('../../models/Auditor/ChecklistModel');
const { addFirstPage } = require('../Admin/UploadDocumentRouter');
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


// const addFirstPage = async (page, logoImage, Company, user, documentId, revisionNo) => {
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
//   // const companyContactText = `Contact # ${Company.PhoneNo}`;
//   // page.drawText(companyContactText, {
//   //   x: centerTextX - helveticaFont.widthOfTextAtSize(companyContactText, fontSize) / 2,
//   //   y: height - 450,
//   //   color: rgb(0, 0, 0),
//   //   fontSize
//   // });

//   // Add company email
//   // const companyEmailText = `${Company.Email}`;
//   // page.drawText(companyEmailText, {
//   //   x: centerTextX - helveticaFont.widthOfTextAtSize(companyEmailText, fontSize) / 2,
//   //   y: height - 480,
//   //   color: rgb(0, 0, 0),
//   //   fontSize
//   // });

//   // Add wrapped company address
//   const companyAddressText = `${Company.Address}`;
//     const wrappedAddress = wrapText(companyAddressText, maxWidth, helveticaFont, fontSize);
//     let yPosition = height - 450;
//     for (const line of wrappedAddress) {
//         page.drawText(line, {
//             x: centerTextX - helveticaFont.widthOfTextAtSize(line, fontSize) / 2,
//             y: yPosition,
//             color: rgb(0, 0, 0),
//             fontSize
//         });
//         yPosition -= 30; // Adjust line spacing
//     }

//     // Add uploaded by and date
//     const uploadByText = `Created By : ${user.Name}`;
//     page.drawText(uploadByText, {
//         x: centerTextX - helveticaFont.widthOfTextAtSize(uploadByText, 20) / 2,
//         y: yPosition - 50,
//         color: rgb(0, 0, 0),
//         size: 20
//     });

//     const uploadDateText = `Creation Date : ${formatDate(new Date())}`;
//     page.drawText(uploadDateText, {
//         x: centerTextX - helveticaFont.widthOfTextAtSize(uploadDateText, 20) / 2,
//         y: yPosition - 80,
//         color: rgb(0, 0, 0),
//         size: 20
//     });
//     if (documentId) {
//         const docIdText = `Document ID : ${documentId}`;
//         page.drawText(docIdText, {
//             x: centerTextX - helveticaFont.widthOfTextAtSize(docIdText, 20) / 2,
//             y: yPosition - 110,
//             color: rgb(0, 0, 0),
//             size: 20
//         });
//         if (revisionNo) {
//             const revisionNoText = `Revision No : ${revisionNo}`;
//             page.drawText(revisionNoText, {
//                 x: centerTextX - helveticaFont.widthOfTextAtSize(revisionNoText, 20) / 2,
//                 y: yPosition - 140,
//                 color: rgb(0, 0, 0),
//                 size: 20
//             });
//         }
//     } else {
//         if (revisionNo) {
//             const revisionNoText = `Revision No : ${revisionNo}`;
//             page.drawText(revisionNoText, {
//                 x: centerTextX - helveticaFont.widthOfTextAtSize(revisionNoText, 20) / 2,
//                 y: yPosition - 110,
//                 color: rgb(0, 0, 0),
//                 size: 20
//             });
//         }
//     }
// };


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
    console.log(req.body);

    const auditBy = requestUser.Name;
    let answers = JSON.parse(req.body.Answers);
    const checklist = await Checklists.findById(req.body.Checklist);
    const filesObj = req.files;
    console.log(checklist);

    if (filesObj.length !== 0) {

      // Process each question in the Questions array
      for (const key in filesObj) {
        const fileData = filesObj[key][0];
        const index = fileData.fieldname.split('-')[1];

        const response = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFDocument.load(fileData.buffer);
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
        addFirstPage(firstPage, pdfLogoImage, requestUser.Company, requestUser, `${checklist.ChecklistId}`);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        pdfDoc.getPages().slice(1).forEach(async (page) => {
          const { width, height } = page.getSize();
          const extraSpace = 38; // Increase this value for more space at the top
          // Resize the page to add extra space at the top
          page.setSize(width, height + extraSpace);
          // Move the original content down
          page.translateContent(0, -extraSpace);
          // Now add your custom text at the top
          const watermarkText = 'Evidence Document';
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

          const dateText = `Document ID : ${checklist.ChecklistId}`;
          const dateTextFontSize = 10;
          const dateTextWidth = helveticaFont.widthOfTextAtSize(dateText, dateTextFontSize);
          const centerDateTextX = width - dateTextWidth - 20;
          const centerDateTextY = height + extraSpace - 12; // Place in new space

          page.drawText(dateText, {
            x: centerDateTextX,
            y: centerDateTextY,
            size: dateTextFontSize,
            color: rgb(0, 0, 0)
          });


        });
        // Save the modified PDF
        const modifiedPdfBuffer = await pdfDoc.save();
        answers[index].EvidenceDoc = await uploadToCloudinary(modifiedPdfBuffer).then((result) => {
          return (result.secure_url)
        }).catch((err) => {
          console.log(err);
        });
        console.log('EvidenceDoc:', answers[index].EvidenceDoc)
      }
    }
    answers = answers.filter(ans => ans !== null)
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