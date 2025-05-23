const express = require('express');
const router = express.Router();
const FoodSafety = require('../../models/HACCP/FoodSafetyPlanModel').FoodSafety;
const { PlanModel } = require('../../models/HACCP/FoodSafetyPlanModel');

// * Create a new FoodSafety document
router.post('/create-food-safety', async (req, res) => {
  try {
    const safetyPlanData = req.body;
    const createdPlans = await PlanModel.create(safetyPlanData.Plans);
    const plansArr = Object.values(createdPlans);
    const plansIds = plansArr.map(planObj => planObj._id);
    console.log(plansIds);

    const createdFoodSafety = new FoodSafety({
      ...req.body,
      Plans: plansIds,
      UserDepartment: req.header('Authorization'),
      CreatedBy: req.body.createdBy,
      CreationDate: new Date()
    });

    await createdFoodSafety.save().then(() => {
      res.status(201).json({ status: true, message: "FoodSafety document created successfully", data: createdFoodSafety });

    })

    console.log(new Date().toLocaleString() + ' ' + 'CREATE FoodSafety document Successfully!');

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating FoodSafety document', error: error.message });
  }
});

// * Get all FoodSafety documents
router.get('/get-all-food-safety', async (req, res) => {
  try {

    const foodSafetyDocs = await FoodSafety.find({ UserDepartment: req.header('Authorization') }).populate('Department UserDepartment').populate({
      path: 'DecisionTree',
      model: 'DecisionTree',
      populate: {
        path: 'ConductHaccp',
        model: 'ConductHaccp',
        populate: [
          {
            path: 'Teams',
            model: 'HaccpTeam',
            populate: {
              path: 'TeamMembers',
              model: 'User'
            }
          },
          {
            path: 'Process',
            model: 'Processes'
          }
        ]
      }
    }).populate({
      path: 'Plans',
      model: 'Plan',
      populate: {
        path: 'Decision',
        model: 'Decision',
        populate: {
          path: 'Hazard',
          model: 'Hazard',
          populate: {
            path: 'Process',
            model: 'ProcessDetail'
          }
        }
      }
    })

    if (!foodSafetyDocs) {
      console.log('FoodSafety documents not found');
      return res.status(404).json({ message: 'FoodSafety documents not found' });
    }



    console.log('FoodSafety documents retrieved successfully');
    res.status(200).json({ status: true, data: foodSafetyDocs });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting FoodSafety documents', error: error.message });
  }
});

// * Get a FoodSafety document by ID
router.get('/get-food-safety/:planId', async (req, res) => {
  try {

    const foodSafetyId = req.params.planId;
    const foodSafety = await FoodSafety.findById(foodSafetyId).populate('Department UserDepartment').populate({
      path: 'DecisionTree',
      model: 'DecisionTree',
      populate: {
        path: 'ConductHaccp',
        model: 'ConductHaccp',
        populate: [
          {
            path: 'Teams',
            model: 'HaccpTeam',
            populate: {
              path: 'TeamMembers',
              model: 'User'
            }
          },
          {
            path: 'Process',
            model: 'Processes'
          }
        ]
      }
    }).populate({
      path: 'Plans',
      model: 'Plan',
      populate: {
        path: 'Decision',
        model: 'Decision',
        populate: {
          path: 'Hazard',
          model: 'Hazard',
          populate: {
            path: 'Process',
            model: 'ProcessDetail'
          }
        }
      }
    })

    if (!foodSafety) {
      console.log(`FoodSafety document with ID: ${foodSafetyId} not found`);
      return res.status(404).json({ message: `FoodSafety document with ID: ${foodSafetyId} not found` });
    }

    console.log(`FoodSafety document with ID: ${foodSafetyId} retrieved successfully`);
    res.status(200).json({ status: true, data: foodSafety });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting FoodSafety document', error: error.message });
  }
});

// * Delete a FoodSafety document by ID
router.delete('/delete-food-safety', async (req, res) => {
  try {

    const foodSafetyId = req.body.id;
    const deletedFoodSafety = await FoodSafety.findByIdAndDelete(foodSafetyId);

    if (!deletedFoodSafety) {
      console.log(`FoodSafety document with ID: ${foodSafetyId} not found`);
      return res.status(404).json({ message: `FoodSafety document with ID: ${foodSafetyId} not found` });
    }

    console.log(`FoodSafety document with ID: ${foodSafetyId} deleted successfully`);
    res.status(200).json({ status: true, message: 'FoodSafety document deleted successfully', data: deletedFoodSafety });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting FoodSafety document', error: error.message });
  }
});

