const express = require('express');
const Document = require('../../models/Admin/ListOfDocumentsModel');
const user = require('../../models/AccountCreation/UserModel');
const router = new express.Router();

// const authMiddleware = require('../../middleware/auth');
// router.use(authMiddleware)

// * Post a New document
router.post('/create-document', async (req, res) => {
  try {

    //  The document data sent in the request body
    const createdBy = req.body.createdBy;

    // The changeRequest data sent in the request body
    const createdDocument = new Document({
      ...req.body,
      CreatedBy: createdBy,
      UserDepartment: req.header('Authorization'),

    });

    // * Save the document to the database
    const savedDocument = await createdDocument.save();

    console.log(new Date().toLocaleString() + ' ' + 'Creating Document...');
    res.status(201).json({ status: true, message: 'Document created successfully', document: savedDocument });
    console.log(new Date().toLocaleString() + ' ' + 'Document Created Successfully!');

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating document', error: error.message });
  }
});

// * Get  all documents
router.get('/get-documents', async (req, res) => {
  try {
    const departmentId = req.header('Authorization')
    //  The documents data find in the database
    const documents = await Document.find({ UserDepartment: departmentId }).populate('Department UserDepartment');

    console.log(new Date().toLocaleString() + ' ' + 'Fetching Documents...');
    res.status(200).json({ status: true, message: 'Documents fetched successfully', data: documents });
    console.log(new Date().toLocaleString() + ' ' + 'Fetched Documents Successfully!');

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// * Get document by id
router.get('/get-documentById/:documentId', async (req, res) => {
  try {

    // * The documents data find in the database
    const documents = await Document.findById(req.params.documentId).populate('Department UserDepartment');
    const totalCollections = await Document.countDocuments()

    console.log(new Date().toLocaleString() + ' ' + 'Fetching Documents...');
    res.status(200).json({ status: true, message: 'Documents fetched successfully', totaldocuments: totalCollections, data: documents });
    console.log(new Date().toLocaleString() + ' ' + 'Fetched Documents Successfully!');

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// * Update the document
router.put('/updateDocument', async (req, res) => {
  try {

    const updatedBy = req.body.updatedBy;

    // The document data find by Id in the database
    const id = req.body._id;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ status: false, message: 'Document not found' });
    }


    // Exclude fields that shouldn't be updated
    const fieldsToExclude = ['DocumentId', 'CreationDate', 'ReviewedBy', 'CreatedBy', 'ApprovedBy', 'ApprovalDate', 'Reason', 'Status'];
    fieldsToExclude.forEach(field => {
      delete req.body[field];
    });

    // Increment the RevisionNo by one
    req.body.RevisionNo += 1;

    // Set the update time to the current time
    req.body.UpdationDate = new Date();
    req.body.UpdatedBy = updatedBy;
    req.body.Status = 'Pending';
    req.body.ApprovalDate = null;
    req.body.ApprovedBy = null;
    req.body.DisapprovalDate = null;
    req.body.DisapprovedBy = null;
    req.body.ReviewDate = null;
    req.body.ReviewedBy = null;
    req.body.RejectedBy = null;
    req.body.RejectionDate = null;
    req.body.Reason = null

    // Update the Document fields
    Object.assign(document, req.body);
    await Document.findByIdAndUpdate(
      document._id,
      document,
      { new: true }
    );
    // await document.save();

    res.json({ status: true, message: 'The Document is updated!', data: document });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Error updating Document' });
  }
});

// * Review Document
router.patch('/review-document', async (req, res) => {
  try {
    const { documentId, reviewedBy } = req.body;

    // Find the document by ID
    const document = await Document.findById(documentId);

    // If document not found
    if (!document) {
      console.error(`Document with ID: ${documentId} not found.`);
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Ensure the document status is pending
    if (document.Status !== 'Pending') {
      console.warn(`Document with ID: ${documentId} cannot be reviewed as it is not in 'Pending' status.`);
      return res.status(400).json({ error: 'Document status is not eligible for review.' });
    }

    // Ensure the document status is not already Reviewed or Rejected
    if (document.Status === 'Reviewed' || document.Status === 'Rejected' || document.Status === 'Approved' || document.Status === 'Disapproved') {
      console.warn(`Document with ID: ${documentId} cannot be reviewed as it is already in 'Reviewed' or 'Rejected' or 'Approved' or 'Disapproved' status.`);
      return res.status(400).json({ error: 'Document status is not eligible for review.' });
    }

    // Update document status to reviewed
    document.Status = 'Reviewed';
    document.ReviewedBy = reviewedBy;
    document.RejectedBy = "";
    document.RejectionDate = null;
    document.ReviewDate = new Date();
    await Document.findByIdAndUpdate(
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

// * Reject Document
router.patch('/reject-document', async (req, res) => {
  try {
    const { documentId, reason, rejectedBy } = req.body;

    // Find the document by ID
    const document = await Document.findById(documentId);

    // If document not found
    if (!document) {
      console.error(`Document with ID: ${documentId} not found.`);
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Ensure the document status is pending
    if (document.Status !== 'Pending') {
      console.warn(`Document with ID: ${documentId} cannot be rejected as it is not in 'Pending' status.`);
      return res.status(400).json({ error: 'Document status is not eligible for rejection.' });
    }

    // Ensure the document status is not already Reviewed or Rejected
    if (document.Status === 'Reviewed' || document.Status === 'Rejected' || document.Status === 'Approved' || document.Status === 'Disapproved') {
      console.warn(`Document with ID: ${documentId} cannot be rejected as it is already in 'Reviewed' or 'Rejected' or 'Approved' or 'Disapproved' status.`);
      return res.status(400).json({ error: 'Document status is not eligible for rejected.' });
    }
    // Update document status to rejected
    document.Status = 'Rejected';
    document.RejectedBy = rejectedBy;
    document.ReviewedBy = "";
    document.ReviewDate = null;
    document.RejectionDate = new Date();
    document.Reason = reason;
    await Document.findByIdAndUpdate(
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

// * Approve Document
router.patch('/approve-document', async (req, res) => {
  try {
    const { documentId, approvedBy } = req.body;

    // Find the document by ID
    const document = await Document.findById(documentId);

    // If document not found
    if (!document) {
      console.error(`Document with ID: ${documentId} not found.`);
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Ensure the document status is not already Approved or Disapproved
    if (document.Status === 'Approved' || document.Status === 'Disapproved' || document.Status === 'Rejected' || document.Status === 'Pending') {
      console.warn(`Document with ID: ${documentId} cannot be approved as it is already in 'Approved' or 'Disapproved' or 'Rejected' or 'Pending' status.`);
      return res.status(400).json({ error: 'Document status is not eligible for approval.' });
    }

    // Update document status to approved
    document.Status = 'Approved';
    document.ApprovedBy = approvedBy;
    document.DisapprovedBy = null;
    document.DisapprovalDate = null;
    document.ApprovalDate = new Date();
    await Document.findByIdAndUpdate(
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

// * Disapprove Document
router.patch('/disapprove-document', async (req, res) => {
  try {
    const { documentId, reason, disapprovedBy } = req.body;

    // Find the document by ID
    const document = await Document.findById(documentId);

    // If document not found
    if (!document) {
      console.error(`Document with ID: ${documentId} not found.`);
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Ensure the document status is not already Approved or Disapproved
    if (document.Status === 'Approved' || document.Status === 'Disapproved' || document.Status === 'Rejected' || document.Status === 'Pending') {
      console.warn(`Document with ID: ${documentId} cannot be disapproved as it is already in 'Approved' or 'Disapproved' or 'Rejected' or 'Pending' status.`);
      return res.status(400).json({ error: 'Document status is not eligible for disapproval.' });
    }

    // Update document status to disapproved
    document.Status = 'Disapproved';
    document.DisapprovedBy = disapprovedBy;
    document.ApprovedBy = "";
    document.ApprovalDate = null;
    document.DisapprovalDate = new Date();
    document.Reason = reason;
    await Document.findByIdAndUpdate(
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

module.exports = router