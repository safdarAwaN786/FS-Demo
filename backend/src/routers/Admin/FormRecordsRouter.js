const express = require('express');
const router = express.Router();
const FormRecords = require('../../models/Admin/FormRecordsModel');
const Form = require('../../models/Admin/ListOfFormsModel').ListOfForms;
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

// * Route to submit user responses for a form
router.post('/submit-response', async (req, res) => {
  try {


    const formId = req.body.Form;

    const form = await Form.findById(formId);
    console.log(form);

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Check if the Form status is 'Approved'
    if (form.Status !== 'Approved') {
      return res.status(400).json({ message: 'Form is not in an Approved status' });
    }

    const filledBy = req.user.Name;
    const formRecords = new FormRecords({
      ...req.body,
      User: req.user._id,
      FillBy: filledBy
    });

    await formRecords.save();

    console.log(new Date().toLocaleString() + ' ' + 'Submitting User Responses...');
    res.status(201).json({ status: true, message: "User responses submitted successfully", Data: formRecords });
    console.log(new Date().toLocaleString() + ' ' + 'User Responses Submitted Successfully');

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error submitting responses' });

  }
});



// * Add comment to the submitted form
router.patch('/addComment', async (req, res) => {
  try {

    const { resultId, comment } = req.body;

    // Find the document by ID
    const response = await FormRecords.findById(resultId);
    response.Comment = comment;

    // Save the updated document
    await response.save();
    res.status(200).send({ status: true, message: 'Document rejected successfully', data: response });

  } catch (error) {
    res.status(500).send({ status: false, message: 'Failed to update document reject', error: error.message });
  }
});
// * Verify the Answers of an Response
router.patch('/verify-response', async (req, res) => {
  try {

    const { resultId } = req.body;

    // Find the document by ID
    const response = await FormRecords.findById(resultId);
    response.Status = 'Verified';
    response.VerifiedBy = req.user.Name;
    response.VerificationDate = new Date();

    // Save the updated document
    await response.save();
    res.status(200).send({ status: true, message: 'Response Verified successfully', data: response });

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: 'Failed to update document reject', error: error.message });
  }
});

// * Route to get user responses for a form
router.get('/get-responses-by-formId/:formId', async (req, res) => {
  try {

    const formId = req.params.formId;
    console.log(formId);

    const responseForm = await FormRecords.find({ Form: formId }).populate('User').populate([
      {
        path: 'Form',
        model: 'Form',
        populate: {
          path: 'Department',
          model: 'Department'
        }
      },
      {
        path: 'answers',
        populate: {
          path: 'question',
          model: 'Question',

        },
      },
    ]);

    const responsesToSend = responseForm.filter(Obj => Obj.User.Department.equals(req.user.Department));

    if (!responseForm) {
      console.log(new Date().toLocaleString() + ' ' + 'Form not found for responses');
      return res.status(404).json({ error: 'Form not found' });
    }

    console.log(new Date().toLocaleString() + ' ' + 'Getting User Responses...');
    res.status(200).send({ status: true, message: 'Document rejected successfully', data: responsesToSend });
    console.log(new Date().toLocaleString() + ' ' + 'User Responses Retrieved Successfully');

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting responses' });
  }
});
// * Route to get user responses for a form
router.get('/get-record-by-recordId/:recordId', async (req, res) => {
  try {

    const recordId = req.params.recordId;
    console.log(recordId);

    const responseForm = await FormRecords.findById(recordId).populate('User').populate([
      {
        path: 'Form',
        model: 'Form',
        populate: {
          path: 'Department',
          model: 'Department'
        }
      },
      {
        path: 'answers',
        populate: {
          path: 'question',
          model: 'Question',

        },
      },
    ]);

    if (!responseForm) {
      console.log(new Date().toLocaleString() + ' ' + 'Form not found for responses');
      return res.status(404).json({ error: 'Form not found' });
    }

    console.log(new Date().toLocaleString() + ' ' + 'Getting User Responses...');
    res.status(200).send({ status: true, message: 'Document rejected successfully', data: responseForm });
    console.log(new Date().toLocaleString() + ' ' + 'User Responses Retrieved Successfully');

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting responses' });
  }
});

module.exports = router;