const express = require('express');
const Checklists = require('../../models/Auditor/ChecklistModel').Checklists;
const { ChecklistQuestionModel } = require('../../models/Auditor/ChecklistModel');
const router = express.Router();

// const authMiddleware = require('../../middleware/auth');

// router.use(authMiddleware);


// * POST a new checklist
router.post('/addChecklist', async (req, res) => {
    console.log('Received POST request to add a checklist:', req.body);
    try {

        const createdBy = req.body.createdBy;

        const createdQuestions = await ChecklistQuestionModel.create(req.body.ChecklistQuestions);
        const questionsArr = Object.values(createdQuestions);
        const questionsIds = questionsArr.map(questionObj => questionObj._id);
        console.log(questionsIds);


        // The checklist data sent in the request body
        const checklist = new Checklists({
            ...req.body,
            CreatedBy: createdBy,
            CreationDate: new Date(),
            ChecklistQuestions: questionsIds,
            UserDepartment: req.header('Authorization')
        });

        await checklist.save();


        res.status(201).send({ status: true, message: 'The checklist is added!', data: checklist, });
        console.log(new Date().toLocaleString() + ' ' + 'ADD Checklist Successfully!');

    } catch (e) {
        console.error('Error adding checklist:', e);
        res.status(400).json({ message: e.message });
    }
});

// * GET all checklists
router.get('/getChecklists', async (req, res) => {
    try {

        const checklists = await Checklists.find({UserDepartment : req.header('Authorization')}).populate('Department UserDepartment').populate({
            path: 'ChecklistQuestions',
            model: 'ChecklistQuestion'
        });

       
        res.status(200).send({ status: true, message: 'The following are Checklists!', data: checklists });
        console.log(new Date().toLocaleString() + ' ' + 'GET Checklists Successfully!');

    } catch (e) {
        console.error(new Date().toLocaleString() + ' ' + 'Error retrieving checklists:', e.message);
        res.status(500).json({ message: e.message });
    }
});

// * GET checklist By Id
router.get('/getChecklistById/:checklistId', async (req, res) => {
    try {

        const checklists = await Checklists.findById(req.params.checklistId).populate('Department UserDepartment').populate({
            path: 'ChecklistQuestions',
            model: 'ChecklistQuestion'
        });
        console.log(new Date().toLocaleString() + ' ' + 'Loading Checklists...');

        res.status(200).send({ status: true, message: 'The following are Checklists!', data: checklists });
        console.log(new Date().toLocaleString() + ' ' + 'GET Checklists Successfully!');

    } catch (e) {
        console.error(new Date().toLocaleString() + ' ' + 'Error retrieving checklists:', e.message);
        res.status(500).json({ message: e.message });
    }
});

