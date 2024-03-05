const express = require('express');
const YearlyAuditPlan = require('../../models/InternalAudit/YearlyAuditingPlanModel')
const ProcessOwner = require('../../models/InternalAudit/ProcessOwnerModel')
const router = new express.Router();

// * POST YearlyAuditPlan Data Into MongoDB Database
router.post('/addYearlyAuditPlan',  async (req, res) => {
    console.log(req.body);
    try {
        const yearlyAuditPlan = await YearlyAuditPlan.findOne({
            Year: req.body.Year,
            UserDepartment : req.header('Authorization')
        }).populate('UserDepartment');
        console.log(yearlyAuditPlan);
        if (yearlyAuditPlan) {
            return res.status(303).send({
                status: false,
                message: "YearlyAuditPlan for this year already exists. You can't create new one directly. Please edit the added plan."
            });
        }

       
        const newYearlyPlan = new YearlyAuditPlan({
            ...req.body,
            CreatedBy: req.body.createdBy,
            CreationDate: new Date(),
            UserDepartment : req.header('Authorization')
        });

        await newYearlyPlan.save();
        res.status(201).send({ status: true, message: "The YearlyAuditPlan is added!", data: newYearlyPlan });
        console.log(new Date().toLocaleString() + ' ' + 'ADD YearlyAuditPlan Successfully!');

    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

router.post('/editYearlyAuditPlan',  async (req, res) => {
    console.log(req.body);
    try {
        const yearlyAuditPlan = await YearlyAuditPlan.findOne({
            Year: req.body.Year,
            UserDepartment : req.header('Authorization')
        }).populate('UserDepartment');
        
        if (!yearlyAuditPlan) {
            return res.status(303).send({
                status: false,
                message: "YearlyAuditPlan for this year is not added. Please add new plan for this year."
            });
        }

       
        

       const newplan = await YearlyAuditPlan.findByIdAndUpdate(req.body._id, req.body, {new : true});
        res.status(201).send({ status: true, message: "The YearlyAuditPlan is Updated!", data: newplan });
        console.log(new Date().toLocaleString() + ' ' + 'ADD YearlyAuditPlan Successfully!');

    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// * GET All YearlyAuditPlan Data From MongoDB Database
router.get('/readYearlyAuditPlan',  async (req, res) => {
    console.log('Request made for yearly audit plans');
    try {
        const yearlyAuditPlans = await YearlyAuditPlan.find({UserDepartment : req.header('Authorization')}).populate({
            path: 'Selected',
            populate: {
                path: 'Process',
                model: 'ProcessOwner',
                populate : {
                    path : 'ProcessOwner',
                    model : 'User'
                }
            }
        }).populate('UserDepartment');

        res.status(200).json({
            status: true,
            message: 'Yearly Audit Plans retrieved successfully',
            data: yearlyAuditPlans
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// * GET YearlyAuditPlan by Id Data From MongoDB Database
router.get('/readYearlyAuditPlanById/:planId',  async (req, res) => {
    console.log('request made for single plan');
    try {
        const yearlyAuditPlan = await YearlyAuditPlan.findById(req.params.planId).populate({
            path: 'Selected',
            populate: {
                path: 'Process',
                model: 'ProcessOwner'
            }
        }).populate('UserDepartment');

        console.log(new Date().toLocaleString() + ' ' + 'Loading YearlyAuditPlan...')
        const totalCollections = await yearlyAuditPlan.length

        res.status(201).send({ status: true, message: "The following is the yearlyAuditPlan!", totaldocuments: totalCollections, data: yearlyAuditPlan, });
        console.log(new Date().toLocaleString() + ' ' + 'GET YearlyAuditPlan Successfully!')

    } catch (e) {
        res.status(500).json({ message: e.message });
    }

});

// * DELETE YearlyAuditPlan Data By Id From MongooDB Database
router.delete('/deleteYearlyAuditPlan/:planId',  async (req, res) => {
    try {

        const yearlyAuditPlan = await YearlyAuditPlan.findOneAndDelete({ _id: req.params.planId })
        console.log(new Date().toLocaleString() + ' ' + 'Checking YearlyAuditPlans...')

        if (!yearlyAuditPlan) {
            res.status(404).send({ status: false, message: "This YearlyAuditPlan is Not found!" })
        }

        res.status(201).send({ status: true, message: "The following yearlyAuditPlan has been Deleted!", data: yearlyAuditPlan });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE YearlyAuditPlan Successfully!')

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
})

// * DELETE All YearlyAuditPlan Data From MongooDB Database
router.delete('/deleteAllYearlyAuditPlans',  async (req, res) => {
    try {

        const yearlyAuditPlan = await YearlyAuditPlan.deleteMany({})
        console.log(new Date().toLocaleString() + ' ' + 'Checking YearlyAuditPlans...')

        if (yearlyAuditPlan.deletedCount === 0) {
            res.status(404).send({ status: false, message: "No YearlyAuditPlans Found to delete!" })
        }

        res.status(201).send({ status: true, message: "All yearlyAuditPlans have been deleted!", data: yearlyAuditPlan });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE YearlyAuditPlans Successfully!')

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
})

module.exports = router