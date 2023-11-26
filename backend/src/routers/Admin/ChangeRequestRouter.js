const express = require('express');
const ChangeRequest = require('../../models/Admin/ChangeRequestModel')
const Document = require('../../models/Admin/ListOfDocumentsModel')
const router = new express.Router();
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);


// * POST  ChangeRequest Data From MongooDB Database
router.post('/addChangeRequest', async (req, res) => {

  console.log(req.body);

  try {

    const createdBy = req.user.Name;

    // The changeRequest data sent in the request body
    const changeRequest = new ChangeRequest({
      ...req.body,
      CreatedBy: createdBy,
      User : req.user._id
    });

    // Check if the referenced Document(s) have a status of "Rejected"
    const documentIds = req.body.Document || [];
    const documents = await Document.find({ _id: { $in: documentIds } });

    for (const document of documents) {
      if (document.Status === 'Rejected') {
        return res.status(400).json({ message: "This document is rejected So, it is not available." });
      }
    }

    await changeRequest.save();
    console.log(new Date().toLocaleString() + ' ' + 'Loading ChangeRequest...');

    res.status(201).send({ status: true, message: "The ChangeRequest is added!", data: changeRequest });
    console.log(new Date().toLocaleString() + ' ' + 'ADD ChangeRequest Successfully!');

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// * GET All ChangeRequest Data From MongooDB Database
router.get('/readChangeRequest',  async (req, res) => {

  try {

    const changeRequest = await ChangeRequest.find().populate("Document Department User");
    const changeRequestsToSend = changeRequest.filter(Obj => Obj.User.Department.equals(req.user.Department))

    res.status(201).send({ status: true, message: "The following are ChangeRequests!", data: changeRequestsToSend });
    console.log(new Date().toLocaleString() + ' ' + 'READ ChangeRequest Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }

});

// * GET ChangeRequest Data By ID From MongooDB Database
router.get('/readChangeRequestById/:requestId',  async (req, res) => {

  try {

    const changeRequest = await ChangeRequest.findById(req.params.requestId).populate("Document Department User");
    console.log(new Date().toLocaleString() + ' ' + 'Loading ChangeRequest...')

    const totalCollections = await ChangeRequest.countDocuments()

    res.status(201).send({ status: true, message: "The following are ChangeRequests!", totaldocuments: totalCollections, data: changeRequest });
    console.log(new Date().toLocaleString() + ' ' + 'READ ChangeRequest Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }

});

// * Review ChangeRequest
router.patch('/review-ChangeRequest',  async (req, res) => {
  try {

    const reviewBy = req.user.Name;
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
router.patch('/reject-ChangeRequest',  async (req, res) => {
  try {

    const rejectBy = req.user.Name;
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
router.patch('/approve-ChangeRequest',  async (req, res) => {
  try {

    const approveBy = req.user.Name;
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

    document.ApprovalDate = new Date(),
      document.Status = 'Approved';
    document.DisapprovalDate = null
    document.ApprovedBy = approveBy

    // Save the updated document
    await document.save();

    res.status(200).send({ status: true, message: 'Document approved successfully', data: document });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update document approve', error: error.message });
  }
});

// * Diapprove ChangeRequest
router.patch('/disapprove-ChangeRequest',  async (req, res) => {
  try {

    const disapproveBy = req.user.Name;
    const { documentId, reason } = req.body;

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