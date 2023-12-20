const express = require('express');
const uploadDocument = require('../../models/Admin/UploadDocumentsModel')
const router = new express.Router();
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const authMiddleware = require('../../middleware/auth');
const { rgb, degrees, PDFDocument, StandardFonts } = require('pdf-lib');
router.use(authMiddleware);

// * Cloudinary Setup 
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});

const upload = multer();

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

// * Upload a New Document
router.post('/uploadDocument',  upload.single('file'), async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    try {

        const createdBy = req.user.Name;
        const { Department, DocumentType, DocumentName} = req.body;


        const response = await axios.get(req.user.Company.CompanyLogo, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFDocument.load(req.file.buffer);
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
          page.drawText(watermarkText, { x: centerWatermarkX, y: centerWatermarkY, fontSize: 20, color: rgb(0, 0, 0), opacity : 0.35 , rotate: degrees(-45) });
        });
        // Save the modified PDF
        const modifiedPdfBuffer = await pdfDoc.save();


        
        const result = await uploadToCloudinary(modifiedPdfBuffer);
        const newDocument = new uploadDocument({
           
            DocumentName: DocumentName,
            Department: Department,
            DocumentType: DocumentType,
            User : req.user._id,
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
                }],
        });

        await newDocument.save();
        res.status(201).send({ status: true, message: 'Document uploaded successfully', data: newDocument });

    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, message: 'Failed to upload document', error: error.message });
    }
});

