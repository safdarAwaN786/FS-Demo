const express = require('express');
const router = express.Router();
const Form = require('../../models/Admin/ListOfFormsModel').ListOfForms;
const { QuestionModel } = require('../../models/Admin/ListOfFormsModel');
const authMiddleware = require('../../middleware/auth');
// router.use(authMiddleware);

// * Route to create a new form
router.post('/create-form', async (req, res) => {
  try {

    const createdBy = req.body.createdBy;

    const createdQuestions = await QuestionModel.create(req.body.questions);
    const questionsArr = Object.values(createdQuestions);
    const questionsIds = questionsArr.map(questionObj => questionObj._id);
    console.log(questionsIds);

    // The Form data sent in the request body
    const createdForm = new Form({
      ...req.body,
      CreatedBy: createdBy,
      UserDepartment: req.header('Authorization'),
      questions: questionsIds,
    });

    await createdForm.save();
    console.log(new Date().toLocaleString() + ' ' + 'Creating Form...');

    res.status(201).json({ status: true, message: "Form created successfully", form: createdForm });
    console.log(new Date().toLocaleString() + ' ' + 'CREATE Form Successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating form', error: error.message });
  }
});

// * Route to get a form by ID
router.get('/get-form-by-id/:formId', async (req, res) => {
  try {

    const formId = req.params.formId;
    const form = await Form.findById(formId).populate('Department UserDepartment').populate({
      path: 'questions',
      model: 'Question'
    })

    if (!form) {
      console.log('Form not found');
      return res.status(404).json({ message: 'Form not found' });
    }

    console.log('Form retrieved successfully');
    res.status(200).json({ status: true, form });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting form', error: error.message });
  }
});

// * Route to get all forms
router.get('/get-all-forms', async (req, res) => {
  try {
    const departmentId = req.header('Authrization')
    const forms = await Form.find({ UserDepartment: departmentId }).populate('Department UserDepartment').populate({
      path: 'questions',
      model: 'Question'
    })

    if (!forms) {
      console.log('Form not found');
      return res.status(404).json({ message: 'Form not found' });
    }
    console.log('Form retrieved successfully');
    res.status(200).json({ status: true, forms: forms });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting form', error: error.message });
  }
});
// * Route to get all forms
router.get('/get-forms-to-fill', async (req, res) => {
  try {
    const departmentId = req.header('Authorization')
    const forms = await Form.find({ Status: 'Approved' }).populate('Department UserDepartment').populate({
      path: 'questions',
      model: 'Question'
    })

    if (!forms) {
      console.log('Form not found');
      return res.status(404).json({ message: 'Form not found' });
    }

    const formsToSend = forms.filter(Obj =>
      Obj.SendToDepartments.includes(departmentId)
    )
    console.log('Form retrieved successfully');
    res.status(200).json({ status: true, forms: formsToSend });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting form', error: error.message });
  }
});

// * Route to update a form by ID
router.put('/update-form', async (req, res) => {
  try {

    const updatedBy = req.body.updatedBy;
    const formId = req.body._id;

    const form = await Form.findById(formId);

    if (!form) {
      console.log('Form not found');
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if the user can update the form based on its status
    if (form.Status !== 'Pending' && form.Status !== 'Rejected' && form.Status !== 'Disapproved') {
      return res.status(403).json({ status: false, message: 'Form cannot be updated because of its current status' });
    }
    const createdQuestions = await QuestionModel.create(req.body.questions.map(question => {
      const { _id, ...updatedQuestion } = question;
      return updatedQuestion;
    }));
    const questionsArr = Object.values(createdQuestions);
    const questionsIds = questionsArr.map(questionObj => questionObj._id);
    console.log(questionsIds);

    const updates = {
      ...req.body,
      questions: questionsIds
    };
    // Increment the RevisionNo by one
    form.RevisionNo += 1;

    // Set the update time to the current time
    form.UpdationDate = new Date();

    form.UpdatedBy = updatedBy

    // Update the form fields
    Object.assign(form, updates);
    await form.save();

    console.log('Form updated successfully');
    res.status(200).json({ status: true, message: 'Form updated successfully', form });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating form', error: error.message });
  }
});
// * Route to update a form by ID
router.put('/send-form', async (req, res) => {
  try {

    const formId = req.body._id;

    const form = await Form.findById(formId);

    if (!form) {
      console.log('Form not found');
      return res.status(404).json({ message: 'Form not found' });
    }
    const updates = {
      ...req.body,
    };
    // Update the form fields
    Object.assign(form, updates);
    await form.save();
    console.log(form);
    console.log('Form Sended successfully');
    res.status(200).json({ status: true, message: 'Form updated successfully', form });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating form', error: error.message });
  }
});

// * Review Form
router.patch('/reviewForm', async (req, res) => {
  try {

    const reviewedBy = req.body.reviewedBy;
    const formId = req.body.formId;

    // Find the document by ID
    const document = await Form.findById(formId);

    // If document not found
    if (!document) {
      console.error(`Document with ID: ${document} not found.`);
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (document.Status === 'Reviewed') {
      console.warn(`Document with ID: ${formId} is already marked as 'Reviewed'.`);
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

// * Reject Form
router.patch('/rejectForm', async (req, res) => {
  try {

    const rejectBy = req.body.rejectedBy;
    const { formId, reason } = req.body;

    // Find the document by ID
    const document = await Form.findById(formId);

    // If document not found
    if (!document) {
      console.error(`Document with ID: ${document} not found.`);
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (document.Status === 'Reviewed' || document.Status === 'Rejected') {
      console.warn(`Document with ID: ${formId} is already marked as 'Reviewed'. or Aleady marked as 'Rejected'`);
      return res.status(400).json({ error: 'Document is already reviewed or rejected .' });
    }

    document.Reason = reason
    document.RejectionDate = new Date(),
      document.ReviewDate = null,
      document.Status = 'Rejected';
    document.RejectedBy = rejectBy

    // Save the updated document
    await document.save();
    res.status(200).send({ status: true, message: 'Document rejected successfully', data: document });

  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update document reject', error: error.message });
  }
});

// * Approve Form
router.patch('/approveForm', async (req, res) => {
  try {

    const approveBy = req.body.approveBy;
    const documentId = req.body.id;

    // Find the document by ID
    const document = await Form.findById(documentId);

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
    console.log(error);
    res.status(500).send({ status: false, message: 'Failed to update document approve', error: error.message });
  }
});

// * Diapprove Form
router.patch('/disapproveForm', async (req, res) => {
  try {

    const disapproveBy = req.body.disapproveBy;
    const { formId, reason } = req.body;

    // Find the document by ID
    const document = await Form.findById(formId);

    // If document not found
    if (!document) {
      console.error(`Document with ID: ${document} not found.`);
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (document.Status == 'Rejected') {
      return res.status(404).json({ error: 'You cannot disapprove this document' })
    }

    if (document.Status === 'Disapproved' || document.Status === 'Approved') {
      console.warn(`Document with ID: ${formId} is already marked as 'Disapproved'. or Aleady marked as 'Approved'`);
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

module.exports = router;