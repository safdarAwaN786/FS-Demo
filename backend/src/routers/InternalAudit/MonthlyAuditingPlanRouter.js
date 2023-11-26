const express = require('express');
const MonthlyAuditingPlan = require('../../models/InternalAudit/MonthlyAuditingPlanModel');
const YearlyAuditingPlan = require('../../models/InternalAudit/YearlyAuditingPlanModel')
const User = require('../../models/AccountCreation/UserModel');
const ProcessOwner = require('../../models/InternalAudit/ProcessOwnerModel');
const router = new express.Router();
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require("fs");
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

// * Cloudinary Setup 
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});

const upload = multer();

// * Upload Documents To Cloudinary
const uploadToCloudinary = (buffer) => {
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

// * POST Monthly Audit Plan Data Into MongoDB Database
router.post('/addMonthlyAuditingPlan',  async (req, res) => {
    console.log(req.body);
    try {
        const selectedYear = req.body.Year;
        const selectedMonth = req.body.Month;
        const selectedDepartment = req.body.Department;

        // Check if the YearlyAuditingPlan exists for the selected year
        const yearlyPlanAll = await YearlyAuditingPlan.find({ Year: selectedYear }).populate('User');

        const yearlyPlan = yearlyPlanAll.find(Obj => Obj.User.Department.equals(req.user.Department))


        if (!yearlyPlan) {
            return res.status(404).send({
                status: false,
                message: `YearlyAuditPlan for the year ${selectedYear} does not exist.`,
            });
        }

        // Check if the selected month exists in the yearly plan for the selected year
        const monthExists = yearlyPlan.Selected.filter(selected => selected.monthNames.some(month => month === selectedMonth));

        if (!monthExists) {
            return res.status(404).send({
                status: false,
                message: `The selected month "${selectedMonth}" does not exist in the yearly plan for ${selectedYear}.`,
            });
        }

        // Fetch auditors and process owners based on the selected department
        const auditors = req.body.Auditor || '';
        const processOwners = req.body.Process || '';

        // Check if any ProcessOwners or Auditors belong to the selected department
        for (const processOwnerId of processOwners) {
            const processOwner = await ProcessOwner.findById(processOwnerId);
            if (!processOwner) {
                return res.status(404).send({
                    status: false,
                    message: `Process Owner with ID "${processOwnerId}" not found.`,
                });
            }
            // Check if the process owner belongs to the selected department
            if (processOwner.Department === selectedDepartment) {
                return res.status(400).send({
                    status: false,
                    message: `Process Owner with ID "${processOwnerId}" belongs to the selected department "${selectedDepartment}".`,
                });
            }

        }

        for (const auditorId of auditors) {
            const auditor = await User.findById(auditorId);
            if (!auditor) {
                return res.status(404).send({
                    status: false,
                    message: `Auditor with ID "${auditorId}" not found.`,
                });
            }
            // Check if the auditor belongs to the selected department
            if (auditor.Department === selectedDepartment) {
                return res.status(400).send({
                    status: false,
                    message: `Auditor with ID "${auditorId}" belongs to the selected department "${selectedDepartment}".`,
                });
            }
        }

        // Create the MonthlyAuditingPlan document

        const createdBy = req.user.Name;
        const monthlyAuditPlan = new MonthlyAuditingPlan({
            ...req.body,
            CreatedBy: createdBy,
            CreationDate: new Date(),
            User : req.user._id
        });

        await monthlyAuditPlan.save();
        console.log(new Date().toLocaleString() + ' ' + 'Loading MonthlyAuditPlan...');

        res.status(201).send({ Status: true, message: "The MonthlyAuditPlan is added!", data: monthlyAuditPlan });
        console.log(new Date().toLocaleString() + ' ' + 'ADD MonthlyAuditPlan Successfully!');

    } catch (e) {
        console.log(e);
        res.status(400).json({ message: e.message });
    }
});

// * GET All MonthlyPlan Data From MongooDB Database
router.get('/readMonthlyAuditPlan',  async (req, res) => {
    try {

        const monthlyAuditPlan = await MonthlyAuditingPlan.find().populate('LeadAuditor').populate('TeamAuditor').populate({
            path  : 'ProcessOwner',
            populate : {
                path : 'ProcessOwner',
                model : 'User'
            }
        }).populate('YearlyAuditingPlan').populate('Department').populate('User');

        const monthlyPlansToSend = monthlyAuditPlan.filter(Obj => Obj.User.Department.equals(req.user.Department)) 
      

        res.status(201).send({ status: true, message: "The Following are MonthlyAuditingPlans!",
         data: monthlyPlansToSend, });
        console.log(new Date().toLocaleString() + ' ' + 'GET MonthlyAuditingPlans Successfully!')

    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

// * GET  MonthlyPlan ID Data From MongooDB Database
router.get('/readMonthlyAuditPlanById/:planId',  async (req, res) => {
    console.log('Single month plan');
    try {

        const monthlyAuditPlan = await MonthlyAuditingPlan.findById(req.params.planId).populate('LeadAuditor').populate('TeamAuditor').populate({
            path  : 'ProcessOwner',
            populate : {
                path : 'ProcessOwner',
                model : 'User'
            }
        }).populate('YearlyAuditingPlan').populate('Department')
        console.log(new Date().toLocaleString() + ' ' + 'Loading MonthlyAuditPlans...')
        const totalCollections = await MonthlyAuditingPlan.countDocuments()

        res.status(201).send({ status: true, message: "The Following are MonthlyAuditingPlans!", totaldocuments: totalCollections, data: monthlyAuditPlan, });
        console.log(new Date().toLocaleString() + ' ' + 'GET MonthlyAuditingPlans Successfully!')

    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

// * DELETE MonthlyPlan Data By Id From MongooDB Database
router.delete('/deleteMonthlyPlan',  async (req, res) => {
    try {

        const monthlyPlan = await MonthlyAuditingPlan.findOneAndDelete({ _id: req.body.id })
        console.log(new Date().toLocaleString() + ' ' + 'Checking MonthlyPlans...')

        if (!monthlyPlan) {
            res.status(404).send({ status: false, message: "This MonthlyPlan is Not found!" })
        }

        res.status(201).send({ status: true, message: "The Following MonthlyPlan has been Deleted!", data: monthlyPlan });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE MonthlyPlan Successfully!')

    } catch (e) {
        res.status(500).json({ message: e.message });
    }

})

module.exports = router