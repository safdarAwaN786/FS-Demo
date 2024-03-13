const express = require('express');
const router = express.Router();
const Form = require('../../models/Admin/ListOfFormsModel').ListOfForms;
const { QuestionModel } = require('../../models/Admin/ListOfFormsModel');
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
    const departmentId = req.header('Authorization')
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
    const { formId, reviewedBy } = req.body;

    // Find the form by ID
    const form = await Form.findById(formId);

    // If form not found
    if (!form) {
      console.error(`Form with ID: ${formId} not found.`);
      return res.status(404).json({ error: 'Form not found.' });
    }

    // Ensure the Form status is pending
    if (form.Status !== 'Pending') {
      console.warn(`Form with ID: ${formId} cannot be reviewed as it is not in 'Pending' status.`);
      return res.status(400).json({ error: 'Form status is not eligible for review.' });
    }

    // Ensure the Form status is not already Reviewed or Rejected
    if (form.Status === 'Reviewed' || form.Status === 'Rejected' || form.Status === 'Approved' || form.Status === 'Disapproved') {
      console.warn(`Form with ID: ${formId} cannot be reviewed as it is already in 'Reviewed' or 'Rejected' or 'Approved' or 'Disapproved' status.`);
      return res.status(400).json({ error: 'Form status is not eligible for review.' });
    }

    // Update form status to Reviewed
    form.Status = 'Reviewed';
    form.ReviewedBy = reviewedBy;
    form.RejectedBy = "";
    form.RejectionDate = null;
    form.ReviewDate = new Date();

    // Save the updated form
    await form.save();

    res.status(200).send({ status: true, message: 'Form reviewed successfully', data: form });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update form review', error: error.message });
  }
});

// * Reject Form
router.patch('/rejectForm', async (req, res) => {
  try {
    const { formId, reason, rejectedBy } = req.body;

    // Find the form by ID
    const form = await Form.findById(formId);

    // If form not found
    if (!form) {
      console.error(`Form with ID: ${formId} not found.`);
      return res.status(404).json({ error: 'Form not found.' });
    }

    // Ensure the form status is pending
    if (form.Status !== 'Pending') {
      console.warn(`Form with ID: ${formId} cannot be rejected as it is not in 'Pending' status.`);
      return res.status(400).json({ error: 'Form status is not eligible for rejection.' });
    }

    // Ensure the form status is not already Reviewed or Rejected
    if (form.Status === 'Reviewed' || form.Status === 'Rejected' || form.Status === 'Approved' || form.Status === 'Disapproved') {
      console.warn(`Form with ID: ${formId} cannot be rejected as it is already in 'Reviewed' or 'Rejected' or 'Approved' or 'Disapproved' status.`);
      return res.status(400).json({ error: 'Form status is not eligible for rejected.' });
    }
    // Update form status to Rejected
    form.Reason = reason;
    form.RejectionDate = new Date();
    form.ReviewDate = null;
    form.ReviewedBy = "";
    form.Status = 'Rejected';
    form.RejectedBy = rejectedBy;

    // Save the updated form
    await form.save();

    res.status(200).send({ status: true, message: 'Form rejected successfully', data: form });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update form rejection', error: error.message });
  }
});

// * Approve Form
router.patch('/approveForm', async (req, res) => {
  try {
    const { formId, approvedBy } = req.body;

    // Find the form by ID
    const form = await Form.findById(formId);

    // If form not found
    if (!form) {
      console.error(`Form with ID: ${formId} not found.`);
      return res.status(404).json({ error: 'Form not found.' });
    }

    // Ensure the form status is not already Approved or Disapproved
    if (form.Status === 'Approved' || form.Status === 'Disapproved' || form.Status === 'Rejected' || form.Status === 'Pending') {
      console.warn(`Form with ID: ${formId} cannot be approved as it is already in 'Approved' or 'Disapproved' or 'Rejected' or 'Pending' status.`);
      return res.status(400).json({ error: 'Form status is not eligible for approval.' });
    }

    // Update form status to Approved
    form.Status = 'Approved';
    form.ApprovedBy = approvedBy;
    form.DisapprovedBy = "";
    form.DisapprovalDate = null;
    form.ApprovalDate = new Date();

    // Save the updated form
    await form.save();

    res.status(200).send({ status: true, message: 'Form approved successfully', data: form });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update form approval', error: error.message });
  }
});

// * Disapprove Form
router.patch('/disapproveForm', async (req, res) => {
  try {
    const { formId, reason, disapprovedBy } = req.body;

    // Find the form by ID
    const form = await Form.findById(formId);

    // If form not found
    if (!form) {
      console.error(`Form with ID: ${formId} not found.`);
      return res.status(404).json({ error: 'Form not found.' });
    }

    // Ensure the form status is not already Approved or Disapproved
    if (form.Status === 'Approved' || form.Status === 'Disapproved' || form.Status === 'Rejected' || form.Status === 'Pending') {
      console.warn(`Form with ID: ${formId} cannot be disapproved as it is already in 'Approved' or 'Disapproved' or 'Rejected' or 'Pending' status.`);
      return res.status(400).json({ error: 'Form status is not eligible for disapproval.' });
    }

    // Update form status to Disapproved
    form.DisapprovalDate = new Date();
    form.Status = 'Disapproved';
    form.Reason = reason;
    form.ApprovalDate = null;
    form.ApprovedBy = "";
    form.DisapprovedBy = disapprovedBy;

    // Save the updated form
    await form.save();

    res.status(200).send({ status: true, message: 'Form disapproved successfully', data: form });
  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update form disapproval', error: error.message });
  }
});

module.exports = router;