// * Get All Documents
router.get('/readAllDocuments',  async (req, res) => {
    console.log('request came');
    try {

        const documents = await uploadDocument.find().populate('Department User');
        console.log(documents);

        const documentsToSend = documents.filter(Obj => Obj.User.Department.equals(req.user.Department));

        res.status(200).send({ status: true, message: "The following are Documents!", data: documentsToSend });
        console.log('READ Documents Successfully!')

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// * Get Document By Id
router.get('/readDocumentById/:documentId',  async (req, res) => {
    console.log('request came');
    try {

        const documentId = req.params.documentId;
        const document = await uploadDocument.findById(documentId).populate('Department User');
        res.status(200).send({ status: true, message: "The following are Documents!", data: document });
        console.log('READ Documents Successfully!')

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// * Review Uploaded Document
router.patch('/review-uploaded-document',  async (req, res) => {
    try {

        const reviewBy = req.user.Name;
        const { documentId } = req.body;

        // Find the document by ID
        const document = await uploadDocument.findById(documentId);

        // If document not found
        if (!document) {
            console.error(`Document with ID: ${document} not found.`);
            return res.status(404).json({ error: 'Document not found.' });
        }

        if (document.Status === 'Reviewed') {
            console.warn(`Document with ID: ${documentId} is already marked as 'Reviewed'.`);
            return res.status(400).json({ error: 'Document is already reviewed.' });
        }

        document.ReviewDate = new Date(),
            document.Status = 'Reviewed';
        document.RejectionDate = null;
        document.RevisionNo += 1;
        document.ReviewedBy = reviewBy

        document.UploadedDocuments[document.UploadedDocuments.length - 1].ReviewDate = new Date();
        document.UploadedDocuments[document.UploadedDocuments.length - 1].ReviewedBy = 'Pending';

        // Save the updated document
        await document.save();
        res.status(200).send({ status: true, message: 'Document reviewed successfully', data: document });

    } catch (error) {
        res.status(500).send({ status: false, message: 'Failed to update document review', error: error.message });
    }
});

// * Add comment to Uploaded Document
router.patch('/comment-document/:documentId',  async (req, res) => {
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
            await document.save().then(() => {
                console.log('saved');
            });
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

// * Reject Uploaded Document
router.patch('/reject-uploaded-document',  async (req, res) => {
    try {

        const rejectBy = req.user.Name;
        const { documentId, reason } = req.body;

        // Find the document by ID
        const document = await uploadDocument.findById(documentId);

        // If document not found
        if (!document) {
            console.error(`Document with ID: ${document} not found.`);
            return res.status(404).json({ error: 'Document not found.' });
        }

        if (document.Status === 'Reviewed' || document.Status === 'Rejected') {
            console.warn(`Document with ID: ${documentId} is already marked as 'Reviewed'. or Aleady marked as 'Rejected'`);
            return res.status(400).json({ error: 'Document is already reviewed or rejected .' });
        }

        document.Reason = reason
        document.RejectionDate = new Date(),
            document.ReviewDate = null;
        document.Status = 'Rejected';
        document.RejectedBy = rejectBy
        document.UploadedDocuments[document.UploadedDocuments.length - 1].ReviewDate = null;

        // Save the updated document
        await document.save();
        res.status(200).send({ status: true, message: 'Document rejected successfully', data: document });

    } catch (error) {
        res.status(500).send({ status: false, message: 'Failed to update document reject', error: error.message });
    }
});

// * Approve Uploaded Document
router.patch('/approve-uploaded-document',  async (req, res) => {
    try {

        const approveBy = req.user.Name;
        const { documentId } = req.body;

        // Find the document by ID
        const document = await uploadDocument.findById(documentId);

        // If document not found
        if (!document) {
            console.error(`Document with ID: ${document} not found.`);
            return res.status(404).json({ error: 'Document not found.' });
        }

        if (document.Status === 'Approved') {
            console.warn(`Document with ID: ${documentId} is already marked as 'Approved'.`);
            return res.status(400).json({ error: 'Document is already approved.' });
        }

        if (document.Status == 'Rejected') {
            return res.status(404).json({ error: 'You cannot approve this document' })
        }

        document.ApprovalDate = new Date(),
            document.Status = 'Approved';
        document.DisapprovalDate = null;
        document.UploadedDocuments[document.UploadedDocuments.length - 1].ApprovalDate = new Date();
        document.UploadedDocuments[document.UploadedDocuments.length - 1].ApprovedBy = approveBy;

        // Save the updated document
        await document.save();
        res.status(200).send({ status: true, message: 'Document approved successfully', data: document });

    } catch (error) {
        res.status(500).send({ status: false, message: 'Failed to update document approve', error: error.message });
    }
});

// * Diapprove Uploaded Document
router.patch('/disapprove-uploaded-document',  async (req, res) => {
    try {

        const disapproveBy = req.user.Name;
        const { documentId, reason } = req.body;

        // Find the document by ID
        const document = await uploadDocument.findById(documentId);

        // If document not found
        if (!document) {
            console.error(`Document with ID: ${document} not found.`);
            return res.status(404).json({ error: 'Document not found.' });
        }

        if (document.Status == 'Rejected') {
            return res.status(404).json({ error: 'You cannot disapprove this document' })
        }

        if (document.Status === 'Disapproved' || document.Status === 'Approved') {
            console.warn(`Document with ID: ${documentId} is already marked as 'Disapproved'. or Aleady marked as 'Approved'`);
            return res.status(400).json({ error: 'Document is already Disapproved or Approved .' });
        }

        document.DisapprovalDate = new Date();
        document.Status = 'Disapproved';
        document.Reason = reason;
        document.ApprovalDate = null;
        document.DisapprovedBy = disapproveBy;
        document.UploadedDocuments[document.UploadedDocuments.length - 1].ApprovalDate = null;

        // Save the updated document
        await document.save();
        res.status(200).send({ status: true, message: 'Document disapproved successfully', data: document });

    } catch (error) {
        res.status(500).send({ status: false, message: 'Failed to update document disapprove', error: error.message });
    }
});

// * Replace updated Document
router.put('/replaceDocument/:documentId',  upload.single('file'), async (req, res) => {
    try {
        
        const updatedBy = req.user.Name;
        const { documentId } = req.params;

        const response = await axios.get(req.user.Company.CompanyLogo, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFDocument.load(req.file.buffer);
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
          page.drawText(watermarkText, { x: centerWatermarkX, y: centerWatermarkY, fontSize: 20, color: rgb(0, 0, 0), opacity : 0.35 , rotate: degrees(-45) });
        });
        // Save the modified PDF
        const modifiedPdfBuffer = await pdfDoc.save();

        const result = await uploadToCloudinary(modifiedPdfBuffer);
        const document = await uploadDocument.findById(documentId);
        if (!document) {
            return res.status(404).send({ status: false, message: 'Document not found' });
        }

        // Check if the document status is "Pending," "Rejected," or "Disapproved"
        if (document.Status !== 'Pending' && document.Status !== 'Rejected' && document.Status !== 'Disapproved') {
            return res.status(400).send({ status: false, message: 'Document status does not allow replacement' });
        }

        // Reset approval-related fields and update revision number
        document.Status = 'Pending';
        document.ApprovalDate = null;
        document.ReviewDate = null;
        document.ApprovedBy = null;
        document.ReviewedBy = null;
        document.UpdationDate = new Date();
        document.UpdatedBy = updatedBy;
        document.RevisionNo += 1;

        // Update the document with the new one
        document.UploadedDocuments.push({
            RevisionNo: document.RevisionNo,
            DocumentUrl: result.secure_url,
        });

        await document.save();

        res.status(200).send({ status: true, message: 'Document replaced successfully', data: document });
    } catch (error) {
        res.status(500).send({ status: false, message: 'Failed to replace document', error: error.message });
    }
});

module.exports = router;