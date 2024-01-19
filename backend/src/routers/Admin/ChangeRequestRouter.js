const express = require('express');
const ChangeRequest = require('../../models/Admin/ChangeRequestModel')
const Document = require('../../models/Admin/ListOfDocumentsModel');
const UploadDocuments = require('../../models/Admin/UploadDocumentsModel')
const router = new express.Router();
// const authMiddleware = require('../../middleware/auth')
// router.use(authMiddleware);

// * POST  ChangeRequest Data From MongooDB Database
router.post('/addChangeRequest', async (req, res) => {
  try {
    const departmentId = req.header('Authorization');
    // The changeRequest data sent in the request body
    const changeRequest = new ChangeRequest({
      ...req.body,
      CreatedBy: createdBy,
      UserDepartment : departmentId,
    });

  

    await changeRequest.save();
    console.log(new Date().toLocaleString() + ' ' + 'Loading ChangeRequest...');

    res.status(201).send({ status: true, message: "The ChangeRequest is added!", data: changeRequest });
    console.log(new Date().toLocaleString() + ' ' + 'ADD ChangeRequest Successfully!');

  } catch (e) {
    console.log(e);
    res.status(400).json({ message: e.message });
  }
});

// * GET All ChangeRequest Data From MongooDB Database
router.get('/readChangeRequest', async (req, res) => {
  console.log('change request');
  try {
    const departmentId = req.header('Authorization');
    const changeRequest = await ChangeRequest.find({UserDepartment : departmentId}).populate("Document Department UserDepartment");

    res.status(201).send({ status: true, message: "The following are ChangeRequests!", data: changeRequest });
    console.log(new Date().toLocaleString() + ' ' + 'READ ChangeRequest Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }

});

// * GET ChangeRequest Data By ID From MongooDB Database
router.get('/readChangeRequestById/:requestId', async (req, res) => {

  try {

    const changeRequest = await ChangeRequest.findById(req.params.requestId).populate("Document Department UserDepartment");

    res.status(201).send({ status: true, message: "The following are ChangeRequests!", data: changeRequest });
    console.log(new Date().toLocaleString() + ' ' + 'READ ChangeRequest Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }

});

// * Review ChangeRequest
router.patch('/review-ChangeRequest', async (req, res) => {
  try {

    const reviewBy = req.body.reviewBy;
    const { documentId } = req.body;

    // Find the document by ID
    const document = await ChangeRequest.findById(documentId);

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
    document.ReviewedBy = reviewBy

    // Save the updated document
    await document.save();

    res.status(200).send({ status: true, message: 'Document reviewed successfully', data: document });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update document review', error: error.message });
  }
});

// * Reject ChangeRequest
router.patch('/reject-ChangeRequest', async (req, res) => {
  try {

    const rejectBy = req.body.rejectBy;
    const { documentId, reason } = req.body;

    // Find the document by ID
    const document = await ChangeRequest.findById(documentId);

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
    document.RejectedBy = rejectBy

    // Save the updated document
    await document.save();

    res.status(200).send({ status: true, message: 'Document rejected successfully', data: document });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update document reject', error: error.message });
  }
});

// * Approve ChangeRequest
router.patch('/approve-ChangeRequest', async (req, res) => {
  try {

    const approveBy = req.body.approveBy;
    const { documentId } = req.body;

    // Find the document by ID
    const document = await ChangeRequest.findById(documentId);

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
    var realDoc;
    if (document.documentModel === 'Document') {
      realDoc = await Document.findById(document.Document);
    } else {
      realDoc = await UploadDocuments.findById(document.Document)
    }

    realDoc.Status = 'Pending';
    realDoc.ApprovalDate = null;
    realDoc.DisapprovalDate = null;
    realDoc.ReviewDate = null;
    realDoc.ReviewedBy = null;
    realDoc.RejectedBy = null;
    realDoc.ApprovedBy = null;
    realDoc.DisapprovedBy = null;
    if (document.documentModel === 'Document') {
      await Document.findByIdAndUpdate(realDoc._id, realDoc);
    } else {
      await UploadDocuments.findByIdAndUpdate(realDoc._id, realDoc)
    }


    document.ApprovalDate = new Date(),
      document.Status = 'Approved';
    document.DisapprovalDate = null
    document.ApprovedBy = approveBy

    // Save the updated document
    await document.save();

    res.status(200).send({ status: true, message: 'Document approved successfully', data: document });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: 'Failed to update document approve', error: error.message });
  }
});

// * Diapprove ChangeRequest
router.patch('/disapprove-ChangeRequest', async (req, res) => {
  try {

    const { documentId, reason, disapproveBy } = req.body;

    // Find the document by ID
    const document = await ChangeRequest.findById(documentId);

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
    document.DisapprovedBy = disapproveBy

    // Save the updated document
    await document.save();

    res.status(200).send({ status: true, message: 'Document disapproved successfully', data: document });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update document disapprove', error: error.message });
  }
});

module.exports = router