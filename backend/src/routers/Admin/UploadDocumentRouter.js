const express = require('express');
const uploadDocument = require('../../models/Admin/UploadDocumentsModel')
const router = new express.Router();
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
// const authMiddleware = require('../../middleware/auth');
const { rgb, PDFDocument, StandardFonts } = require('pdf-lib');
// router.use(authMiddleware);
const axios = require('axios');
const user = require('../../models/AccountCreation/UserModel');

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

// Function to create a first page with approval information
const addFirstPageWithApproval = async (page, logoImage, company, creatorName, createdDate, documentId, revisionNo, reviewedBy, reviewDate, approvedBy, approvalDate) => {
    try {


        const { width, height } = page.getSize();

        const helveticaFont = await page.doc.embedFont(StandardFonts.Helvetica);
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
        const companyNameText = company.CompanyName;
        page.drawText(companyNameText, {
            x: centerTextX - helveticaFont.widthOfTextAtSize(companyNameText, fontSize) / 2,
            y: height - 420,
            color: rgb(0, 0, 0),
            fontSize
        });

        // Add wrapped company address
        const companyAddressText = `${company.Address}`;
        const wrappedAddress = wrapText(companyAddressText, maxWidth, helveticaFont, fontSize);
        let yPosition = height - 450;
        for (const line of wrappedAddress) {
            page.drawText(line, {
                x: centerTextX - helveticaFont.widthOfTextAtSize(line, fontSize) / 2,
                y: yPosition,
                color: rgb(0, 0, 0),
                fontSize
            });
            yPosition -= 30; // Adjust line spacing
        }

        // Add created by and date
        const uploadByText = `Created By : `;
        page.drawText(uploadByText, {
            x: 80,
            y: yPosition - 50,
            color: rgb(0, 0, 0),
            size: 15
        });


        page.drawText(creatorName, {
            x: 330,
            y: yPosition - 50,
            color: rgb(0, 0, 0),
            size: 15
        });

        const uploadDateText = `Creation Date : `;
        page.drawText(uploadDateText, {
            x: 80,
            y: yPosition - 80,
            color: rgb(0, 0, 0),
            size: 15
        });



        page.drawText(formatDate(new Date(createdDate)), {
            x: 330,
            y: yPosition - 80,
            color: rgb(0, 0, 0),
            size: 15
        });

        // Add document ID and revision number
        const docIdText = `Document ID : `;
        page.drawText(docIdText, {
            x: 80,
            y: yPosition - 110,
            color: rgb(0, 0, 0),
            size: 15
        });

        page.drawText(documentId, {
            x: 330,
            y: yPosition - 110,
            color: rgb(0, 0, 0),
            size: 15
        });

        // Add review information
        const reviewedByText = `Reviewed By : `;
        page.drawText(reviewedByText, {
            x: 80,
            y: yPosition - 140,
            color: rgb(0, 0, 0),
            size: 15
        });

        page.drawText(reviewedBy, {
            x: 330,
            y: yPosition - 140,
            color: rgb(0, 0, 0),
            size: 15
        });

        const reviewDateText = `Review Date : `;
        page.drawText(reviewDateText, {
            x: 80,
            y: yPosition - 170,
            color: rgb(0, 0, 0),
            size: 15
        });

        page.drawText(reviewDate !== '---' ? formatDate(new Date(reviewDate)) : reviewDate, {
            x: 330,
            y: yPosition - 170,
            color: rgb(0, 0, 0),
            size: 15
        });


        // Add approval information with highlighted status
        const approvedByText = `Approved By : `;
        page.drawText(approvedByText, {
            x: 80,
            y: yPosition - 200,
            color: rgb(0, 0, 0), // Green color for approval
            size: 15
        });

        page.drawText(approvedBy, {
            x: 330,
            y: yPosition - 200,
            color: rgb(0, 0, 0), // Green color for approval
            size: 15
        });


        const approvalDateText = `Approval Date : `;
        page.drawText(approvalDateText, {
            x: 80,
            y: yPosition - 230,
            color: rgb(0, 0, 0), // Green color for approval
            size: 15
        });

        page.drawText(approvalDate !== '---' ? formatDate(approvalDate) : approvalDate, {
            x: 330,
            y: yPosition - 230,
            color: rgb(195, 192, 192), // Green color for approval
            size: 15
        });

        const revisionNoText = `Revision No : `;
        page.drawText(revisionNoText, {
            x: 80,
            y: yPosition - 260,
            color: rgb(0, 0, 0),
            size: 15
        });

        page.drawText(`${revisionNo}`, {
            x: 330,
            y: yPosition - 260,
            color: rgb(0, 0, 0),
            size: 15
        });



    } catch (error) {
        console.log(error);
    }
};



