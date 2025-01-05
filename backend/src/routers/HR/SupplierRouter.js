const express = require('express');
const router = express.Router();
const Supplier = require('../../models/HR/SupplierModel'); // Replace with the actual path to your Supplier model
// const auth = require('../../auth/authMiddleware');
// const attachUserToRequest = require('../../auth/attachUserToRequest')

// router.use(attachUserToRequest); // Attach user information to the request first
// router.use(auth); // Perform authentication checks using the attached user information

// * Create a new Supplier document
router.post('/create-supplier', async (req, res) => {
    try {
        const supplierData = req.body; // The Supplier data sent in the request body
        const createdBy = req.body.createdBy;
        const createdSupplier = new Supplier({
            ...supplierData,
            CreatedBy: createdBy,
            CreationDate: new Date(),
            UserDepartment: req.header('Authorization')
        });

        await createdSupplier.save();
        console.log(new Date().toLocaleString() + ' ' + 'Creating Supplier document...');

        res.status(201).json({ status: true, message: "Supplier document created successfully", data: createdSupplier });
        console.log(new Date().toLocaleString() + ' ' + 'CREATE Supplier document Successfully!');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating Supplier document', error: error.message });
    }
});

// * Get all Supplier documents
router.get('/get-all-suppliers', async (req, res) => {
    try {
        const suppliers = await Supplier.find({ UserDepartment: req.header('Authorization') }).populate('UserDepartment');
        console.log('getting supplier');
        if (!suppliers) {
            console.log('Supplier documents not found');
            return res.status(404).json({ message: 'Supplier documents not found' });
        }

        res.status(200).json({ status: true, data: suppliers });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting Supplier documents', error: error.message });
    }
});

// * Get a Supplier document by ID
router.get('/get-supplier/:supplierId', async (req, res) => {
    try {
        const supplierId = req.params.supplierId;
        const supplier = await Supplier.findById(supplierId);
        console.log('geting-suppliers');
        if (!supplier) {
            console.log(`Supplier document with ID: ${supplierId} not found`);
            return res.status(404).json({ message: `Supplier document with ID: ${supplierId} not found` });
        }

        console.log(`Supplier document with ID: ${supplierId} retrieved successfully`);
        res.status(200).json({ status: true, data: supplier });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting Supplier document', error: error.message });
    }
});

// * Delete a Supplier document by ID
router.delete('/delete-supplier', async (req, res) => {
    try {
        const supplierId = req.body.id;
        const deletedSupplier = await Supplier.findByIdAndDelete(supplierId);

        if (!deletedSupplier) {
            console.log(`Supplier document with ID: ${supplierId} not found`);
            return res.status(404).json({ message: `Supplier document with ID: ${supplierId} not found` });
        }

        console.log(`Supplier document with ID: ${supplierId} deleted successfully`);
        res.status(200).json({ status: true, message: 'Supplier document deleted successfully', data: deletedSupplier });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting Supplier document', error: error.message });
    }
});

// * Delete all Supplier documents
router.delete('/delete-all-suppliers', async (req, res) => {
    try {
        const result = await Supplier.deleteMany({});
        if (result.deletedCount === 0) {
            return res.status(404).send({ status: false, message: "No Supplier documents found to delete!" });
        }

        res.status(200).send({ status: true, message: "All Supplier documents have been deleted!", data: result });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE All Supplier documents Successfully!');

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});
// * Approve Supplier From MongoDB Database
router.patch('/approve-supplier', async (req, res) => {
    try {
        const approvedBy = req.body.approvedBy;
        const supplierId = req.body.id;

        // Find the supplier by ID
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            console.error(`Supplier with ID: ${supplierId} not found.`);
            return res.status(404).json({ error: 'Supplier not found.' });
        }

        if (supplier.Status === 'Approved') {
            console.warn(`Supplier with ID: ${supplierId} is already marked as 'Approved'.`);
            return res.status(400).json({ error: 'Supplier is already approved.' });
        }

        // Update the Supplier's fields
        supplier.ApprovalDate = new Date();
        supplier.Status = 'Approved';
        supplier.ApprovedBy = approvedBy;
        supplier.DisapprovalDate = null;
        supplier.DisapprovedBy = null;

        await Supplier.findByIdAndUpdate(
            supplier._id,
            supplier,
            { new: true }
        );
        // Save the updated Supplier
        // await supplier.save();

        // Log successful update
        console.log(`Supplier with ID: ${supplierId} has been approved.`);
        res.status(200).send({ status: true, message: 'The Supplier has been marked as approved.', data: supplier });
    } catch (error) {
        console.error('Error while approving Supplier:', error);
        res.status(500).json({ error: 'Failed to approve Supplier', message: error.message });
    }
});

// * Disapprove Supplier From MongoDB Database
router.patch('/disapprove-supplier', async (req, res) => {
    try {
        const disapprovedBy = req.body.disapprovedBy;
        const supplierId = req.body.id;
        const Reason = req.body.Reason;

        // Find the supplier by ID
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            console.error(`Supplier with ID: ${supplierId} not found.`);
            return res.status(404).json({ error: 'Supplier not found.' });
        }

        // If supplier is already approved
        if (supplier.Status === 'Approved') {
            console.warn(`Supplier with ID: ${supplierId} is already marked as 'Approved'.`);
            return res.status(400).json({ error: 'Supplier is already approved.' });
        }

        // Update the Supplier's fields
        supplier.DisapprovalDate = new Date();
        supplier.Status = 'Disapproved';
        supplier.Reason = Reason;
        supplier.ApprovalDate = null;
        supplier.DisapprovedBy = disapprovedBy;
        supplier.ApprovedBy = null;

        await Supplier.findByIdAndUpdate(
            supplier._id,
            supplier,
            { new: true }
        );
        // Save the updated Supplier
        // await supplier.save();

        // Log successful update
        console.log(`Supplier with ID: ${supplierId} has been disapproved.`);
        res.status(200).send({ status: true, message: 'The Supplier has been marked as disapproved.', data: supplier });
    } catch (error) {
        console.error('Error while disapproving Supplier:', error);
        res.status(500).json({ error: 'Failed to disapprove Supplier', message: error.message });
    }
});

module.exports = router;