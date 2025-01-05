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
      CreatedBy: req.body.createdBy,
      UserDepartment: departmentId,
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
    const changeRequest = await ChangeRequest.find({ UserDepartment: departmentId }).populate("Document Department UserDepartment");

    res.status(201).send({ status: true, message: "The following are ChangeRequests!", data: changeRequest });
    console.log(new Date().toLocaleString() + ' ' + 'READ ChangeRequest Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }

});

router.get('/readAllChangeRequest', async (req, res) => {
  console.log('change request');
  try {
    const companyId = req.header('Authorization');
    const changeRequest = await ChangeRequest.find().populate("Document Department UserDepartment");
    
    const changeRequestsToSend = changeRequest.filter(request => request.UserDepartment.Company.equals(companyId))
    res.status(201).send({ status: true, message: "The following are ChangeRequests!", data: changeRequestsToSend });
    console.log(new Date().toLocaleString() + ' ' + 'READ ChangeRequest Successfully!')

  } catch (e) {
    console.log(e);
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

    const reviewedBy = req.body.reviewBy;
    const { documentId } = req.body;

    // Find the document by ID
    const document = await ChangeRequest.findById(documentId);

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
    document.RejectedBy = null;
    document.RejectionDate = null;
    document.ReviewDate = new Date();
    const updatedDoocument = await ChangeRequest.findByIdAndUpdate(
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

// * Reject ChangeRequest
router.patch('/reject-ChangeRequest', async (req, res) => {
  try {

    const rejectedBy = req.body.rejectBy;
    const { documentId, reason } = req.body;

    // Find the document by ID
    const document = await ChangeRequest.findById(documentId);

    // If document not found
    if (!document) {
      console.error(`Document with ID: ${documentId} not found.`);
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Ensure the document status is pending
    if (document.Status !== 'Pending' && document.Status !== 'Reviewed') {
      console.warn(`Document with ID: ${documentId} cannot be rejected as it is not in 'Pending' status.`);
      return res.status(400).json({ error: 'Document status is not eligible for rejection.' });
    }

    // Ensure the document status is not already Reviewed or Rejected
    if ( document.Status === 'Rejected' || document.Status === 'Approved' || document.Status === 'Disapproved') {
      console.warn(`Document with ID: ${documentId} cannot be rejected as it is already in 'Reviewed' or 'Rejected' or 'Approved' or 'Disapproved' status.`);
      return res.status(400).json({ error: 'Document status is not eligible for rejected.' });
    }
    // Update document status to rejected
    document.Status = 'Rejected';
    document.RejectedBy = rejectedBy;
    document.ReviewedBy = null;
    document.ReviewDate = null;
    document.RejectionDate = new Date();
    document.Reason = reason;
    const updatedDoocument = await ChangeRequest.findByIdAndUpdate(
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

// * Approve ChangeRequest
router.patch('/approve-ChangeRequest', async (req, res) => {
  try {

    const approvedBy = req.body.approveBy;
    const { documentId } = req.body;

    // Find the document by ID
    const document = await ChangeRequest.findById(documentId);

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

    // Update document status to approved
    document.Status = 'Approved';
    document.ApprovedBy = approvedBy;
    document.DisapprovedBy = null;
    document.DisapprovalDate = null;
    document.ApprovalDate = new Date();
    const updatedDoocument = await ChangeRequest.findByIdAndUpdate(
      document._id,
      document,
      { new: true }
  );
    // Save the updated document
    // await document.save();

    res.status(200).send({ status: true, message: 'Document approved successfully', data: document });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: 'Failed to update document approve', error: error.message });
  }
});

// * Diapprove ChangeRequest
router.patch('/disapprove-ChangeRequest', async (req, res) => {
  try {

    const { documentId, reason, disapprovedBy } = req.body;

    // Find the document by ID
    const document = await ChangeRequest.findById(documentId);

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
    document.ApprovedBy = null;
    document.ApprovalDate = null;
    document.DisapprovalDate = new Date();
    document.Reason = reason;
    const updatedDoocument = await ChangeRequest.findByIdAndUpdate(
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