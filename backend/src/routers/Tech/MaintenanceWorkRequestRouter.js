const express = require('express');
const WorkRequest = require('../../models/Tech/MaintainanceWorkRequestModel');
const Machinery = require('../../models/Tech/MachineryModel');
const router = new express.Router();
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer();
const authMiddleware = require('../../middleware/auth');
const User = require('../../models/AccountCreation/UserModel');

// router.use(authMiddleware);

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

const uploadToCloudinaryImg = (buffer) => {
  try {

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            reject(new Error('Failed to upload file to Cloudinary'));
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.log('error inside uploadation' + error);
  }
};

// * POST Machinery Data Into MongooDB Database
router.post('/createWorkRequest', upload.fields([{ name: 'mwrImage' }]), async (req, res) => {
  try {

    const { Area, Priority, Discipline, Description, SpecialInstruction, MachineId, } = req.body;
    const requestUser = await User.findById(req.header('Authorization')).populate('Company Department')
    // Validate if Machinery ID exists in Machinery collection
    const machineryExists = await Machinery.findOne({ _id: MachineId });
    if (MachineId & !machineryExists) {
      return res.status(404).json({ error: 'Machinery not found.' });
    }

    // Check if the required image is present
    if (!req.files || !req.files['mwrImage']) {
      console.error('Image is missing for the work request.');
      return res.status(400).json({ error: 'Image for the work request is required.' });
    }

    const imageBuffer = req.files['mwrImage'][0].buffer;
    const imageURL = await uploadToCloudinaryImg(imageBuffer).then((res) => {
      return res.secure_url;
    }).catch((err) => {
      console.log('Error outside ' + err);
    });

    const createdBy = requestUser.Name
    const workRequest = new WorkRequest({
      Area, Priority,
      Discipline: JSON.parse(Discipline),
      Description, SpecialInstruction,
      imageURL,
      UserDepartment: requestUser?.Department?._id,
      Department: requestUser?.Department?._id,
      Machinery: MachineId,
      CreatedBy: createdBy,
      CreationDate: new Date(),
      Date: new Date(),
      Time: new Date()
    });

    const savedWorkRequest = await workRequest.save();

    console.log('Work request Created successfully:', savedWorkRequest);
    res.status(201).send({ status: true, message: 'The Maintenance Work Request (MWR) has been added successfully!', data: savedWorkRequest });

  } catch (error) {
    // Log the error
    console.error('Error while adding Maintenance Work Request (MWR):', error);
    if (error.message.includes('validation failed')) {
      return res.status(400).json({ error: 'Validation failed. Please check your input data.', message: error.message });
    }
    res.status(500).json({ error: 'Failed to add Maintenance Work Request (MWR)', message: error.message });
  }
});

// * Reject the Request to set the own Priority
router.patch('/rejectMWR/:id', async (req, res) => {
  try {
    // Extract the MWR ID from the URL parameters
    const mwrId = req.params.id;
    const rejectedBy = req.body.rejectedBy
    // Extract the reason from the request body
    const { Reason, Priority } = req.body;

    if (!Reason || Reason.trim() === "") {
      console.error('Rejection reason is missing.');
      return res.status(400).json({ error: 'Rejection reason is required.' });
    }

    // Update the MWR's reason and status
    const mwr = await WorkRequest.findById(mwrId);
    // If MWR not found
    if (!mwr) {
      console.error(`MWR with ID: ${mwrId} not found.`);
      return res.status(404).json({ error: 'Maintenance Work Request not found.' });
    }

    mwr.Reason = Reason;
    mwr.Status = 'Rejected';
    mwr.Priority = Priority;
    mwr.RejectedBy = rejectedBy;
    mwr.RejectionDate = new Date();
    mwr.AcceptedBy = 'Pending';
    mwr.AcceptionDate = null;
    mwr.CompletedBy = 'Pending',
      mwr.CompletionDate = null

    await WorkRequest.findByIdAndUpdate(
      mwr._id,
      mwr,
      { new: true }
    );
    // Save the updated MWR
    // await mwr.save();

    // Log successful update
    console.log(`MWR with ID: ${mwrId} has been rejected.`);
    res.status(200).send({ status: true, message: 'The Maintenance Work Request has been rejected successfully.', data: mwr });

  } catch (error) {
    console.error('Error while rejecting Maintenance Work Request:', error);
    res.status(500).json({ error: 'Failed to reject Maintenance Work Request', message: error.message });
  }
});