// * DELETE a checklist by ID
router.delete('/deleteChecklist', async (req, res) => {
    console.log(new Date().toLocaleString() + ' ' + 'Received DELETE request to delete a checklist by ID:', req.body.id);

    try {
        // Find the checklist by ID and remove it
        const deletedChecklist = await Checklists.findByIdAndDelete(req.body.id);
        if (!deletedChecklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        console.log(new Date().toLocaleString() + ' ' + 'Deleted checklist:', deletedChecklist);

        res.status(200).send({ status: true, message: 'The checklist is deleted!', data: deletedChecklist });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE Checklist Successfully!');

    } catch (e) {
        console.error(new Date().toLocaleString() + ' ' + 'Error deleting checklist:', e.message);
        res.status(500).json({ message: e.message });
    }
});

// * DELETE All CreateChecklists Data From MongoDB Database
router.delete('/deleteAllChecklist', async (req, res) => {
    try {

        const result = await Checklists.deleteMany({});
        if (result.deletedCount === 0) {
            return res.status(404).send({ status: false, message: "No CreateChecklists Found to Delete!" });
        }
        res.status(200).send({ status: true, message: "All CreateChecklists have been Deleted!", data: result });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE All CreateChecklists Successfully!');

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});

// * PATCH update a checklist by ID
router.put('/updateChecklist', async (req, res) => {
    
    try {

        const currentChecklist = await Checklists.findById(req.body._id);
        if (!currentChecklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }

        const createdQuestions = await ChecklistQuestionModel.create(req.body.ChecklistQuestions);
        const questionsArr = Object.values(createdQuestions);
        const questionsIds = questionsArr.map(questionObj => questionObj._id);
        console.log(questionsIds);


        let updatedData = {
            ...req.body,
            ChecklistQuestions: questionsIds
        };

        // Check if the status is Approved or Disapproved
        if (currentChecklist.Status === 'Approved' || currentChecklist.Status === 'Disapproved') {
            // Increment the Revision No and set the Status to "Pending"
            updatedData = {
                ...updatedData,
                RevisionNo: currentChecklist.RevisionNo + 1,
                Status: 'Pending',

            };
        } else if (currentChecklist.Status === 'Pending') {
            // If the status is Pending, do not increment Revision No
            // Status remains Pending
            updatedData.Status = 'Pending';
        }

        const updatedChecklist = await Checklists.findByIdAndUpdate(
            req.body._id,
            { $set: updatedData },
            { new: true }
        );

        console.log(new Date().toLocaleString() + ' ' + 'Updated checklist:', updatedChecklist);

        res.status(200).send({ status: true, message: 'The checklist is updated!', data: updatedChecklist });
        console.log(new Date().toLocaleString() + ' ' + 'PATCH Checklist Successfully!');

    } catch (e) {
        console.error(new Date().toLocaleString() + ' ' + 'Error updating checklist:', e.message);
        res.status(500).json({ message: e.message });
    }
});

// * Approve Checklist From MongooDB Database
router.patch('/approveChecklist', async (req, res) => {
    try {

        const approvedBy = req.body.approvedBy;
        const ChecklistId = req.body.id;

        // Find the checklist by ID
        const checklist = await Checklists.findById(ChecklistId);

        // If checklist not found
        if (!checklist) {
            console.error(`Checklist with ID: ${ChecklistId} not found.`);
            return res.status(404).json({ error: 'Checklist not found.' });
        }

        // If the checklist is already accepted
        if (checklist.Status === 'Approved') {
            console.warn(`Checklist with ID: ${ChecklistId} is already marked as 'Approved'.`);
            return res.status(400).json({ error: 'Checklist is already approved.' });
        } else if (checklist.Status === 'Disapproved') {
            console.warn(`Checklist with ID: ${ChecklistId} is already marked as 'Disapproved'.`);
            return res.status(400).json({ error: 'Checklist is already disapproved.' });
        } else {
            // Update the Checklist's fields
            checklist.ApprovalDate = new Date();  // Set end time to current time
            checklist.Status = 'Approved';
            checklist.ApprovedBy = approvedBy;
            checklist.DisapprovedBy = null;
            checklist.DisapprovalDate = null;
        }

        // Save the updated Checklist
        await checklist.save();

        // Log successful update
        console.log(`Checklist with ID: ${ChecklistId} has been approved.`);
        res.status(200).send({ status: true, message: 'The Checklist has been marked as approved.', data: checklist });

    } catch (error) {
        console.error('Error while approving request:', error);
        res.status(500).json({ error: 'Failed to approve request', message: error.message });
    }
});

// * Disapprove Checklist From MongooDB Database
router.patch('/disapproveChecklist', async (req, res) => {
    console.log(req.body);
    try {

        const disapprovedBy = req.body.disapprovedBy;
        const ChecklistId = req.body.id;
        const Reason = req.body.Reason;

        // Find the checklist by ID
        const checklist = await Checklists.findById(ChecklistId);

        // If checklist not found
        if (!checklist) {
            console.error(`Checklist with ID: ${ChecklistId} not found.`);
            return res.status(404).json({ error: 'Checklist not found.' });
        }

        if (checklist.Status === 'Disapproved') {
            console.warn(`Checklist with ID: ${ChecklistId} is already marked as 'dispproved'.`);
            return res.status(400).json({ error: 'Checklist is already disapproved.' });
        } else if (checklist.Status === 'Approved') {
            console.warn(`Checklist with ID: ${ChecklistId} is already marked as 'approved'.`);
            return res.status(400).json({ error: 'Checklist is already approved.' });
        } else {
            // Update the Checklist's fields
            checklist.DisapprovalDate = new Date();  // Set end time to current time
            checklist.Status = 'Disapproved';
            checklist.DisapprovedBy = disapprovedBy
            checklist.Reason = Reason;
            checklist.ApprovedBy = null;
            checklist.ApprovalDate = null;
        }

        // Save the updated Checklist
        await checklist.save();

        // Log successful update
        console.log(`Checklist with ID: ${ChecklistId} has been disapproved.`);
        res.status(200).send({ status: true, message: 'The Checklist has been marked as disapproved.', data: checklist });

    } catch (error) {
        console.error('Error while disapproving checklist:', error);
        res.status(500).json({ error: 'Failed to disapprove checklist', message: error.message });
    }
});

module.exports = router;