const express = require('express');
const router = express.Router();
const CorrectiveAction = require('../../models/Auditor/CorrectiveActionModel'); // Import the CorrectiveAction model
const Reports = require('../../models/Auditor/ReportsModel')
const { ConductAudits } = require('../../models/Auditor/ConductAuditsModel')
const { Checklists } = require('../../models/Auditor/ChecklistModel')
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
// const authMiddleware = require('../../middleware/auth');
const { rgb, degrees, PDFDocument, StandardFonts } = require('pdf-lib');
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
    console.log(req.body);
    try {
        const requestUser = await user.findById(req.header('Authorization')).populate('Company Department')
        const reportData = await Reports.findById(req.body.Report);
        const conductAuditData = await ConductAudits.findById(reportData.ConductAudit)
        const checklist = await Checklists.findById(conductAuditData.Checklist)
        console.log(checklist);
        const correctionBy = requestUser.Name;
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
                    const extraSpace = 38; // Increase this value for more space at the top
                    // Resize the page to add extra space at the top
                    page.setSize(width, height + extraSpace);
                    // Move the original content down
                    page.translateContent(0, -extraSpace);
                    // Now add your custom text at the top
                    const watermarkText = 'Corrective Action Document';
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
            UserDepartment: requestUser.Department._id,
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
        const correctiveActions = await CorrectiveAction.find({ Report: req.params.reportId, UserDepartment: req.header('Authorization') }).populate('UserDepartment').populate({
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


        res.status(200).send({ status: true, message: "The following are CorrectiveActions!", data: correctiveActions });
        console.log(new Date().toLocaleString() + ' ' + 'READ CorrectiveActions Successfully!')

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});
router.get('/readCorrectiveActionById/:actionId', async (req, res) => {
    try {
        const correctiveAction = await CorrectiveAction.findById(req.params.actionId).populate('UserDepartment').populate({
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