const addFirstPage = async (page, logoImage, Company, user, documentId, revisionNo) => {
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

    // Add wrapped company address
    const companyAddressText = `${Company.Address}`;
    const wrappedAddress = wrapText(companyAddressText, maxWidth, helveticaFont, fontSize);
    let yPosition = height - 450;
    for (const line of wrappedAddress) {
        page.drawText(line, {
            x: centerTextX - helveticaFont.widthOfTextAtSize(line, fontSize) / 2,
            y: yPosition,
            color: rgb(0, 0, 0),
            fontSize
        });
        yPosition -= 30; // Adjust line spacing
    }
    console.log(width);

    // Add uploaded by and date
    const uploadByText = `Created By : `;
    page.drawText(uploadByText, {
        // x: centerTextX - helveticaFont.widthOfTextAtSize(uploadByText, 20) / 2,
        x: 80,
        y: yPosition - 50,
        color: rgb(0, 0, 0),
        size: 15
    });

    page.drawText(user.Name, {

        x: 330,
        y: yPosition - 50,
        color: rgb(0, 0, 0),
        size: 15
    });

    const uploadDateText = `Creation Date : `;
    page.drawText(uploadDateText, {
        x: 80,
        y: yPosition - 80,
        color: rgb(0, 0, 0),
        size: 15
    });


    page.drawText(formatDate(new Date()), {
        x: 330,
        y: yPosition - 80,
        color: rgb(0, 0, 0),
        size: 15
    });
    if (documentId) {
        const docIdText = `Document ID : `;
        page.drawText(docIdText, {
            x: 80,
            y: yPosition - 110,
            color: rgb(0, 0, 0),
            size: 15
        });


        page.drawText(documentId, {
            x: 330,
            y: yPosition - 110,
            color: rgb(0, 0, 0),
            size: 15
        });
        if (revisionNo) {
            const revisionNoText = `Revision No : `;
            page.drawText(revisionNoText, {
                x: 80,
                y: yPosition - 140,
                color: rgb(0, 0, 0),
                size: 15
            });

            page.drawText(revisionNo, {
                x: 330,
                y: yPosition - 140,
                color: rgb(0, 0, 0),
                size: 15
            });
        }
    } else {
        if (revisionNo) {
            const revisionNoText = `Revision No : `;
            page.drawText(revisionNoText, {
                x: 80,
                y: yPosition - 110,
                color: rgb(0, 0, 0),
                size: 15
            });

            page.drawText(revisionNo, {
                x: 330,
                y: yPosition - 110,
                color: rgb(0, 0, 0),
                size: 15
            });
        }
    }
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
        console.log(error);

        console.log('error inside uploadation' + error);
    }
};

// * Upload a New Document
router.post('/uploadDocument', upload.single('file'), async (req, res) => {
    console.log('upload doc');

    try {
        const requestUser = await user.findById(req.header('Authorization')).populate('Company Department')

        const createdBy = requestUser.Name;
        const { Department, DocumentType, DocumentName } = req.body;
        const newDocument = new uploadDocument({
            DocumentName: DocumentName,
            Department: Department,
            DocumentType: DocumentType,
            CreatedBy: requestUser.Name,
            CreationDate: new Date(),
            UserDepartment: requestUser.Department._id,

        });
        await newDocument.save();
        console.log(newDocument);

        const response = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFDocument.load(req.file.buffer);
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
        addFirstPage(firstPage, pdfLogoImage, requestUser.Company, requestUser, newDocument.DocumentId, '0');
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        pdfDoc.getPages().slice(1).forEach(async (page) => {
            const { width, height } = page.getSize();
            const extraSpace = 34; // Increase this value for more space at the top

            // Resize the page to add extra space at the top
            page.setSize(width, height + extraSpace);

            // Move the original content down
            page.translateContent(0, -extraSpace);

            // Now add your custom text at the top
            const watermarkText = newDocument.DocumentName;
            const watermarkFontSize = 10;
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

            const docIdText = `Doc ID : ${newDocument.DocumentId}`;
            const docIdTextFontSize = 10;
            const docIdTextWidth = helveticaFont.widthOfTextAtSize(docIdText, docIdTextFontSize);
            const centerDocIdTextX = width - docIdTextWidth - 20;
            const centerDocIdTextY = height + extraSpace - 12; // Place in new space

            page.drawText(docIdText, {
                x: centerDocIdTextX,
                y: centerDocIdTextY,
                size: docIdTextFontSize,
                color: rgb(0, 0, 0)
            });


            const revisionNoText = `Revision No : 0`;
            const revisionNoTextFontSize = 10;
            const revisionNoTextWidth = helveticaFont.widthOfTextAtSize(revisionNoText, revisionNoTextFontSize);
            const centerRevisionNoTextX = width - revisionNoTextWidth - 20;
            const centerRevisionNoTextY = height + extraSpace - 24; // Place in new space

            page.drawText(revisionNoText, {
                x: centerRevisionNoTextX,
                y: centerRevisionNoTextY,
                size: revisionNoTextFontSize,
                color: rgb(0, 0, 0)
            });
        });

        // Save the modified PDF
        const modifiedPdfBuffer = await pdfDoc.save();
        const result = await uploadToCloudinary(modifiedPdfBuffer);
        const updated = await uploadDocument.findByIdAndUpdate(newDocument._id, {
            UploadedDocuments: [
                {
                    RevisionNo: 0,
                    DocumentUrl: result.secure_url,
                    CreationDate: new Date(),
                    CreatedBy: createdBy,
                    ReviewDate: null,
                    ReviewedBy: 'Pending',
                    ApprovalDate: null,
                    ApprovedBy: 'Pending',
                    Comment: null
                }]
        }, { new: true })
        console.log(updated);

        res.status(201).send({ status: true, message: 'Document uploaded successfully', data: newDocument });
    } catch (error) {
        console.log('from 141 : ' + error);
        res.status(500).send({ status: false, message: 'Failed to upload document', error: error.message });
    }
});

