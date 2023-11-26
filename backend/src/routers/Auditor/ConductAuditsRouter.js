const express = require('express');
const router = express.Router();
const ConductAudits = require('../../models/Auditor/ConductAuditsModel').ConductAudits; 
const {ChecklistAnswerModel} = require('../../models/Auditor/ConductAuditsModel'); 
const Checklists = require('../../models/Auditor/ChecklistModel').Checklists
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

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
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            console.log(error);
            reject(new Error('Failed to upload file to Cloudinary'));
          } else {
            console.log('success');
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

function generateEvidenceDocArray() {
  const array = [];
  for (let i = 0; i <= 100; i++) {
    array.push({ name: `EvidenceDoc-${i}` });
  }
  return array;
}

// * POST ConductAudit Data Into MongoDB Database
router.post('/addConductAudit',  upload.fields(generateEvidenceDocArray()), async (req, res) => {
  console.log(req.files);
  console.log(req.body);
  try {

    const auditBy = req.user.Name;
    const answers = JSON.parse(req.body.Answers);

    const filesObj = req.files;
    if (filesObj.length !== 0) {

      // Process each question in the Questions array
      for (const key in filesObj) {
        const fileData = filesObj[key][0];
        const index = fileData.fieldname.split('-')[1]; 
        console.log('File Data:', fileData); 
        
        answers[index].EvidenceDoc = await uploadToCloudinary(fileData.buffer).then((result) => {
          return (result.secure_url)
        }).catch((err) => {
          console.log(err);
        });
        console.log('EvidenceDoc:', answers[index].EvidenceDoc)
      }

    }
    console.log(answers);
    const createdAnswers = await ChecklistAnswerModel.create(answers);
    const answersArr = Object.values(createdAnswers);
    const answersIds = answersArr.map(answerObj => answerObj._id);
    console.log(answersIds);
    // Create ConductAudit for this question
    const conductAudit = new ConductAudits({
      ...req.body,
      AuditBy: auditBy,
      AuditDate: new Date(),
      Answers : answersIds,
      User : req.user._id
    });

    await conductAudit.save();
    res.status(201).send({ status: true, message: "ConductAudits added successfully!", data: conductAudit });
    console.log(new Date().toLocaleString() + ' ' + 'ADD ConductAudit Successfully!');

  } catch (e) {
    console.error(e.message);
    res.status(400).json({ message: e.message });
  }
});



// * GET All ConductAudit Data From MongoDB Database
router.get('/readConductAudits',  async (req, res) => {
  try {
    const conductAudits = await ConductAudits.find().populate({
      path : 'Checklist',
      model : 'Checklist',
      populate : {
        path : 'Department',
        model : 'Department'
      }
    }).populate({
      path : 'Answers',
      model : 'ChecklistAnswer',
      populate : {
        path : 'question',
        model : 'ChecklistQuestion'
      }
    }).populate({
      path : 'User',
      populate : {
        path : 'Department',
        model : 'Department'
      }
    });
    const conductAuditsToSend = conductAudits.filter(Obj => Obj.User.Department.equals(req.user.Department))

    res.status(200).send({ status: true, message: "The following are ConductAudits!", data: conductAuditsToSend });
    console.log(new Date().toLocaleString() + ' ' + 'READ ConductAudits Successfully!')
  
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

// * Get ConductAudit By Id
router.get('/get-conduct-audits-by-ChecklistId/:ChecklistId',  async (req, res) => {
  try {
    const checklistId = req.params.ChecklistId;

    const conductAudits = await ConductAudits.find({ Checklist: checklistId }).populate({
      path : 'Checklist',
      model : 'Checklist',
      populate : {
        path : 'Department',
        model : 'Department'
      }
    }).populate({
      path : 'Answers',
      model : 'ChecklistAnswer',
      populate : {
        path : 'question',
        model : 'ChecklistQuestion'
      }
    }).populate({
      path : 'User',
      populate : {
        path : 'Department',
        model : 'Department'
      }
    });

    if (!conductAudits) {
      console.log(new Date().toLocaleString() + ' ' + 'Conduct audits not found for the form');
      return res.status(404).json({ error: 'Conduct audits not found' });
    }

    const conductAuditsToSend = conductAudits.filter(Obj => Obj.User.Department.equals(req.user.Department))
   
    res.status(200).send({ status: true, message: "The following are ConductAudits!", data: conductAuditsToSend });
    console.log(new Date().toLocaleString() + ' ' + 'Conduct Audit Responses Retrieved Successfully');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting conduct audit responses' });
  }
});
router.get('/get-conduct-audit-by-auditId/:auditId',  async (req, res) => {
  try {
    const auditId = req.params.auditId;

    const conductAudit = await ConductAudits.findById(auditId).populate({
      path : 'Checklist',
      model : 'Checklist',
      populate : {
        path : 'Department',
        model : 'Department'
      }
    }).populate({
      path : 'Answers',
      model : 'ChecklistAnswer',
      populate : {
        path : 'question',
        model : 'ChecklistQuestion'
      }
    }).populate({
      path : 'User',
      populate : {
        path : 'Department',
        model : 'Department'
      }
    });

    if (!conductAudit) {
      console.log(new Date().toLocaleString() + ' ' + 'Conduct audits not found for the form');
      return res.status(404).json({ error: 'Conduct audits not found' });
    }
   
    res.status(200).send({ status: true, message: "The following are ConductAudits!", data: conductAudit });
    console.log(new Date().toLocaleString() + ' ' + 'Conduct Audit Responses Retrieved Successfully');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting conduct audit responses' });
  }
});

// * DELETE ConductAudit Data by ID From MongoDB Database
router.delete('/deleteConductAudit',  async (req, res) => {
  try {

    const conductAudit = await ConductAudits.findByIdAndDelete(req.body.id);
    if (!conductAudit) {
      return res.status(404).send({ status: false, message: "ConductAudit not found!" });
    }
    
    res.status(200).send({ status: true, message: "ConductAudit has been deleted!", data: conductAudit });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE ConductAudit Successfully!');
  
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

// * DELETE All ConductAudit Data From MongoDB Database
router.delete('/deleteAllConductAudits',  async (req, res) => {
  try {

    const result = await ConductAudits.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).send({ status: false, message: "No ConductAudits Found to Delete!" });
    }
    res.status(200).send({ status: true, message: "All ConductAudits have been deleted!", data: result });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE All ConductAudits Successfully!');
  
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;