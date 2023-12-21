const express = require('express');
const router = express.Router();
const CorrectiveAction = require('../../models/Auditor/CorrectiveActionModel'); // Import the CorrectiveAction model
const Reports = require('../../models/Auditor/ReportsModel')
const ConductAudits = require('../../models/Auditor/ConductAuditsModel')
const Checklists = require('../../models/Auditor/ChecklistModel')
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const authMiddleware = require('../../middleware/auth');
const { rgb, degrees, PDFDocument, StandardFonts } = require('pdf-lib');
const axios = require('axios');
router.use(authMiddleware);

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
const addFirstPage = async (page, logoImage, Company) => {
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
  };


function generateCorrectiveDocArray() {
    const array = [];
    for (let i = 0; i <= 100; i++) {
        array.push({ name: `CorrectiveDoc-${i}` });
    }
    return array;
}

// Function to check the existence of Question ID in documents
async function checkQuestionIdExistence(questionId, reportId) {
    const report = await Reports.findById(reportId);
    const conductAuditId = report.ConductAudit;

    const conductAudit = await ConductAudits.findOne({ _id: conductAuditId });
    const checklistId = conductAudit.ChecklistId;

    const checklist = await Checklists.findOne({ _id: checklistId });
    const questions = checklist.Questions;

    return questions.some(q => q.QuestionId === questionId);
}

// * POST CorrectiveAction Data Into MongoDB Database
router.post('/addCorrectiveAction', upload.fields(generateCorrectiveDocArray()), async (req, res) => {
    console.log(req.files);
    try {

        const correctionBy = req.user.Name;
        const answers = JSON.parse(req.body.Answers);
        console.log(answers);


        const filesObj = req.files;

        if (filesObj.length !== 0) {
            // Process each question in the Questions array
            for (const key in filesObj) {
                const fileData = filesObj[key][0];
                const index = fileData.fieldname.split('-')[1];
                const response = await axios.get(req.user.Company.CompanyLogo, { responseType: 'arraybuffer' });
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
                addFirstPage(firstPage, pdfLogoImage, req.user.Company);
                const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
                pdfDoc.getPages().slice(1).forEach(async (page) => {
                    const { width, height } = page.getSize();
                    const watermarkText = 'Powered By Feat Technology';
                    const watermarkFontSize = 20;
                    const watermarkTextWidth = (helveticaFont.widthOfTextAtSize(watermarkText, watermarkFontSize));
                    const centerWatermarkX = width / 2 - watermarkTextWidth / 2;
                    const centerWatermarkY = height / 2 + 150;
                    page.drawText(watermarkText, { x: centerWatermarkX, y: centerWatermarkY, fontSize: 20, color: rgb(0, 0, 0), opacity: 0.35, rotate: degrees(-45) });
                });
                // Save the modified PDF
                const modifiedPdfBuffer = await pdfDoc.save();
                answers[index].CorrectiveDoc = await uploadToCloudinary(modifiedPdfBuffer).then((result) => {
                    return (result.secure_url)
                }).catch((err) => {
                    console.log(err);
                });

                console.log('CorrectiveDoc :', answers[index].CorrectiveDoc);
            }

        }

        const correctiveAction = new CorrectiveAction({
            ...req.body,
            CorrectionBy: correctionBy,
            CorrectionDate: new Date(),
            User: req.user._id,
            Answers: answers
        });

        console.log(correctiveAction)
        await correctiveAction.save().then(() => {
            console.log('Action Added');
        })


        res.status(201).send({ status: true, message: "The CorrectiveAction is added!", data: correctiveAction });
        console.log(new Date().toLocaleString() + ' ' + 'ADD CorrectiveAction Successfully!');

    } catch (e) {
        console.error(e.message);
        res.status(400).json({ message: e.message });
    }
});

// * GET All CorrectiveAction Data From MongoDB Database
router.get('/readCorrectiveActionByReportId/:reportId', async (req, res) => {
    try {
        const correctiveActions = await CorrectiveAction.find({ Report: req.params.reportId }).populate('User').populate({
            path: 'Report',
            model: 'Reports',
            populate: {
                path: 'ConductAudit',
                model: 'ConductAudits',
                populate: {
                    path: 'Checklist',
                    model: 'Checklist',
                },
            },
        }).populate({
            path: 'Answers.question',
            model: 'ChecklistAnswer',
            populate: {
                path: 'question',
                model: 'ChecklistQuestion'
            }

        })

        const correctiveActionToSend = correctiveActions.filter(Obj => Obj.User.Department.equals(req.user.Department))


        res.status(200).send({ status: true, message: "The following are CorrectiveActions!", data: correctiveActionToSend });
        console.log(new Date().toLocaleString() + ' ' + 'READ CorrectiveActions Successfully!')

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});
router.get('/readCorrectiveActionById/:actionId', async (req, res) => {
    try {
        const correctiveAction = await CorrectiveAction.findById(req.params.actionId).populate('User').populate({
            path: 'Report',
            model: 'Reports',
            populate: {
                path: 'ConductAudit',
                model: 'ConductAudits',
                populate: {
                    path: 'Checklist',
                    model: 'Checklist',
                },
            },
        }).populate({
            path: 'Answers.question',
            model: 'ChecklistAnswer',
            populate: {
                path: 'question',
                model: 'ChecklistQuestion'
            }

        })




        res.status(200).send({ status: true, message: "The following are CorrectiveActions!", data: correctiveAction });
        console.log(new Date().toLocaleString() + ' ' + 'READ CorrectiveActions Successfully!')

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});

// * DELETE CorrectiveAction Data by ID From MongoDB Database
router.delete('/deleteCorrectiveAction', async (req, res) => {
    try {

        const correctiveAction = await CorrectiveAction.findByIdAndDelete(req.body.id);
        if (!correctiveAction) {
            return res.status(404).send({ status: false, message: "CorrectiveAction not found!" });
        }
        res.status(200).send({ status: true, message: "CorrectiveAction has been deleted!", data: correctiveAction });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE CorrectiveAction Successfully!');

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});

// * DELETE All CorrectiveAction Data From MongoDB Database
router.delete('/deleteAllCorrectiveActions', async (req, res) => {
    try {

        const result = await CorrectiveAction.deleteMany({});
        if (result.deletedCount === 0) {
            return res.status(404).send({ status: false, message: "No CorrectiveActions Found to Delete!" });
        }
        res.status(200).send({ status: true, message: "All CorrectiveActions have been deleted!", data: result });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE All CorrectiveActions Successfully!');

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;