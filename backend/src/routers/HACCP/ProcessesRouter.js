const express = require('express');
const router = express.Router();
const Processes = require('../../models/HACCP/ProcessesModel').Processes;
const { ProcessDetailModel } = require('../../models/HACCP/ProcessesModel');
// router.use(authMiddleware);

// * Create a new Process document
router.post('/create-process', async (req, res) => {
  try {

    const processData = req.body; // The Process data sent in the request body
    const createdBy = req.body.createdBy
    const processDetailsIds = await Promise.all(
      processData.ProcessDetails.map(async (processObj) => {
        if (processObj.subProcesses?.length > 0) {
          try {
            const createdSubProcesses = await ProcessDetailModel.create(processObj.subProcesses);
            console.log(createdSubProcesses);
            const subProcessesArray = Object.values(createdSubProcesses);
            console.log(subProcessesArray);
            const subProcessesIds = subProcessesArray.map(item => item._id);

            const createdProcessDetail = new ProcessDetailModel({
              ...processObj,
              subProcesses: subProcessesIds
            });

            await createdProcessDetail.save();
            console.log('Saved ProcessDetail for :' + createdProcessDetail);
            return createdProcessDetail._id;
          } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error creating Process document', error: err.message });
          }
        } else {
          const createdProcessDetail = new ProcessDetailModel({
            ...processObj
          });

          try {
            await createdProcessDetail.save();
            console.log('Saved ProcessDetail for :' + createdProcessDetail);
            return createdProcessDetail._id;
          } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error creating Process document', error: err.message });
          }
        }
      })
    );


    console.log(processDetailsIds);
    const mainProcessDoc = new Processes({
      ...processData,
      CreatedBy: createdBy,
      UserDepartment: req.header('Authorization'),
      ProcessDetails: processDetailsIds,
      CreationDate: new Date()
    })

    await mainProcessDoc.save().then(() => {
      console.log('Created Main Process : ' + mainProcessDoc);
      res.status(200).json({ status: true, message: "Process document created successfully", data: mainProcessDoc });

    })


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Process document', error: error.message });
  }
});

// * Get all Process documents
router.get('/get-all-processes', async (req, res) => {
  try {

    const processes = await Processes.find({ UserDepartment: req.header('Authorization') }).populate('Department').populate('UserDepartment').populate({
      path: 'ProcessDetails',
      populate: {
        path: 'subProcesses', // Assuming 'subProcesses' is the field you want to populate inside 'ProcessDetails'
        model: 'ProcessDetail' // Adjust the model name as per your schema
      }
    })


    if (!processes) {
      console.log('Process documents not found');
      return res.status(404).json({ message: 'Process documents not found' });
    }


    console.log('Process documents retrieved successfully');
    res.status(200).json({ status: true, data: processes });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Process documents', error: error.message });
  }
});
router.get('/get-approved-processes', async (req, res) => {
  try {

    const processes = await Processes.find({ UserDepartment: req.header('Authorization'), Status: 'Approved' }).populate('Department').populate('UserDepartment').populate({
      path: 'ProcessDetails',
      populate: {
        path: 'subProcesses', // Assuming 'subProcesses' is the field you want to populate inside 'ProcessDetails'
        model: 'ProcessDetail' // Adjust the model name as per your schema
      }
    })


    if (!processes) {
      console.log('Process documents not found');
      return res.status(404).json({ message: 'Process documents not found' });
    }


    console.log('Process documents retrieved successfully');
    res.status(200).json({ status: true, data: processes });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Process documents', error: error.message });
  }
});

// * Get a Process document by ID
router.get('/get-process/:processId', async (req, res) => {
  try {

    const processId = req.params.processId;
    const process = await Processes.findById(processId).populate('Department').populate('UserDepartment').populate({
      path: 'ProcessDetails',
      populate: {
        path: 'subProcesses', // Assuming 'subProcesses' is the field you want to populate inside 'ProcessDetails'
        model: 'ProcessDetail' // Adjust the model name as per your schema
      }
    })

    if (!process) {
      console.log(`Process document with ID: ${processId} not found`);
      return res.status(404).json({ message: `Process document with ID: ${processId} not found` });
    }

    console.log(`Process document with ID: ${processId} retrieved successfully`);
    res.status(200).json({ status: true, data: process });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Process document', error: error.message });
  }
});
// * Get a Process document by ID
router.get('/get-process-detail/:processId', async (req, res) => {
  try {

    const processId = req.params.processId;
    const process = await ProcessDetailModel.findById(processId).populate({
      path: 'subProcesses',
      model: 'ProcessDetail'
    })

    if (!process) {
      console.log(`Process document with ID: ${processId} not found`);
      return res.status(404).json({ message: `Process document with ID: ${processId} not found` });
    }

    console.log(`Process document with ID: ${processId} retrieved successfully`);
    res.status(200).json({ status: true, data: process });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Process document', error: error.message });
  }
});

// * Delete a Process document by ID
router.delete('/delete-process', async (req, res) => {
  try {

    const processId = req.body.id;
    const deletedProcess = await Processes.findByIdAndDelete(processId);

    if (!deletedProcess) {
      console.log(`Process document with ID: ${processId} not found`);
      return res.status(404).json({ message: `Process document with ID: ${processId} not found` });
    }

    console.log(`Process document with ID: ${processId} deleted successfully`);
    res.status(200).json({ status: true, message: 'Process document deleted successfully', data: deletedProcess });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting Process document', error: error.message });
  }
});