// * Accept the Request
router.patch('/acceptMWR/:id', async (req, res) => {
  try {
    console.log(req.body);
    // Extract the MWR ID from the URL parameters
    const mwrId = req.params.id;
    const acceptedBy = req.body.acceptedBy
    // Extract fields from the request body
    const { JobAssigned, Designation, DetailOfWork, Priority } = req.body;

    // Validation
    if (!JobAssigned || !Designation || !DetailOfWork) {
      console.error('Required fields are missing.');
      return res.status(400).json({ error: 'All fields (JobAssigned, Designation, DetailOfWork) are required.' });
    }

    // Find the MWR by ID
    const mwr = await WorkRequest.findById(mwrId);

    // If MWR not found
    if (!mwr) {
      console.error(`MWR with ID: ${mwrId} not found.`);
      return res.status(404).json({ error: 'Maintenance Work Request not found.' });
    }

    // Update the MWR's fields
    mwr.JobAssigned = JobAssigned;
    mwr.Designation = Designation;
    mwr.DetailOfWork = DetailOfWork;
    mwr.StartTime = new Date();  // Set start time to current time
    mwr.Status = 'Approved';
    mwr.AcceptedBy = acceptedBy;
    mwr.AcceptionDate = new Date();
    mwr.RejectedBy = null
    mwr.RejectionDate = null;
    mwr.CompletedBy = 'Pending',
    mwr.CompletionDate = null
    mwr.Priority = Priority,


      await WorkRequest.findByIdAndUpdate(
        mwr._id,
        mwr,
        { new: true }
      );
    // Save the updated MWR
    // await mwr.save();

    // Log successful update
    console.log(`MWR with ID: ${mwrId} has been accepted.`);

    res.status(200).send({ status: true, message: 'The Maintenance Work Request has been accepted successfully.', data: mwr });

  } catch (error) {
    console.error('Error while accepting Maintenance Work Request:', error);
    res.status(500).json({ error: 'Failed to accept Maintenance Work Request', message: error.message });
  }
});

// * Complete the Request
router.patch('/completeMWR/:id', async (req, res) => {
  try {
    // Extract the MWR ID from the URL parameters
    const mwrId = req.params.id;
    const completedBy = req.body.completedBy
    // Find the MWR by ID
    const mwr = await WorkRequest.findById(mwrId);

    // If MWR not found
    if (!mwr) {
      console.error(`MWR with ID: ${mwrId} not found.`);
      return res.status(404).json({ error: 'Maintenance Work Request not found.' });
    }

    // If the MWR is already completed
    if (mwr.Status === 'Completed') {
      console.warn(`MWR with ID: ${mwrId} is already marked as 'Completed'.`);
      return res.status(400).json({ error: 'Maintenance Work Request is already completed.' });
    }

    // Update the MWR's fields
    mwr.EndTime = new Date();  // Set end time to current time
    mwr.Status = 'Completed';
    mwr.CompletedBy = completedBy
    mwr.CompletionDate = new Date();



    await WorkRequest.findByIdAndUpdate(
      mwr._id,
      mwr,
      { new: true }
    );
    // Save the updated MWR
    // await mwr.save();

    // Log successful update
    console.log(`MWR with ID: ${mwrId} has been completed.`);
    res.status(200).send({ status: true, message: 'The Maintenance Work Request has been marked as completed.', data: mwr });

  } catch (error) {
    console.error('Error while completing Maintenance Work Request:', error);
    res.status(500).json({ error: 'Failed to complete Maintenance Work Request', message: error.message });
  }
});

