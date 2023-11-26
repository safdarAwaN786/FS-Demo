const express = require('express');
const router = express.Router();
const DecisionTree = require('../../models/HACCP/DecisionTreeModel').DecisionTree;
const { DecisionModel } = require('../../models/HACCP/DecisionTreeModel');
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

// * Create a new DecisionTree document
router.post('/create-decision-tree', async (req, res) => {
  try {


    const treeData = req.body;

    const createdDecisions = await DecisionModel.create(treeData.Decisions)
    const decisionsArr = Object.values(createdDecisions);
    const decisionIds = decisionsArr.map(decisionObj => decisionObj._id);
    console.log(decisionIds);

    const createdDecisionTree = new DecisionTree({
      ...req.body,
      Decisions: decisionIds,
      CreatedBy: req.user.Name,
      CreationDate: new Date(),
      User: req.user._id
    });

    await createdDecisionTree.save().then(() => {
      console.log('Created Deision Document :' + createdDecisionTree);
      res.status(201).json({ status: true, message: "DecisionTree document created successfully", data: createdDecisionTree });
    })


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating DecisionTree document', error: error.message });
  }
});

// * Get all DecisionTree documents
router.get('/get-all-decision-trees', async (req, res) => {
  try {

    const decisionTrees = await DecisionTree.find().populate("Department User").populate({
      path: 'ConductHaccp',
      model: 'ConductHaccp',
      populate: [
        {
          path: 'Members',
          populate: {
            path: 'Department',
            model: 'Department'
          }
        },
        {
          path: 'Process',
          model: 'Processes'
        }
      ]
    }).populate({
      path: 'Decisions',
      model: 'Decision',
      populate: {
        path: 'Hazard',
        model: 'Hazard',
        populate: {
          path: 'Process',
          model: 'ProcessDetail',
        }
      }
    });
    if (!decisionTrees) {
      console.log('DecisionTree documents not found');
      return res.status(404).json({ message: 'DecisionTree documents not found' });
    }

    const treesToSend = decisionTrees.filter((Obj) => Obj.User.Department.equals(req.user.Department));
    console.log('DecisionTree documents retrieved successfully');
    res.status(200).json({ status: true, data: treesToSend });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting DecisionTree documents', error: error.message });
  }
});

// * Get a DecisionTree document by ID
router.get('/get-decision-tree/:treeId', async (req, res) => {
  try {

    const decisionTreeId = req.params.treeId;
    const decisionTree = await DecisionTree.findById(decisionTreeId).populate("Department User").populate({
      path: 'ConductHaccp',
      model: 'ConductHaccp',
      populate: [
        {
          path: 'Members',
          populate: {
            path: 'Department',
            model: 'Department'
          }
        },
        {
          path: 'Process',
          model: 'Processes'
        }
      ]
    }).populate({
      path: 'Decisions',
      model: 'Decision',
      populate: {
        path: 'Hazard',
        model: 'Hazard',
        populate: {
          path: 'Process',
          model: 'ProcessDetail',
        }
      }
    });

    if (!decisionTree) {
      console.log(`DecisionTree document with ID: ${decisionTreeId} not found`);
      return res.status(404).json({ message: `DecisionTree document with ID: ${decisionTreeId} not found` });
    }

    console.log(`DecisionTree document with ID: ${decisionTreeId} retrieved successfully`);
    res.status(200).json({ status: true, data: decisionTree });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting DecisionTree document', error: error.message });
  }
});

// * Delete a DecisionTree document by ID
router.delete('/delete-decision-tree', async (req, res) => {
  try {

    const decisionTreeId = req.body.id;
    const deletedDecisionTree = await DecisionTree.findByIdAndDelete(decisionTreeId);

    if (!deletedDecisionTree) {
      console.log(`DecisionTree document with ID: ${decisionTreeId} not found`);
      return res.status(404).json({ message: `DecisionTree document with ID: ${decisionTreeId} not found` });
    }

    console.log(`DecisionTree document with ID: ${decisionTreeId} deleted successfully`);
    res.status(200).json({ status: true, message: 'DecisionTree document deleted successfully', data: deletedDecisionTree });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting DecisionTree document', error: error.message });
  }
});

