const express = require('express');
const router = express.Router();
const Reports = require('../../models/Auditor/ReportsModel'); // Import the Reports model
const ConductAudits = require('../../models/Auditor/ConductAuditsModel').ConductAudits;

// const authMiddleware = require('../../middleware/auth')

// router.use(authMiddleware);
// * POST Report Data Into MongoDB Database
router.post('/addReport', async (req, res) => {
    console.log(req.body);

    try {

        const ReportBy = req.body.reportBy;
        const report = new Reports({
            ...req.body,
            ReportBy: ReportBy,
            ReportDate: new Date(),
            UserDepartment: req.header('Authorization')
        });

        await report.save();

        res.status(201).send({ status: true, message: "The Report is added!", data: report });
        console.log(new Date().toLocaleString() + ' ' + 'ADD Report Successfully!');

    } catch (e) {
        console.error(e.message);
        res.status(400).json({ message: e.message });
    }
});

// * GET All Report Data From MongoDB Database
router.get('/readReports', async (req, res) => {
    try {

        const reports = await Reports.find({UserDepartment : req.header('Authorization')}).populate('UserDepartment').populate({
            path: 'ConductAudit',
            populate: [{
                path: 'Checklist',
                model: 'Checklist',
                populate: {
                    path: 'Department',
                    model: 'Department'
                }
            },
            {
                path: 'Answers',
                model: 'ChecklistAnswer',
                populate: {
                    path: 'question',
                    model: 'ChecklistQuestion'
                }
            }]
        }).populate({
            path : 'SelectedAnswers.Answer',
            model : 'ChecklistAnswer',
            populate: {
                path: 'question',
                model: 'ChecklistQuestion'
            }
        })

       


        res.status(200).send({ status: true, message: "The following are Reports!", data: reports });
        console.log(new Date().toLocaleString() + ' ' + 'READ Reports Successfully!')

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});

// * Get Report by Id 
router.get('/readReportByAuditId/:auditId', async (req, res) => {
    console.log(req.params.auditId);
    try {
        const reports = await Reports.find({ ConductAudit: req.params.auditId, UserDepartment : req.header('Authorization') }).populate('UserDepartment').populate({
            path: 'ConductAudit',
            populate: [{
                path: 'Checklist',
                model: 'Checklist',
                populate: {
                    path: 'Department',
                    model: 'Department'
                }
            },
            {
                path: 'Answers',
                model: 'ChecklistAnswer',
                populate: {
                    path: 'question',
                    model: 'ChecklistQuestion'
                }
            }]            
        }).populate({
            path : 'SelectedAnswers.Answer',
            model : 'ChecklistAnswer',
            populate: {
                path: 'question',
                model: 'ChecklistQuestion'
            }
        })

        



        res.status(200).send({ status: true, message: "The following are Reports!", data: reports });
        console.log(new Date().toLocaleString() + ' ' + 'READ Reports Successfully!')

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});

// * Get Report by Id 
router.get('/readReportById/:reportId', async (req, res) => {
    console.log(req.params.auditId);
    try {
        const reports = await Reports.findById(req.params.reportId).populate('UserDepartment').populate({
            path: 'ConductAudit',
            populate: [{
                path: 'Checklist',
                model: 'Checklist',
                populate: {
                    path: 'Department',
                    model: 'Department'
                }
            },
            {
                path: 'Answers',
                model: 'ChecklistAnswer',
                populate: {
                    path: 'question',
                    model: 'ChecklistQuestion'
                }
            }]            
        }).populate({
            path : 'SelectedAnswers.Answer',
            model : 'ChecklistAnswer',
            populate: {
                path: 'question',
                model: 'ChecklistQuestion'
            }
        })
        console.log(new Date().toLocaleString() + ' ' + 'Loading Reports...')

        const totalCollections = await Reports.countDocuments()

        res.status(200).send({ status: true, message: "The following are Reports!", totaldocuments: totalCollections, data: reports });
        console.log(new Date().toLocaleString() + ' ' + 'READ Reports Successfully!')
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});

// * DELETE Report Data by ID From MongoDB Database
router.delete('/deleteReport', async (req, res) => {
    try {

        const report = await Reports.findByIdAndDelete(req.body.id);
        if (!report) {
            return res.status(404).send({ status: false, message: "Report not found!" });
        }
        res.status(200).send({ status: true, message: "Report has been deleted!", data: report });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE Report Successfully!');

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});

// * DELETE All Report Data From MongoDB Database
router.delete('/deleteAllReports', async (req, res) => {
    try {

        const result = await Reports.deleteMany({});
        if (result.deletedCount === 0) {
            return res.status(404).send({ status: false, message: "No Reports Found to Delete!" });
        }
        res.status(200).send({ status: true, message: "All Reports have been deleted!", data: result });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE All Reports Successfully!');

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;