// * Delete all FoodSafety documents
router.delete('/delete-all-food-safety', async (req, res) => {
  try {

    const result = await FoodSafety.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).send({ status: false, message: "No FoodSafety documents found to delete!" });
    }
    res.status(200).send({ status: true, message: "All FoodSafety documents have been deleted!", data: result });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE All FoodSafety documents Successfully!');

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

// * Update a FoodSafety document by ID
router.patch('/update-food-safety/:planId', async (req, res) => {
  try {
    const foodSafetyId = req.params.planId;

    // Retrieve the existing FoodSafety document
    const existingFoodSafety = await FoodSafety.findById(foodSafetyId);

    if (!existingFoodSafety) {
      console.log(`FoodSafety document with ID: ${foodSafetyId} not found`);
      return res.status(404).json({ message: `FoodSafety document with ID: ${foodSafetyId} not found` });
    }

    const safetyPlanData = req.body;

    const createdPlans = await PlanModel.create(safetyPlanData.Plans.map(plan => {
      if (plan._id) {
        const { _id, ...newPlan } = plan;
        return newPlan
      } else {
        return plan
      }
    }));
    const plansArr = Object.values(createdPlans);
    const plansIds = plansArr.map(planObj => planObj._id);

    const updates = {
      ...req.body,
      UpdatedBy: req.body.updatedBy,
      Plans: plansIds,
      UpdationDate: new Date(),
      Status: 'Pending',
      ApprovalDate: null,
      ApprovedBy: null,
      DisapprovalDate: null,
      DisapprovedBy: null,
      Reason: null
    };
    updates.RevisionNo = existingFoodSafety.RevisionNo + 1;
    // Update the FoodSafety document
    const updatedFoodSafety = await FoodSafety.findByIdAndUpdate(foodSafetyId, updates, { new: true });

    console.log(`FoodSafety document with ID: ${foodSafetyId} updated successfully`);
    res.status(200).json({ status: true, message: 'FoodSafety document updated successfully', data: updatedFoodSafety });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating FoodSafety document', error: error.message });
  }
});

// * Approve FoodSafety From MongoDB Database
router.patch('/approve-food-safety', async (req, res) => {
  try {

    const foodSafetyId = req.body.id;
    const approveBy = req.body.approvedBy

    // Find the FoodSafety by ID
    const foodSafety = await FoodSafety.findById(foodSafetyId);

    // If FoodSafety not found
    if (!foodSafety) {
      console.error(`FoodSafety with ID: ${foodSafetyId} not found.`);
      return res.status(404).json({ error: 'FoodSafety not found.' });
    }

    // If the FoodSafety is already accepted
    if (foodSafety.Status === 'Approved') {
      console.warn(`FoodSafety with ID: ${foodSafetyId} is already marked as 'Approved'.`);
      return res.status(400).json({ error: 'FoodSafety is already approved.' });
    }

    // Update the FoodSafety's fields
    foodSafety.ApprovalDate = new Date();  // Set end time to current time
    foodSafety.Status = 'Approved';
    foodSafety.DisapprovalDate = null; // Set disapproval date to null
    foodSafety.DisapprovedBy = null;
    foodSafety.Reason = null;
    foodSafety.ApprovedBy = approveBy

    await FoodSafety.findByIdAndUpdate(
      foodSafety._id,
       foodSafety,
       { new: true }
   );
    // Save the updated FoodSafety
    // await foodSafety.save();

    // Log successful update
    console.log(`FoodSafety with ID: ${foodSafetyId} has been approved.`);

    res.status(200).send({
      status: true,
      message: 'The FoodSafety has been marked as approved.',
      data: foodSafety,
    });

  } catch (error) {
    // Log the error
    console.error('Error while approving request:', error);

    res.status(500).json({ error: 'Failed to approve request', message: error.message });
  }
});

// * Disapprove FoodSafety From MongoDB Database
router.patch('/disapprove-food-safety', async (req, res) => {
  try {

    const foodSafetyId = req.body.id;
    const Reason = req.body.Reason;
    const disapproveBy = req.body.disapprovedBy;

    // Find the FoodSafety by ID
    const foodSafety = await FoodSafety.findById(foodSafetyId);

    // If FoodSafety not found
    if (!foodSafety) {
      console.error(`FoodSafety with ID: ${foodSafetyId} not found.`);
      return res.status(404).json({ error: 'FoodSafety not found.' });
    }

    // If the FoodSafety is already approved
    if (foodSafety.Status === 'Approved') {
      console.warn(`FoodSafety with ID: ${foodSafetyId} is already marked as 'Approved'.`);
      return res.status(400).json({ error: 'FoodSafety is already approved.' });
    }

    // Update the FoodSafety's fields
    foodSafety.DisapprovalDate = new Date();  // Set end time to current time
    foodSafety.Status = 'Disapproved';
    foodSafety.Reason = Reason;
    foodSafety.ApprovalDate = null; // Set approval date to null
    foodSafety.ApprovedBy = null;
    foodSafety.DisapprovedBy = disapproveBy

    await FoodSafety.findByIdAndUpdate(
      foodSafety._id,
       foodSafety,
       { new: true }
   );
    // Save the updated FoodSafety
    // await foodSafety.save();

    // Log successful update
    console.log(`FoodSafety with ID: ${foodSafetyId} has been disapproved.`);

    res.status(200).send({
      status: true,
      message: 'The FoodSafety has been marked as disapproved.',
      data: foodSafety,
    });

  } catch (error) {
    // Log the error
    console.error('Error while disapproving FoodSafety:', error);
    res.status(500).json({ error: 'Failed to disapprove FoodSafety', message: error.message });
  }
});

module.exports = router;