// * Get All Documents
router.get('/readAllDocuments', async (req, res) => {
    try {
        const departmentId = req.header('Authorization')
        const documents = await uploadDocument.find({ UserDepartment: departmentId }).populate('Department UserDepartment');
        res.status(200).send({ status: true, message: "The following are Documents!", data: documents });
        console.log('READ Documents Successfully!')
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// * Get Document By Id
router.get('/readDocumentById/:documentId', async (req, res) => {
    try {
        const documentId = req.params.documentId;
        const document = await uploadDocument.findById(documentId).populate('Department UserDepartment');
        res.status(200).send({ status: true, message: "The following are Documents!", data: document });
        console.log('READ Documents Successfully!')
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// * Review Uploaded Document
router.patch('/review-uploaded-document', async (req, res) => {
    try {
        const { documentId, reviewBy } = req.body;
        // Find the document by ID
        const document = await uploadDocument.findById(documentId);
        // If document not found
        if (!document) {
            console.error(`Document with ID: ${document} not found.`);
            return res.status(404).json({ error: 'Document not found.' });
        }
        const requestUser = await user.findById(req.header('Authorization')).populate('Company Department')
        // Ensure the document status is pending
        if (document.Status !== 'Pending') {
            console.warn(`Document with ID: ${documentId} cannot be reviewed as it is not in 'Pending' status.`);
            return res.status(400).json({ error: 'Document status is not eligible for review.' });
        }

        // Get the latest document URL from the uploaded documents array
        const latestDocIndex = document.UploadedDocuments.length - 1;
        const documentUrl = document.UploadedDocuments[latestDocIndex].DocumentUrl;

        document.ReviewDate = new Date(),
            document.Status = 'Reviewed';
        document.RejectionDate = null;
        document.RejectedBy = null;
        document.ReviewedBy = reviewBy

        document.UploadedDocuments[latestDocIndex].ReviewDate = new Date();
        document.UploadedDocuments[latestDocIndex].ReviewedBy = reviewBy;


        // Now update the PDF with approval information
        try {
            // Fetch the PDF from Cloudinary
            const response = await axios.get(documentUrl, { responseType: 'arraybuffer' });
            const pdfBuffer = Buffer.from(response.data);

            // Load the PDF
            const pdfDoc = await PDFDocument.load(pdfBuffer);

            // Remove the first page (cover page)
            pdfDoc.removePage(0);

            // Get company logo
            const logoResponse = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
            const logoImage = Buffer.from(logoResponse.data);

            // Embed logo based on file type
            let pdfLogoImage;
            const isJpg = requestUser.Company.CompanyLogo.includes('.jpeg') || requestUser.Company.CompanyLogo.includes('.jpg');
            const isPng = requestUser.Company.CompanyLogo.includes('.png');

            if (isJpg) {
                pdfLogoImage = await pdfDoc.embedJpg(logoImage);
            } else if (isPng) {
                pdfLogoImage = await pdfDoc.embedPng(logoImage);
            }

            // Insert new first page
            const firstPage = pdfDoc.insertPage(0);

            // Current revision number
            const currentRevisionNo = document.UploadedDocuments[latestDocIndex].RevisionNo || 0;

            // Get review information (if available)
            const approvedBy = document.UploadedDocuments[latestDocIndex].ApprovedBy || 'Not Approved';
            const approveDate = document.UploadedDocuments[latestDocIndex].ApprovalDate || '---';

            const createdBy = document.UploadedDocuments[latestDocIndex].CreatedBy;
            const creationDate = document.UploadedDocuments[latestDocIndex].CreationDate;

            // Add first page with updated information including approval details
            await addFirstPageWithApproval(
                firstPage,
                pdfLogoImage,
                requestUser.Company,
                createdBy,
                creationDate,
                document.DocumentId,
                currentRevisionNo,
                reviewBy,
                document.ReviewDate,
                approvedBy,
                approveDate
            );


            // Save the modified PDF
            const modifiedPdfBuffer = await pdfDoc.save();

            // Upload to Cloudinary
            const result = await uploadToCloudinary(modifiedPdfBuffer);
            document.UploadedDocuments[latestDocIndex].DocumentUrl = result.secure_url;


        } catch (error) {
            console.error('Error updating PDF with approval:', error);
            // Continue with approval even if PDF update fails
            console.warn('Continuing with approval despite PDF update failure');
        }

        const updatedDoocument = await uploadDocument.findByIdAndUpdate(
            document._id,
            document,
            { new: true }
        );

        // Save the updated document
        // await document.save();
        res.status(200).send({ status: true, message: 'Document reviewed successfully', data: document });

    } catch (error) {
        res.status(500).send({ status: false, message: 'Failed to update document review', error: error.message });
    }
});

// * Reject Uploaded Document
router.patch('/reject-uploaded-document', async (req, res) => {
    try {
        const { documentId, reason, rejectBy } = req.body;

        // Find the document by ID
        const document = await uploadDocument.findById(documentId);

        // If document not found
        if (!document) {
            console.error(`Document with ID: ${document} not found.`);
            return res.status(404).json({ error: 'Document not found.' });
        }
        const requestUser = await user.findById(req.header('Authorization')).populate('Company Department')
        // Ensure the document status is pending
        if (document.Status !== 'Pending' && document.Status !== 'Reviewed') {
            console.warn(`Document with ID: ${documentId} cannot be rejected as it is not in 'Pending' status.`);
            return res.status(400).json({ error: 'Document status is not eligible for rejection.' });
        }

        // Get the latest document URL from the uploaded documents array
        const latestDocIndex = document.UploadedDocuments.length - 1;
        const documentUrl = document.UploadedDocuments[latestDocIndex].DocumentUrl;


        document.Reason = reason
        document.RejectionDate = new Date(),
            document.ReviewDate = null;
        document.ReviewedBy = null;
        document.Status = 'Rejected';
        document.RejectedBy = rejectBy
        document.UploadedDocuments[document.UploadedDocuments.length - 1].ReviewDate = null;
        document.UploadedDocuments[document.UploadedDocuments.length - 1].ReviewedBy = null;




        // Now update the PDF with approval information
        try {
            // Fetch the PDF from Cloudinary
            const response = await axios.get(documentUrl, { responseType: 'arraybuffer' });
            const pdfBuffer = Buffer.from(response.data);

            // Load the PDF
            const pdfDoc = await PDFDocument.load(pdfBuffer);

            // Remove the first page (cover page)
            pdfDoc.removePage(0);

            // Get company logo
            const logoResponse = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
            const logoImage = Buffer.from(logoResponse.data);

            // Embed logo based on file type
            let pdfLogoImage;
            const isJpg = requestUser.Company.CompanyLogo.includes('.jpeg') || requestUser.Company.CompanyLogo.includes('.jpg');
            const isPng = requestUser.Company.CompanyLogo.includes('.png');

            if (isJpg) {
                pdfLogoImage = await pdfDoc.embedJpg(logoImage);
            } else if (isPng) {
                pdfLogoImage = await pdfDoc.embedPng(logoImage);
            }

            // Insert new first page
            const firstPage = pdfDoc.insertPage(0);

            // Current revision number
            const currentRevisionNo = document.UploadedDocuments[latestDocIndex].RevisionNo || 0;

            // Get review information (if available)
            const reviewedBy = document.UploadedDocuments[latestDocIndex].ReviewedBy || 'Not Reviewed';
            const reviewDate = document.UploadedDocuments[latestDocIndex].ReviewDate || '---';

            const approvedBy = document.UploadedDocuments[latestDocIndex].ApprovedBy || 'Not Approved';
            const approveDate = document.UploadedDocuments[latestDocIndex].ApprovalDate || '---';

            const createdBy = document.UploadedDocuments[latestDocIndex].CreatedBy;
            const creationDate = document.UploadedDocuments[latestDocIndex].CreationDate;

            // Add first page with updated information including approval details
            await addFirstPageWithApproval(
                firstPage,
                pdfLogoImage,
                requestUser.Company,
                createdBy,
                creationDate,
                document.DocumentId,
                currentRevisionNo,
                'Not Reviewed',
                '---',
                approvedBy,
                approveDate
            );

            // Embed font for header updates
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Update approval status in header for all subsequent pages
            pdfDoc.getPages().slice(1).forEach(async (page) => {
                const { width, height } = page.getSize();

                const approvedText = `Issue Date: ${formatDate(document.ApprovalDate)}`;

                const approvedTextWidth = helveticaFont.widthOfTextAtSize(approvedText, 10);
                // Add approval text in header - first create a background to cover any existing text
                page.drawRectangle({
                    x: width - approvedTextWidth - 20,
                    y: height - 71,
                    width: 200,
                    height: 12,
                    color: rgb(1, 1, 1), // White color to cover existing text
                });


                // page.drawText(approvedText, {
                //     x: width - approvedTextWidth - 20,
                //     y: height - 69,
                //     size: approvedTextFontSize,
                //     color: rgb(0, 0, 0), // Green color for approval
                // });
            });

            // Save the modified PDF
            const modifiedPdfBuffer = await pdfDoc.save();

            // Upload to Cloudinary
            const result = await uploadToCloudinary(modifiedPdfBuffer);
            document.UploadedDocuments[latestDocIndex].DocumentUrl = result.secure_url;


        } catch (error) {
            console.error('Error updating PDF with approval:', error);
            // Continue with approval even if PDF update fails
            console.warn('Continuing with approval despite PDF update failure');
        }

        const updatedDoocument = await uploadDocument.findByIdAndUpdate(
            document._id,
            document,
            { new: true }
        );
        // Save the updated document
        // await document.save();
        res.status(200).send({ status: true, message: 'Document rejected successfully', data: document });

    } catch (error) {
        res.status(500).send({ status: false, message: 'Failed to update document reject', error: error.message });
    }
});

// * Approve Uploaded Document
router.patch('/approve-uploaded-document', async (req, res) => {
    try {
        const { documentId, approvedBy } = req.body;
        const requestUser = await user.findById(req.header('Authorization')).populate('Company Department')
        // Find the document by ID
        const document = await uploadDocument.findById(documentId);

        // If document not found
        if (!document) {
            console.error(`Document with ID: ${document} not found.`);
            return res.status(404).json({ error: 'Document not found.' });
        }
        // Ensure the document status is not already Approved or Disapproved
        if (document.Status === 'Approved' || document.Status === 'Disapproved' || document.Status === 'Rejected' || document.Status === 'Pending') {
            console.warn(`Document with ID: ${documentId} cannot be approved as it is already in 'Approved' or 'Disapproved' or 'Rejected' or 'Pending' status.`);
            return res.status(400).json({ error: 'Document status is not eligible for approval.' });
        }


        // Get the latest document URL from the uploaded documents array
        const latestDocIndex = document.UploadedDocuments.length - 1;
        const documentUrl = document.UploadedDocuments[latestDocIndex].DocumentUrl;



        document.ApprovalDate = new Date(),
            document.ApprovedBy = approvedBy,
            document.Status = 'Approved';
        document.DisapprovalDate = null;
        document.DisapprovedBy = null;
        document.UploadedDocuments[latestDocIndex].ApprovalDate = new Date();
        document.UploadedDocuments[latestDocIndex].ApprovedBy = approvedBy;


        // Now update the PDF with approval information
        try {
            // Fetch the PDF from Cloudinary
            const response = await axios.get(documentUrl, { responseType: 'arraybuffer' });
            const pdfBuffer = Buffer.from(response.data);

            // Load the PDF
            const pdfDoc = await PDFDocument.load(pdfBuffer);

            // Remove the first page (cover page)
            pdfDoc.removePage(0);

            // Get company logo
            const logoResponse = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
            const logoImage = Buffer.from(logoResponse.data);

            // Embed logo based on file type
            let pdfLogoImage;
            const isJpg = requestUser.Company.CompanyLogo.includes('.jpeg') || requestUser.Company.CompanyLogo.includes('.jpg');
            const isPng = requestUser.Company.CompanyLogo.includes('.png');

            if (isJpg) {
                pdfLogoImage = await pdfDoc.embedJpg(logoImage);
            } else if (isPng) {
                pdfLogoImage = await pdfDoc.embedPng(logoImage);
            }

            // Insert new first page
            const firstPage = pdfDoc.insertPage(0);

            // Current revision number
            const currentRevisionNo = document.UploadedDocuments[latestDocIndex].RevisionNo || 0;

            // Get review information (if available)
            const reviewedBy = document.UploadedDocuments[latestDocIndex].ReviewedBy || 'Not Reviewed';
            const reviewDate = document.UploadedDocuments[latestDocIndex].ReviewDate || '---';

            const createdBy = document.UploadedDocuments[latestDocIndex].CreatedBy;
            const creationDate = document.UploadedDocuments[latestDocIndex].CreationDate;



            // Add first page with updated information including approval details
            await addFirstPageWithApproval(
                firstPage,
                pdfLogoImage,
                requestUser.Company,
                createdBy,
                creationDate,
                document.DocumentId,
                currentRevisionNo,
                reviewedBy,
                reviewDate,
                approvedBy,
                document.ApprovalDate
            );

            // Embed font for header updates
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Update approval status in header for all subsequent pages
            pdfDoc.getPages().slice(1).forEach(async (page) => {
                const { width, height } = page.getSize();

                const approvedText = `Issue Date: ${formatDate(document.ApprovalDate)}`;

                const approvedTextWidth = helveticaFont.widthOfTextAtSize(approvedText, 10);
                // Add approval text in header - first create a background to cover any existing text
                page.drawRectangle({
                    x: width - approvedTextWidth - 20,
                    y: height - 71,
                    width: 200,
                    height: 12,
                    color: rgb(1, 1, 1), // White color to cover existing text
                });

                // Draw approval text
                const approvedTextFontSize = 10;

                page.drawText(approvedText, {
                    x: width - approvedTextWidth - 20,
                    y: height - 69,
                    size: approvedTextFontSize,
                    color: rgb(0, 0, 0), // Green color for approval
                });
            });

            // Save the modified PDF
            const modifiedPdfBuffer = await pdfDoc.save();

            // Upload to Cloudinary
            const result = await uploadToCloudinary(modifiedPdfBuffer);


            document.UploadedDocuments[latestDocIndex].DocumentUrl = result.secure_url;

        } catch (error) {
            console.error('Error updating PDF with approval:', error);
            // Continue with approval even if PDF update fails
            console.warn('Continuing with approval despite PDF update failure');
        }



        // Save the updated document
        const updatedDocument = await uploadDocument.findByIdAndUpdate(
            document._id,
            document,
            { new: true }
        );
        // Save the updated document
        // await document.save();
        res.status(200).send({ status: true, message: 'Document approved successfully', data: document });

    } catch (error) {
        res.status(500).send({ status: false, message: 'Failed to update document approve', error: error.message });
    }
});

// * Diapprove Uploaded Document
router.patch('/disapprove-uploaded-document', async (req, res) => {
    try {

        const { documentId, reason, disapprovedBy } = req.body;
        const requestUser = await user.findById(req.header('Authorization')).populate('Company Department')
        // Find the document by ID
        const document = await uploadDocument.findById(documentId);

        // If document not found
        if (!document) {
            console.error(`Document with ID: ${document} not found.`);
            return res.status(404).json({ error: 'Document not found.' });
        }
        // Ensure the document status is not already Approved or Disapproved
        if (document.Status === 'Approved' || document.Status === 'Disapproved' || document.Status === 'Rejected' || document.Status === 'Pending') {
            console.warn(`Document with ID: ${documentId} cannot be disapproved as it is already in 'Approved' or 'Disapproved' or 'Rejected' or 'Pending' status.`);
            return res.status(400).json({ error: 'Document status is not eligible for disapproval.' });
        }


        // Get the latest document URL from the uploaded documents array
        const latestDocIndex = document.UploadedDocuments.length - 1;
        const documentUrl = document.UploadedDocuments[latestDocIndex].DocumentUrl;


        document.DisapprovalDate = new Date();
        document.Status = 'Disapproved';
        document.Reason = reason;
        document.ApprovalDate = null;
        document.ApprovedBy = null;
        document.DisapprovedBy = disapprovedBy;
        document.UploadedDocuments[latestDocIndex].ApprovalDate = null;
        document.UploadedDocuments[latestDocIndex].ApprovedBy = null;


        // Now update the PDF with approval information
        try {
            // Fetch the PDF from Cloudinary
            const response = await axios.get(documentUrl, { responseType: 'arraybuffer' });
            const pdfBuffer = Buffer.from(response.data);

            // Load the PDF
            const pdfDoc = await PDFDocument.load(pdfBuffer);

            // Remove the first page (cover page)
            pdfDoc.removePage(0);

            // Get company logo
            const logoResponse = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
            const logoImage = Buffer.from(logoResponse.data);

            // Embed logo based on file type
            let pdfLogoImage;
            const isJpg = requestUser.Company.CompanyLogo.includes('.jpeg') || requestUser.Company.CompanyLogo.includes('.jpg');
            const isPng = requestUser.Company.CompanyLogo.includes('.png');

            if (isJpg) {
                pdfLogoImage = await pdfDoc.embedJpg(logoImage);
            } else if (isPng) {
                pdfLogoImage = await pdfDoc.embedPng(logoImage);
            }

            // Insert new first page
            const firstPage = pdfDoc.insertPage(0);

            // Current revision number
            const currentRevisionNo = document.UploadedDocuments[latestDocIndex].RevisionNo || 0;

            // Get review information (if available)
            const reviewedBy = document.UploadedDocuments[latestDocIndex].ReviewedBy || 'Not Reviewed';
            const reviewDate = document.UploadedDocuments[latestDocIndex].ReviewDate || '---';



            const createdBy = document.UploadedDocuments[latestDocIndex].CreatedBy;
            const creationDate = document.UploadedDocuments[latestDocIndex].CreationDate;

            // Add first page with updated information including approval details
            await addFirstPageWithApproval(
                firstPage,
                pdfLogoImage,
                requestUser.Company,
                createdBy,
                creationDate,
                document.DocumentId,
                currentRevisionNo,
                reviewedBy,
                reviewDate,
                'Not Approved',
                '---'
            );

            // Embed font for header updates
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Update approval status in header for all subsequent pages
            pdfDoc.getPages().slice(1).forEach(async (page) => {
                const { width, height } = page.getSize();

                const approvedText = `Issue Date: ${formatDate(document.ApprovalDate)}`;

                const approvedTextWidth = helveticaFont.widthOfTextAtSize(approvedText, 10);
                // Add approval text in header - first create a background to cover any existing text
                page.drawRectangle({
                    x: width - approvedTextWidth - 20,
                    y: height - 71,
                    width: 200,
                    height: 12,
                    color: rgb(1, 1, 1), // White color to cover existing text
                });


                // page.drawText(approvedText, {
                //     x: width - approvedTextWidth - 20,
                //     y: height - 69,
                //     size: approvedTextFontSize,
                //     color: rgb(0, 0, 0), // Green color for approval
                // });
            });

            // Save the modified PDF
            const modifiedPdfBuffer = await pdfDoc.save();

            // Upload to Cloudinary
            const result = await uploadToCloudinary(modifiedPdfBuffer);
            document.UploadedDocuments[latestDocIndex].DocumentUrl = result.secure_url;


        } catch (error) {
            console.error('Error updating PDF with approval:', error);
            // Continue with approval even if PDF update fails
            console.warn('Continuing with approval despite PDF update failure');
        }



        const updatedDoocument = await uploadDocument.findByIdAndUpdate(
            document._id,
            document,
            { new: true }
        );
        // Save the updated document
        // await document.save();
        res.status(200).send({ status: true, message: 'Document disapproved successfully', data: document });

    } catch (error) {
        res.status(500).send({ status: false, message: 'Failed to update document disapprove', error: error.message });
    }
});

// * Add comment to Uploaded Document
router.patch('/comment-document/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        // Find the document by ID
        const document = await uploadDocument.findById(documentId);
        // If document not found
        if (!document) {
            console.error(`Document with ID: ${document} not found.`);
            return res.status(404).json({ error: 'Document not found.' });
        }
        console.log(req.body);
        document.UploadedDocuments[req.body.objIndex].Comment = req.body.comment;
        console.log(document.UploadedDocuments);
        // Save the updated document
        try {
            const updatedDoocument = await uploadDocument.findByIdAndUpdate(
                document._id,
                document,
                { new: true }
            );
            // await document.save().then(() => {
            //     console.log('saved');
            // });
            console.log('Document saved successfully.');
        } catch (error) {
            console.error('Error saving document:', error);
            // Handle the error appropriately, such as sending a response with an error status code.
            return res.status(500).json({ error: 'Internal server error.' });
        }
        res.status(200).send({ status: true, message: 'Document reviewed successfully', data: document });

    } catch (error) {
        res.status(500).send({ status: false, message: 'Failed to update document review', error: error.message });
    }
});

// * Route to update a form by ID
router.put('/send-document', async (req, res) => {
    try {

        const docId = req.body._id;

        const doc = await Document.findById(docId);

        if (!doc) {
            console.log('Document not found');
            return res.status(404).json({ message: 'Document not found' });
        }
        const updates = {
            ...req.body,
        };
        // Update the form fields
        Object.assign(doc, updates);
        await Document.findByIdAndUpdate(
            doc._id,
            doc,
            { new: true }
        );
        // await doc.save();
        console.log(doc);
        console.log('Document Sended successfully');
        res.status(200).json({ status: true, message: 'Form updated successfully', form });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating form', error: error.message });
    }
});

// * Replace updated Document
router.put('/replaceDocument/:documentId', upload.single('file'), async (req, res) => {
    try {

        const requestUser = await user.findById(req.header('Authorization')).populate('Company')
        const updatedBy = requestUser.Name;
        const { documentId } = req.params;

        const response = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' }).catch(err => console.log(err));
        const document = await uploadDocument.findById(documentId);
        if (!document) {
            return res.status(404).send({ status: false, message: 'Document not found' });
        }

        const pdfDoc = await PDFDocument.load(req.file.buffer);
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
        addFirstPage(firstPage, pdfLogoImage, requestUser.Company, requestUser, document.DocumentId, `${document.RevisionNo + 1}`);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        pdfDoc.getPages().slice(1).forEach(async (page) => {
            const { width, height } = page.getSize();
            const extraSpace = 34; // Increase this value for more space at the top

            // Resize the page to add extra space at the top
            page.setSize(width, height + extraSpace);

            // Move the original content down
            page.translateContent(0, -extraSpace);

            // Now add your custom text at the top
            const watermarkText = document.DocumentName;
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

            const docIdText = `Doc ID : ${document.DocumentId}`;
            const docIdTextFontSize = 10;
            const docIdTextWidth = helveticaFont.widthOfTextAtSize(docIdText, docIdTextFontSize);
            const centerDocIdTextX = width - docIdTextWidth - 20;
            const centerDocIdTextY = height + extraSpace - 12; // Place in new space

            page.drawText(docIdText, {
                x: centerDocIdTextX,
                y: centerDocIdTextY,
                size: docIdTextFontSize,
                color: rgb(0, 0, 0)
            });


            const revisionNoText = `Revision No : ${document.RevisionNo + 1}`;
            const revisionNoTextFontSize = 10;
            const revisionNoTextWidth = helveticaFont.widthOfTextAtSize(revisionNoText, revisionNoTextFontSize);
            const centerRevisionNoTextX = width - revisionNoTextWidth - 20;
            const centerRevisionNoTextY = height + extraSpace - 24; // Place in new space

            page.drawText(revisionNoText, {
                x: centerRevisionNoTextX,
                y: centerRevisionNoTextY,
                size: revisionNoTextFontSize,
                color: rgb(0, 0, 0)
            });
        });
        // Save the modified PDF
        const modifiedPdfBuffer = await pdfDoc.save();
        console.log('uploading ');

        const result = await uploadToCloudinary(modifiedPdfBuffer);




        // Check if the document status is "Pending," "Rejected," or "Disapproved"
        if (document.Status !== 'Pending' && document.Status !== 'Rejected' && document.Status !== 'Disapproved') {
            return res.status(400).send({ status: false, message: 'Document status does not allow replacement' });
        }
        // Reset approval-related fields and update revision number
        document.Status = 'Pending';
        document.ApprovalDate = null;
        document.CreatedBy = updatedBy;
        document.CreationDate = new Date()
        document.DisapprovalDate = null;
        document.ReviewDate = null;
        document.RejectionDate = null;
        document.ApprovedBy = null;
        document.DisapprovedBy = null;
        document.ReviewedBy = null;
        document.RejectedBy = null;
        document.UpdationDate = new Date();
        document.UpdatedBy = updatedBy;
        document.RevisionNo += 1;

        // Update the document with the new one
        document.UploadedDocuments.push({
            RevisionNo: document.RevisionNo,
            DocumentUrl: result.secure_url,
            CreatedBy: updatedBy,
            CreationDate: new Date()
        });
        console.log('saving');

        const updatedDoocument = await uploadDocument.findByIdAndUpdate(
            document._id,
            document,
            { new: true }
        ).catch(err => console.log(err));
        // await document.save();
        res.status(200).send({ status: true, message: 'Document replaced successfully', data: document });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, message: 'Failed to replace document', error: error.message });
    }
});

module.exports = router;
module.exports.addFirstPage = addFirstPage;