const express = require('express');
const router = express.Router();
const Department = require('../../models/AccountCreation/DepartmentModel'); // Replace with the actual path to your Department model
const Company = require('../../models/AccountCreation/CompanyModel');
const UserModel = require('../../models/AccountCreation/UserModel')
// router.use(authMiddleware)
// * Create a new Department document
router.post('/create-department',  async (req, res) => {
  try {
    console.log('request for adding department');
    console.log(req.body);

    // Check if the company with given ID exists
    const company = await Company.findById(req.body.Company);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    var addedDepartments = [];
    for (let index = 0; index < req.body.Departments.length; index++) {
      const department = req.body.Departments[index];

      const newDepartment = new Department({ ...department, Company: req.body.Company });
      await newDepartment.save().then(() => {
        addedDepartments.push(newDepartment);
      })

    }
    console.log(addedDepartments);

    console.log(new Date().toLocaleString() + ' ' + 'Creating Department document...');

    res.status(201).json({ status: true, message: "Departments added successfully", data: addedDepartments });
    console.log(new Date().toLocaleString() + ' ' + 'CREATE Department document Successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding departments', error: error.message });
  }
});

// * Get all Department documents
router.get('/get-all-departments',  async (req, res) => {
  try {
    const departmentExist = Department.findById(req.header('Authorization'));
    if(!departmentExist){
      return res.status(404).json({ message: `Department document with ID: ${req.header('Authorization')} not found` });

    }

    const departments = await Department.find().populate('Company');

    if (!departments) {
      console.log('Department documents not found');
      return res.status(404).json({ message: 'Department documents not found' });
    }

    console.log('Department documents retrieved successfully');
    res.status(200).json({ status: true, data: departments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Department documents', error: error.message });
  }
});

// * Get a Department document by Company ID
router.get('/get-department/:companyId', async (req, res) => {
  try {
    console.log('request came for departyment');
    const companyId = req.params.companyId;
    const department = await Department.find({Company : companyId}).populate('Company');

    if (!department) {
      console.log(`Departments with company ID: ${companyId} not found`);
      return res.status(404).json({ message: `Department document with this company ID: ${companyId} not found` });
    }

    console.log(`Department document with ID: ${companyId} retrieved successfully`);
    res.status(200).json({ status: true, data: department });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Department document', error: error.message });
  }
});

// * Delete a Department document by ID
router.delete('/delete-department/:departmentId', async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const deletedDepartment = await Department.findByIdAndDelete(departmentId);
    const deletedUsers = await UserModel.deleteMany({Department : departmentId});
    console.log('deleted Users :' + deletedUsers);

    if (!deletedDepartment) {
      console.log(`Department document with ID: ${departmentId} not found`);
      return res.status(404).json({ message: `Department document with ID: ${departmentId} not found` });
    }

    console.log(`Department document with ID: ${departmentId} deleted successfully`);
    res.status(200).json({ status: true, message: 'Department document deleted successfully', data: deletedDepartment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting Department document', error: error.message });
  }
});

// * Delete all Department documents
router.delete('/delete-all-departments', async (req, res) => {
  try {
    const result = await Department.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).send({ status: false, message: "No Department documents found to delete!" });
    }
    res.status(200).send({ status: true, message: "All Department documents have been deleted!", data: result });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE All Department documents Successfully!');
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

// * Update a Department document by ID
router.patch('/update-department',  async (req, res) => {
  try {
    const departmentId = req.body.id;
    const updates = req.body;

    const updatedDepartment = await Department.findByIdAndUpdate(departmentId, updates, { new: true });

    if (!updatedDepartment) {
      console.log(`Department document with ID: ${departmentId} not found`);
      return res.status(404).json({ message: `Department document with ID: ${departmentId} not found` });
    }

    console.log(`Department document with ID: ${departmentId} updated successfully`);
    res.status(200).json({ status: true, message: 'Department document updated successfully', data: updatedDepartment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating Department document', error: error.message });
  }
});

module.exports = router;
