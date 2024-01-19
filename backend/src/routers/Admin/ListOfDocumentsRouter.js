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
      UserDepartment : req.header('Authorization'),

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
    const documents = await Document.find({UserDepartment : departmentId}).populate('Department UserDepartment');

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
router.put('/updateDocument',  async (req, res) => {
  try {

    const updatedBy = req.body.updatedBy;

    // The document data find by Id in the database
    const id = req.body._id;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ status: false, message: 'Document not found' });
    }

    // Check if the user can edit the document based on its status
    if (document.Status !== 'Pending' || document.Status !== 'Rejected' || document.Status !== 'Disapproved') {
      return res.status(403).json({ status: false, message: 'Document cannot be edited because of its current status' });
    }

    // Exclude fields that shouldn't be updated
    const fieldsToExclude = ['DocumentId', 'CreationDate', 'ReviewedBy', 'CreatedBy', 'ApprovedBy', 'ApprovalDate', 'Reason', 'Status'];
    fieldsToExclude.forEach(field => {
      delete req.body[field];
    });

    // Increment the RevisionNo by one
    document.RevisionNo += 1;

    // Set the update time to the current time
    document.UpdationDate = new Date();

    document.UpdatedBy = updatedBy

    // Update the Document fields
    Object.assign(document, req.body);

    await document.save();

    console.log(new Date().toLocaleString() + ' ' + 'Updating Document...');
    res.json({ status: true, message: 'The Document is updated!', data: document });
    console.log(new Date().toLocaleString() + ' ' + 'Update Document Successfully!');

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Error updating Document' });
  }
});

// * Review Document
router.patch('/review-document',  async (req, res) => {
  try {


    const { documentId, reviewedBy } = req.body;

    // Find the document by ID
    const document = await Document.findById(documentId);

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
    document.ReviewedBy = reviewedBy

    // Save the updated document
    await document.save();
    res.status(200).send({ status: true, message: 'Document reviewed successfully', data: document });

  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update document review', error: error.message });
  }
});

// * Reject Document
router.patch('/reject-document',  async (req, res) => {
  try {

    const { documentId, reason, rejectedBy } = req.body;

    // Find the document by ID
    const document = await Document.findById(documentId);

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
      document.ReviewDate = null
    document.Status = 'Rejected';
    document.RejectedBy = rejectedBy

    // Save the updated document
    await document.save();
    res.status(200).send({ status: true, message: 'Document rejected successfully', data: document });

  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update document reject', error: error.message });
  }
});

// * Approve Document
router.patch('/approve-document', async (req, res) => {
  try {

    const approvedBy = req.body.approvedBy;
    const documentId = req.body.id;

    // Find the document by ID
    const document = await Document.findById(documentId);

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
    document.DisapprovalDate = null
    document.ApprovedBy = approvedBy

    // Save the updated document
    await document.save();

    res.status(200).send({ status: true, message: 'Document approved successfully', data: document });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update document approve', error: error.message });
  }
});

// * Diapprove Document
router.patch('/disapprove-document',  async (req, res) => {
  try {

    const { documentId, reason, disapprovedBy } = req.body;

    // Find the document by ID
    const document = await Document.findById(documentId);

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
    document.DisapprovedBy = disapprovedBy

    // Save the updated document
    await document.save();

    res.status(200).send({ status: true, message: 'Document disapproved successfully', data: document });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update document disapprove', error: error.message });
  }
});

module.exports = router