// * Delete all DecisionTree documents
router.delete('/delete-all-decision-trees', async (req, res) => {
  try {

    const result = await DecisionTree.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).send({ status: false, message: "No DecisionTree documents found to delete!" });
    }

    res.status(200).send({ status: true, message: "All DecisionTree documents have been deleted!", data: result });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE All DecisionTree documents Successfully!');

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

// * Update a DecisionTree document by ID
router.patch('/update-decision-tree/:treeId', async (req, res) => {
  try {
    const decisionTreeId = req.params.treeId;
    const treeData = req.body;

    // Retrieve the existing decision tree document
    const existingDecisionTree = await DecisionTree.findById(decisionTreeId);

    if (!existingDecisionTree) {
      console.log(`DecisionTree document with ID: ${decisionTreeId} not found`);
      return res.status(404).json({ message: `DecisionTree document with ID: ${decisionTreeId} not found` });
    }

    // Check the status and handle revisions accordingly
    if (existingDecisionTree.Status === 'Approved') {
      // If status is 'Approved', deny the update
      console.log(`DecisionTree document with ID: ${decisionTreeId} is already approved, cannot be updated.`);
      return res.status(400).json({ message: `DecisionTree document with ID: ${decisionTreeId} is already approved, cannot be updated.` });
    }
    const createdDecisions = await DecisionModel.create(treeData.Decisions)
    const decisionsArr = Object.values(createdDecisions);
    const decisionIds = decisionsArr.map(decisionObj => decisionObj._id);
    console.log(decisionIds);

    const updates = {
      ...req.body,
      Decisions : decisionIds
    }

    // If status is 'Pending', do not increment revision number
    if (existingDecisionTree.Status === 'Pending') {
      updates.RevisionNo = existingDecisionTree.RevisionNo;
    } else if (existingDecisionTree.Status === 'Disapproved') {
      // If status is 'Disapproved', increment revision number
      updates.RevisionNo = existingDecisionTree.RevisionNo + 1;
    }

    const updatedDecisionTree = await DecisionTree.findByIdAndUpdate(decisionTreeId, updates, { new: true });

    console.log(`DecisionTree document with ID: ${decisionTreeId} updated successfully`);
    res.status(200).json({ status: true, message: 'DecisionTree document updated successfully', data: updatedDecisionTree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating DecisionTree document', error: error.message });
  }
});

// * Approve DecisionTree From MongoDB Database
router.patch('/approve-decision-tree', async (req, res) => {
  try {
    const approvedBy = req.user.Name;
    const decisionTreeId = req.body.id;

    // Find the DecisionTree by ID
    const decisionTree = await DecisionTree.findById(decisionTreeId);

    // If DecisionTree not found
    if (!decisionTree) {
      console.error(`DecisionTree with ID: ${decisionTreeId} not found.`);
      return res.status(404).json({ error: 'DecisionTree not found.' });
    }

    // If the DecisionTree is already accepted
    if (decisionTree.Status === 'Approved') {
      console.warn(`DecisionTree with ID: ${decisionTreeId} is already marked as 'Approved'.`);
      return res.status(400).json({ error: 'DecisionTree is already approved.' });
    }

    // Update the DecisionTree's fields
    decisionTree.ApprovalDate = new Date(); // Set approval date to current time
    decisionTree.Status = 'Approved';
    decisionTree.ApprovedBy = approvedBy;
    decisionTree.DisapproveDate = null; // Set disapproval date to null
    decisionTree.DisapproveBy = null;
    // Save the updated DecisionTree
    await decisionTree.save();

    // Log successful update
    console.log(`DecisionTree with ID: ${decisionTreeId} has been approved.`);

    res.status(200).send({
      status: true,
      message: 'The DecisionTree has been marked as approved.',
      data: decisionTree,
    });

  } catch (error) {
    // Log the error
    console.error('Error while approving request:', error);

    res.status(500).json({ error: 'Failed to approve request', message: error.message });
  }
});

// * Disapprove DecisionTree From MongoDB Database
router.patch('/disapprove-decision-tree', async (req, res) => {
  try {

    const disapproveBy = req.user.Name
    const decisionTreeId = req.body.id;
    const Reason = req.body.Reason;

    // Find the DecisionTree by ID
    const decisionTree = await DecisionTree.findById(decisionTreeId);

    // If DecisionTree not found
    if (!decisionTree) {
      console.error(`DecisionTree with ID: ${decisionTreeId} not found.`);
      return res.status(404).json({ error: 'DecisionTree not found.' });
    }

    // If the DecisionTree is already approved
    if (decisionTree.Status === 'Approved') {
      console.warn(`DecisionTree with ID: ${decisionTreeId} is already marked as 'Approved'.`);
      return res.status(400).json({ error: 'DecisionTree is already approved.' });
    }

    // Update the DecisionTree's fields
    // decisionTree.DisapprovalDate = new Date();  // Set end time to current time
    decisionTree.Status = 'Disapproved';
    decisionTree.Reason = Reason;
    decisionTree.ApprovalDate = null; // Set approval date to null
    decisionTree.ApprovedBy = 'Pending';
    decisionTree.DisapproveBy = disapproveBy

    // Save the updated DecisionTree
    await decisionTree.save();

    // Log successful update
    console.log(`DecisionTree with ID: ${decisionTreeId} has been disapproved.`);

    res.status(200).send({
      status: true,
      message: 'The DecisionTree has been marked as disapproved.',
      data: decisionTree,
    });

  } catch (error) {
    // Log the error
    console.error('Error while disapproving DecisionTree:', error);

    res.status(500).json({ error: 'Failed to disapprove DecisionTree', message: error.message });
  }
});

module.exports = router;