// * Delete all Process documents
router.delete('/delete-all-processes', async (req, res) => {
  try {

    const result = await Processes.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).send({ status: false, message: "No Process documents found to delete!" });
    }

    res.status(200).send({ status: true, message: "All Process documents have been deleted!", data: result });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE All Process documents Successfully!');

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

// * Update a Process document by ID
router.patch('/update-process/:processId', async (req, res) => {
  try {
    const processId = req.params.processId;
    const existingProcess = await Processes.findById(processId);

    if (!existingProcess) {
      console.log(`Process document with ID: ${processId} not found`);
      return res.status(404).json({ message: `Process document with ID: ${processId} not found` });
    }
    const processData = req.body; // The Process data sent in the request body
    const processDetailsIds = await Promise.all(
      processData.ProcessDetails.map(async (processObj) => {
        if (processObj.subProcesses?.length > 0) {
          try {
            const createdSubProcesses = await ProcessDetailModel.create(processObj.subProcesses.map(process => {
              const { _id, ...newProcess } = process;
              console.log(newProcess)
              return newProcess;
            }));
            const subProcessesArray = Object.values(createdSubProcesses);
            console.log(subProcessesArray);
            const subProcessesIds = subProcessesArray.map(item => item._id);
            const { _id, ...newProcessObj } = processObj
            const createdProcessDetail = new ProcessDetailModel({
              ...newProcessObj,
              subProcesses: subProcessesIds
            });

            await createdProcessDetail.save();
            console.log('Saved ProcessDetail for :' + createdProcessDetail);
            return createdProcessDetail._id;
          } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error creating Process document', error: err.message });
          }
        } else {
          const { _id, ...newProcess } = processObj;
          const createdProcessDetail = new ProcessDetailModel({
            ...newProcess
          });

          try {
            await createdProcessDetail.save();
            console.log('Saved ProcessDetail for :' + createdProcessDetail);
            return createdProcessDetail._id;
          } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error creating Process document', error: err.message });
          }
        }
      })
    );

    req.body.RevisionNo = existingProcess.RevisionNo + 1;


    const updates = {
      ...req.body,
      ProcessDetails: processDetailsIds,
      UpdatedBy: req.body.updatedBy,
      UpdationDate: new Date(),
      DisapprovalDate: null,
      DisapprovedBy: null,
      ApprovalDate: null,
      ApprovedBy: null,
      Reason :  null,
      Status: 'Pending'
    };

    const updatedProcess = await Processes.findByIdAndUpdate(processId, updates, { new: true });

    console.log(`Process document with ID: ${processId} updated successfully`);
    res.status(200).json({ status: true, message: 'Process document updated successfully', data: updatedProcess });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating Process document', error: error.message });
  }
});

// * Approve Process From MongoDB Database
router.patch('/approve-process', async (req, res) => {
  try {

    const approvedBy = req.body.approvedBy;
    const processId = req.body.id;

    // Find the process by ID
    const process = await Processes.findById(processId);
    if (!process) {
      console.error(`Process with ID: ${processId} not found.`);
      return res.status(404).json({ error: 'Process not found.' });
    }

    if (process.Status === 'Approved') {
      console.warn(`Process with ID: ${processId} is already marked as 'Approved'.`);
      return res.status(400).json({ error: 'Process is already approved.' });
    }

    // Update the Process's fields
    process.ApprovalDate = new Date();
    process.Status = 'Approved';
    process.ApprovedBy = approvedBy;
    process.DisapprovalDate = null;
    process.DisapprovedBy = null;
    process.Reason = null

    // Save the updated Process
    await process.save();

    // Log successful update
    console.log(`Process with ID: ${processId} has been approved.`);
    res.status(200).send({ status: true, message: 'The Process has been marked as approved.', data: process });

  } catch (error) {
    console.error('Error while approving Process:', error);
    res.status(500).json({ error: 'Failed to approve Process', message: error.message });
  }
});

// * Disapprove Process From MongoDB Database
router.patch('/disapprove-process', async (req, res) => {
  try {

    const disapprovedBy = req.body.disapprovedBy
    const processId = req.body.id;
    const Reason = req.body.Reason;

    // Find the process by ID
    const process = await Processes.findById(processId);

    // If process not found
    if (!process) {
      console.error(`Process with ID: ${processId} not found.`);
      return res.status(404).json({ error: 'Process not found.' });
    }

    // If the process is already approved
    if (process.Status === 'Approved') {
      console.warn(`Process with ID: ${processId} is already marked as 'Approved'.`);
      return res.status(400).json({ error: 'Process is already approved.' });
    }

    // Update the Process's fields
    process.DisapprovalDate = new Date();
    process.Status = 'Disapproved';
    process.Reason = Reason;
    process.ApprovalDate = null;
    process.DisapprovedBy = disapprovedBy;
    process.ApprovedBy = null

    // Save the updated Process
    await process.save();

    // Log successful update
    console.log(`Process with ID: ${processId} has been disapproved.`);
    res.status(200).send({ status: true, message: 'The Process has been marked as disapproved.', data: process });

  } catch (error) {
    console.error('Error while disapproving Process:', error);
    res.status(500).json({ error: 'Failed to disapprove Process', message: error.message });
  }
});

module.exports = router;