const express = require('express');
const Equipment = require('../../models/Tech/EquipmentModel');
const router = new express.Router();
require('dotenv').config()
const authMiddleware = require('../../middleware/auth');



router.use(authMiddleware)
// * POST Equipment Data Into MongooDB Database
router.post('/addEquipment',  async (req, res) => {

  console.log("Received request to add equipment.");
  const { equipmentName, equipmentLocation, Range, callibration } = req.body;

  // Check if all required fields are provided
  if (!equipmentName || !equipmentLocation || !callibration || !Range) {
    console.error("Missing required fields in the request.");
    return res.status(400).json({ error: 'All fields are required.' });
  }

  console.log("Equipment data received:", {
    equipmentName,
    equipmentLocation,
    Range,
    callibration,
  });

  try {

    const createdBy = req.user.Name;
    // Create a new Equipment object
    const equipment = new Equipment({
      equipmentName,
      equipmentLocation,
      Range,
      callibration,
      User : req.user._id,
      CreatedBy: createdBy,
      CreationDate: new Date()
    });

    // Save the Equipment to the database
    const savedEquipment = await equipment.save();
    console.log("Equipment saved successfully:", savedEquipment);
    res.status(201).send({ status: true, message: "The Equipment is added!", data: savedEquipment });

  } catch (error) {
    console.error("Error occurred while adding equipment:", error);
    // Check for validation errors (assuming you're using Mongoose)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', message: error.message });
    }
    res.status(500).json({ error: 'Failed to add Equipment', message: error.message });
  }
});

// * GET All Equipment Data From MongooDB Database
router.get('/readAllEquipment',  async (req, res) => {
  try {

    const equipment = await Equipment.find().populate('User');
    
    const equipmentsToSend = equipment.filter((Obj)=>{
      if(Obj.User.Department.equals(req.user.Department)){
        console.log('got Equal');
        return Obj
      }
    });

    res.status(200).json({ status: true, message: 'Successfully retrieved all equipment!',  data: equipmentsToSend });

  } catch (error) {
    console.error('Failed to fetch equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment', message: error.message });
  }
});

// * GET route to fetch Equipment by ID
router.get('/readEquipment/:id',  async (req, res) => {
  try {

    const equipmentId = req.params.id;

    // Check if the equipmentId is provided
    if (!equipmentId) {
      return res.status(400).json({ error: 'Please provide equipment ID' });
    }

    // Find the equipment by its ID in the database
    const equipment = await Equipment.findById(equipmentId);

    // If equipment is not found, return a 404 error response
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Send the response with the equipment data
    res.status(200).json({ status: true, message: 'Equipment found!', data: equipment });

  } catch (error) {
    console.error('Failed to fetch equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment', message: error.message });
  }
});

// * DELETE route to delete all Equipment
router.delete('/deleteAllEquipment',  async (req, res) => {
  try {
    // Delete all equipment documents from the database
    const equipment = await Equipment.deleteMany();

    // Log the number of deleted documents
    console.log('Deleted Equipment count:', equipment.deletedCount);

    // Check if any equipment documents were deleted
    if (equipment.deletedCount === 0) {
      console.log('No Equipment found to delete.');
      return res.status(404).json({ status: false, message: "No Equipment found to delete!" });
    }

    // Send the success response with the count of deleted documents
    console.log('All Equipment have been deleted!');
    return res.status(200).json({ status: true, message: "All Equipment have been deleted!", data: equipment });

  } catch (error) {
    console.error('Failed to delete equipment:', error);
    return res.status(500).json({ error: 'Failed to delete Equipment', message: error.message });
  }
});

// * DELETE route to delete Equipment by ID
router.delete('/deleteEquipment/:id',  async (req, res) => {
  try {
    const equipmentId = req.params.id;

    // Check if the equipmentId is provided
    if (!equipmentId) {
      return res.status(400).json({ error: 'Please provide equipment ID' });
    }

    // Find the equipment by its ID in the database and delete it
    const equipment = await Equipment.findByIdAndDelete(equipmentId);

    // If equipment is not found, return a 404 error response
    if (!equipment) {
      console.log(`Equipment with ID ${equipmentId} not found.`);
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Log the deleted equipment data
    console.log('Deleted Equipment:', equipment);

    // Send the response with the deleted equipment data
    return res.status(200).json({ status: true, message: "Equipment successfully deleted!", data: equipment });

  } catch (error) {
    console.error('Failed to delete equipment:', error);
    return res.status(500).json({ error: 'Failed to delete Equipment', message: error.message });
  }
});

module.exports = router