const express = require('express');
const router = express.Router();
const Participants = require('../../models/ManagementRev/ParticipantsModel');
const authMiddleware = require('../../middleware/auth');

// router.use(authMiddleware);

// * Create a new Participants document
router.post('/create-participants', async (req, res) => {
  try {

    const createdParticipants = new Participants({
      ...req.body,
      UserDepartment : req.header('Authorization')
    });

    await createdParticipants.save();
    console.log(new Date().toLocaleString() + ' ' + 'Creating Participants document...');

    res.status(201).json({ status: true, message: "Participants document created successfully", data: createdParticipants });
    console.log(new Date().toLocaleString() + ' ' + 'CREATE Participants document Successfully!');

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Participants document', error: error.message });
  }
});

// * Get all Participants documents
router.get('/get-all-participants', async (req, res) => {
  try {

    const participantsDocs = await Participants.find({UserDepartment : req.header('Authorization')}).populate('User')
    if (!participantsDocs) {
      console.log('Participants documents not found');
      return res.status(404).json({ message: 'Participants documents not found' });
    }



    console.log('Participants documents retrieved successfully');
    res.status(200).json({ status: true, data: participantsDocs });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Participants documents', error: error.message });
  }
});

// * Get a Participants document by ID
router.get('/get-participant', async (req, res) => {
  try {

    const participantsId = req.body.id;
    const participants = await Participants.findById(participantsId);

    if (!participants) {
      console.log(`Participants document with ID: ${participantsId} not found`);
      return res.status(404).json({ message: `Participants document with ID: ${participantsId} not found` });
    }

    console.log(`Participants document with ID: ${participantsId} retrieved successfully`);
    res.status(200).json({ status: true, data: participants });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Participants document', error: error.message });
  }
});

// * Delete a Participants document by ID
router.delete('/delete-participants', async (req, res) => {
  try {

    const participantsId = req.body.id;
    const deletedParticipants = await Participants.findByIdAndDelete(participantsId);

    if (!deletedParticipants) {
      console.log(`Participants document with ID: ${participantsId} not found`);
      return res.status(404).json({ message: `Participants document with ID: ${participantsId} not found` });
    }

    console.log(`Participants document with ID: ${participantsId} deleted successfully`);
    res.status(200).json({ status: true, message: 'Participants document deleted successfully', data: deletedParticipants });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting Participants document', error: error.message });
  }
});

// * Delete all Participants documents
router.delete('/delete-all-participants', async (req, res) => {
  try {

    const result = await Participants.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).send({ status: false, message: "No Participants documents found to delete!" });
    }

    res.status(200).send({ status: true, message: "All Participants documents have been deleted!", data: result });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE All Participants documents Successfully!');

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

// * Update a Participants document by ID
router.put('/update-participants', async (req, res) => {
  try {
    const participantsId = req.body.id;

    // Exclude the _id field from updates
    const { id, ...updates } = req.body;

    const updatedParticipants = await Participants.findByIdAndUpdate(participantsId, updates, { new: true });

    if (!updatedParticipants) {
      console.log(`Participants document with ID: ${participantsId} not found`);
      return res.status(404).json({ message: `Participants document with ID: ${participantsId} not found` });
    }

    console.log(`Participants document with ID: ${participantsId} updated successfully`);
    res.status(200).json({ status: true, message: 'Participants document updated successfully', data: updatedParticipants });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating Participants document', error: error.message });
  }
});

module.exports = router;