// * API to retrieve all work requests
router.get('/getAllWorkRequests', async (req, res) => {
  console.log('mwrs');
  try {
    const workRequests = await WorkRequest.find({ UserDepartment: req.header('Authorization') }).populate('Department')
      .populate('Machinery').populate('UserDepartment').exec();
    // Log successful retrieval
    console.log('All work requests retrieved successfully.');
    res.status(200).json({ message: 'All work requests retrieved successfully', data: workRequests });

  } catch (error) {
    console.error('Error retrieving all work requests:', error);
    res.status(500).json({ error: 'Failed to retrieve work requests', message: error.message });
  }
});
router.get('/getTotalWorkRequests', async (req, res) => {
  console.log('mwrs');
  try {
    const workRequests = await WorkRequest.find().populate('Department')
      .populate('Machinery').populate('UserDepartment').exec();
    const workRequestsToSend = workRequests.filter(request => request.UserDepartment?.Company.equals(req.header('Authorization')))
    // Log successful retrieval
    console.log('All work requests retrieved successfully.');
    res.status(200).json({ message: 'All work requests retrieved successfully', data: workRequestsToSend });

  } catch (error) {
    console.error('Error retrieving all work requests:', error);
    res.status(500).json({ error: 'Failed to retrieve work requests', message: error.message });
  }
});

// * API to retrieve a single work request by its ID
router.get('/getWorkRequestById/:id', async (req, res) => {
  try {
    const workRequestId = req.params.id;
    const workRequest = await WorkRequest.findById(workRequestId)
      .populate('Machinery Department')
      .exec();

    if (!workRequest) {
      return res.status(404).json({ error: 'Work request not found.' });
    }

    // Log successful retrieval
    console.log(`Work request with ID ${workRequestId} retrieved successfully.`);
    res.status(200).json({ message: `Work request with ID ${workRequestId} retrieved successfully`, data: workRequest });

  } catch (error) {
    console.error(`Error retrieving work request with ID ${workRequestId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve work request', message: error.message });
  }
});

// * API to retrieve a single work request by its ID
router.get('/getWorkRequestsByMachineId/:MachineId', async (req, res) => {
  try {

    const MachineId = req.params.MachineId;
    const workRequest = await WorkRequest.find({ Machinery: MachineId, UserDepartment: req.header('Authorization') })
      .populate('Machinery')
      .exec();

    if (!workRequest) {
      return res.status(404).json({ error: 'Work request not found.' });
    }

    // Log successful retrieval
    console.log(`Work request with machine ID ${MachineId} retrieved successfully.`);
    res.status(200).json({ message: `Work request with ID ${MachineId} retrieved successfully`, data: workRequest });

  } catch (error) {
    console.error(`Error retrieving work request with ID ${MachineId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve work request', message: error.message });
  }
});

// * API to delete all work requests
router.delete('/deleteAllWorkRequests', async (req, res) => {
  try {

    await WorkRequest.deleteMany({});  // Deletes all documents in the WorkRequest collection

    // Log successful deletion
    console.log('All work requests deleted successfully.');
    res.status(200).json({ message: 'All work requests deleted successfully' });

  } catch (error) {
    console.error('Error deleting all work requests:', error);
    res.status(500).json({ error: 'Failed to delete all work requests', message: error.message });
  }
});

// * API to delete a single work request by its ID
router.delete('/deleteWorkRequestById/:id', async (req, res) => {
  try {

    const workRequestId = req.params.id;
    const result = await WorkRequest.findByIdAndDelete(workRequestId);

    if (!result) {
      return res.status(404).json({ error: 'Work request not found.' });
    }

    // Log successful deletion
    console.log(`Work request with ID ${workRequestId} deleted successfully.`);
    res.status(200).json({ message: `Work request with ID ${workRequestId} deleted successfully` });

  } catch (error) {
    console.error(`Error deleting work request with ID ${workRequestId}:`, error);
    res.status(500).json({ error: 'Failed to delete work request', message: error.message });
  }
});

module.exports = router