const express = require('express');
const router = express.Router();
const ConductHaccp = require('../../models/HACCP/ConductHaccpModel').ConductHaccp;
const { HazardModel } = require('../../models/HACCP/ConductHaccpModel');
const authMiddleware = require('../../middleware/auth');


// router.use(authMiddleware);

// * Create a new ConductHaccp document
router.post('/create-conduct-haccp', async (req, res) => {
    try {

        const haccpData = req.body;

        const createdHazards = await HazardModel.create(haccpData.Hazards)
        const hazardsArr = Object.values(createdHazards);
        const hazardsIds = hazardsArr.map(hazardObj => hazardObj._id);
        console.log(hazardsIds);

        const createdConductHaccp = new ConductHaccp({
            ...req.body,
            CreatedBy: req.body.createdBy,
            Hazards: hazardsIds,
            UserDepartment: req.header('Authorization'),
            CreationDate: new Date()
        });

        await createdConductHaccp.save().then(() => {
            console.log('Created HACCAP Conduction' + createdConductHaccp);
            res.status(201).json({ status: true, message: "ConductHaccp document created successfully", data: createdConductHaccp });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating ConductHaccp document', error: error.message });
    }
});

// * Get all ConductHaccp documents
router.get('/get-all-conduct-haccp', async (req, res) => {
    try {

        const conductHaccps = await ConductHaccp.find({UserDepartment : req.header('Authorization')}).populate('Department Process UserDepartment').populate({
            path: 'Hazards',
            populate: {
                path: 'Process',
                model: 'ProcessDetail'
            }
        }).populate({
            path: 'Members',
            populate: {
                path: 'Department',
                model: 'Department'
            }
        });
        if (!conductHaccps) {
            console.log('ConductHaccp documents not found');
            return res.status(404).json({ message: 'ConductHaccp documents not found' });
        }

        
        console.log('ConductHaccp documents retrieved successfully');
        res.status(200).json({ status: true, data: conductHaccps });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting ConductHaccp documents', error: error.message });
    }
});

// * Get a ConductHaccp document by ID
router.get('/get-conduct-haccp/:haccpId', async (req, res) => {
    try {

        const conductHaccpId = req.params.haccpId;
        const conductHaccp = await ConductHaccp.findById(conductHaccpId).populate('Department Process UserDepartment').populate({
            path: 'Hazards',
            populate: {
                path: 'Process',
                model: 'ProcessDetail'
            }
        }).populate({
            path: 'Members',
            populate: {
                path: 'Department',
                model: 'Department'
            }
        });
        if (!conductHaccp) {
            console.log(`ConductHaccp document with ID: ${conductHaccpId} not found`);
            return res.status(404).json({ message: `ConductHaccp document with ID: ${conductHaccpId} not found` });
        }

        console.log(`ConductHaccp document with ID: ${conductHaccpId} retrieved successfully`);
        res.status(200).json({ status: true, data: conductHaccp });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting ConductHaccp document', error: error.message });
    }
});

// * Delete a ConductHaccp document by ID
router.delete('/delete-conduct-haccp', async (req, res) => {
    try {

        const conductHaccpId = req.body.id;
        const deletedConductHaccp = await ConductHaccp.findByIdAndDelete(conductHaccpId);

        if (!deletedConductHaccp) {
            console.log(`ConductHaccp document with ID: ${conductHaccpId} not found`);
            return res.status(404).json({ message: `ConductHaccp document with ID: ${conductHaccpId} not found` });
        }

        console.log(`ConductHaccp document with ID: ${conductHaccpId} deleted successfully`);
        res.status(200).json({ status: true, message: 'ConductHaccp document deleted successfully', data: deletedConductHaccp });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting ConductHaccp document', error: error.message });
    }
});

// * Delete all ConductHaccp documents
router.delete('/delete-all-conduct-haccp', async (req, res) => {
    try {

        const result = await ConductHaccp.deleteMany({});
        if (result.deletedCount === 0) {
            return res.status(404).send({ status: false, message: "No ConductHaccp documents found to delete!" });
        }

        res.status(200).send({ status: true, message: "All ConductHaccp documents have been deleted!", data: result });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE All ConductHaccp documents Successfully!');

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});

// * Update a ConductHaccp document by ID
router.put('/update-conduct-haccp/:haccpId', async (req, res) => {
    try {
        const conductHaccpId = req.params.haccpId;
        const existingConductHaccp = await ConductHaccp.findById(conductHaccpId);

        if (!existingConductHaccp) {
            console.log(`ConductHaccp document with ID: ${conductHaccpId} not found`);
            return res.status(404).json({ message: `ConductHaccp document with ID: ${conductHaccpId} not found` });
        }

        // Check if the status is 'Approved', deny the update
        if (existingConductHaccp.Status === 'Approved') {
            console.log(`ConductHaccp document with ID: ${conductHaccpId} is already approved, cannot be updated.`);
            return res.status(400).json({ message: `ConductHaccp document with ID: ${conductHaccpId} is already approved, cannot be updated.` });
        }



        // If the status is 'Pending', do not increment revision number
        if (existingConductHaccp.Status === 'Pending') {
            req.body.RevisionNo = existingConductHaccp.RevisionNo;
        } else if (existingConductHaccp.Status === 'Disapproved') {
            // If the status is 'Disapproved', increment revision number
            req.body.RevisionNo = existingConductHaccp.RevisionNo + 1;
        }
        const haccpData = req.body;

        const createdHazards = await HazardModel.create(haccpData.Hazards)
        const hazardsArr = Object.values(createdHazards);
        const hazardsIds = hazardsArr.map(hazardObj => hazardObj._id);
        console.log(hazardsIds);

        const updates = {
            ...req.body,
            UpdatedBy: req.body.updatedBy,
            UpdationDate: new Date(),
            Hazards : hazardsIds,
            Status: 'Pending'
        };

        const updatedConductHaccp = await ConductHaccp.findByIdAndUpdate(conductHaccpId, updates, { new: true });

        console.log(`ConductHaccp document with ID: ${conductHaccpId} updated successfully`);
        res.status(200).json({ status: true, message: 'ConductHaccp document updated successfully', data: updatedConductHaccp });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating ConductHaccp document', error: error.message });
    }
});

// * Approve ConductHaccp From MongoDB Database
router.patch('/approve-conduct-haccp', async (req, res) => {
    try {

        const conductHaccpId = req.body.id;
        const approvedBy = req.user.Name;
        // Find the ConductHaccp by ID
        const conductHaccp = await ConductHaccp.findById(conductHaccpId);

        // If conductHaccp not found
        if (!conductHaccp) {
            console.error(`ConductHaccp with ID: ${conductHaccpId} not found.`);
            return res.status(404).json({ error: 'ConductHaccp not found.' });
        }

        // If the ConductHaccp is already accepted
        if (conductHaccp.Status === 'Approved') {
            console.warn(`ConductHaccp with ID: ${conductHaccpId} is already marked as 'Approved'.`);
            return res.status(400).json({ error: 'ConductHaccp is already approved.' });
        }

        // Update the ConductHaccp's fields
        conductHaccp.ApprovalDate = new Date();  // Set approval date to current time
        conductHaccp.Status = 'Approved';
        conductHaccp.DisapprovalDate = null;
        conductHaccp.DisapproveBy = null;
        conductHaccp.ApprovedBy = approvedBy;

        // Save the updated ConductHaccp
        await conductHaccp.save();

        // Log successful update
        console.log(`ConductHaccp with ID: ${conductHaccpId} has been approved.`);
        res.status(200).send({ status: true, message: 'The ConductHaccp has been marked as approved.', data: conductHaccp });

    } catch (error) {
        console.error('Error while approving request:', error);
        res.status(500).json({ error: 'Failed to approve request', message: error.message });
    }
});

// * Disapprove ConductHaccp From MongoDB Database
router.patch('/disapprove-conduct-haccp', async (req, res) => {
    try {

        const disapproveBy = req.user.Name
        const conductHaccpId = req.body.id;
        const Reason = req.body.Reason;

        // Find the ConductHaccp by ID
        const conductHaccp = await ConductHaccp.findById(conductHaccpId);

        // If ConductHaccp not found
        if (!conductHaccp) {
            console.error(`ConductHaccp with ID: ${conductHaccpId} not found.`);
            return res.status(404).json({ error: 'ConductHaccp not found.' });
        }

        // If the ConductHaccp is already approved
        if (conductHaccp.Status === 'Approved') {
            console.warn(`ConductHaccp with ID: ${conductHaccpId} is already marked as 'Approved'.`);
            return res.status(400).json({ error: 'ConductHaccp is already approved.' });
        }

        // Update the ConductHaccp's fields
        conductHaccp.DisapprovalDate = new Date();  // Set disapproval date to current time
        conductHaccp.Status = 'Disapproved';
        conductHaccp.Reason = Reason;
        conductHaccp.ApprovalDate = null; // Set approval date to null
        conductHaccp.DisapproveBy = disapproveBy
        conductHaccp.ApprovedBy = 'Pending'

        // Save the updated ConductHaccp
        await conductHaccp.save();

        // Log successful update
        console.log(`ConductHaccp with ID: ${conductHaccpId} has been disapproved.`);
        res.status(200).send({ status: true, message: 'The ConductHaccp has been marked as disapproved.', data: conductHaccp });

    } catch (error) {
        console.error('Error while disapproving ConductHaccp:', error);
        res.status(500).json({ error: 'Failed to disapprove ConductHaccp', message: error.message });
    }
});

module.exports = router;