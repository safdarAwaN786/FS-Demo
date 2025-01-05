const express = require('express');
const Machinery = require('../../models/Tech/MachineryModel');
const router = new express.Router();
require('dotenv').config()

// router.use(authMiddleware);

// * POST Machinery Data Into MongooDB Database
router.post('/addMachinery',  async (req, res) => {
  try {
    console.log(req.body);
    const { machineName, machinaryLocation, maintenanceFrequency } = req.body;

    const createdBy = req.body.createdBy
    // Create a new machinery object
    const machinery = new Machinery({
      machineName,
      UserDepartment : req.header('Authorization'),
      machinaryLocation,
      maintenanceFrequency,
      CreatedBy: createdBy,
      CreationDate: new Date()
    });

    // Save the machinery to the database
    const savedMachinery = await machinery.save();
    console.log('Machinery added:', savedMachinery);
    res.status(201).send({ status: true, message: 'The Machinery is added!', data: savedMachinery });

  } catch (error) {
    console.error('Error adding machinery:', error);
    res.status(500).json({ error: 'Failed to add machinery', message: error.message });
  }
});

// * GET All Machinery Data From MongooDB Database
router.get('/readAllMachinery',  async (req, res) => {
  try {

    const equipment = await Machinery.find({UserDepartment : req.header('Authorization')}).populate('UserDepartment');
    

    res.status(201).send({ status: true, message: "The following are Machinery!", data: equipment });

  } catch (error) {
    console.error('Failed to fetch equipment:', error.message);
    res.status(500).json({ error: 'Failed to fetch equipment', message: error.message });
  }
});

// * GET route to fetch machinery by ID
router.get('/readMachinery/:id',  async (req, res) => {
  try {

    const machineryId = req.params.id;
    if (!machineryId) {
      console.log('No machine ID provided.');
      return res.status(400).json({ error: 'Please provide a valid Machinery ID' });
    }

    const machinery = await Machinery.findById(machineryId);

    if (!machinery) {
      console.log(`Machinery with ID ${machineryId} not found.`);
      return res.status(404).json({ error: 'Machinery not found' });
    }

    // Log successful retrieval of machinery data
    console.log(`Successfully fetched machinery with ID ${machineryId}.`);
    res.status(201).send({ status: true, message: "The following employee!", data: machinery });

  } catch (error) {
    console.error('Failed to fetch machinery:', error.message);
    res.status(500).json({ error: 'Failed to fetch machinery' });
  }
});

// * DELETE route to delete all machinery
router.delete('/deleteAllMachinery',  async (req, res) => {
  try {

    const machinery = await Machinery.deleteMany();

    if (machinery.deletedCount === 0) {
      console.log('No machinery found to delete.');
      return res.status(404).send({ status: false, message: "No machinery found to delete!" });
    }

    // Log successful deletion of machinery
    console.log(`Deleted ${machinery.deletedCount} machinery items.`);
    return res.status(201).send({ status: true, message: "All machinery have been deleted!", data: machinery });

  } catch (error) {
    // Log the error and respond with an error message
    console.error('Failed to delete machinery:', error.message);
    return res.status(500).json({ error: 'Failed to delete machinery' });
  }
});

// * DELETE route to delete machinery by ID
router.delete('/deleteMachinery/:id',  async (req, res) => {
  try {

    const machineryId = req.params.id;
    if (!machineryId) {
      console.log('No machine ID provided.');
      return res.status(400).json({ error: 'Please provide a valid Machinery ID' });
    }

    const machinery = await Machinery.findByIdAndDelete(machineryId);

    if (!machinery) {
      console.log(`Machinery with ID ${machineryId} not found for deletion.`);
      return res.status(404).json({ error: 'Machinery not found' });
    }

    // Log successful deletion of machinery item
    console.log(`Deleted machinery with ID ${machineryId}.`);
    res.status(201).send({ status: true, message: "The following employee is deleted!", data: machinery });

  } catch (error) {
    // Log the error and respond with an error message
    console.error('Failed to delete machinery:', error.message);
    res.status(500).json({ error: 'Failed to delete machinery' });
  }
});

module.exports = router