const express = require('express');
const router = express.Router();
const MRM = require('../../models/ManagementRev/MRMModel');
require('dotenv').config();
const NotificationModel = require('../../models/ManagementRev/NotificationModel').Notification;
const { Agenda } = require('../../models/ManagementRev/NotificationModel');
const ParticipantModel = require('../../models/ManagementRev/ParticipantsModel');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const ejs = require('ejs');
const emailTemplates = require('../../EmailTemplates/userMRM.json');
const template = emailTemplates.newMRMDiscussion;

// Create transporter for sending email
const transporter = nodemailer.createTransport(smtpTransport({
  host: process.env.host,
  port: process.env.port,
  auth: {
    user: process.env.email,
    pass: process.env.pass,
  }
}));

// * Create a new MRM document

router.post('/create-mrm', async (req, res) => {
  try {
    const { Notification, AgendaDetails } = req.body;

    // Find the Notification by ID
    const notification = await NotificationModel.findById(Notification);

    // Create a new MRM document
    const createdMRM = new MRM({
      Notification: notification._id,
      UserDepartment: req.header('Authorization'),
      AgendaDetails,
    });

    // Process each agenda and send emails to participants
    for (let index = 0; index < createdMRM.AgendaDetails.length; index++) {
      const agenda = createdMRM.AgendaDetails[index];
      
      // Correct population - get the Agenda document
      const agendaData = await Agenda.findById(agenda.Agenda)
        .select('Name Description');  // Only these fields exist in Agenda schema

      const mrmDetails = {
        agendaName: agendaData.Name || 'No agenda name provided',
        targetDate: agenda.TargetDate || 'No target date provided',  // Note: TargetDate comes from agenda, not agendaData
        discussion: agenda.Discussion || 'No discussion provided',   // These fields are in AgendaDetails
        responsibilities: agenda.Responsibilities || 'No responsibilities provided'
      };

      // Fetch participant emails
      const participantEmails = await Promise.all(
        agenda.Participants.map(async (participantId) => {
          const participant = await ParticipantModel.findById(participantId);
          return participant.Email;
        })
      );

      // Check if there are participants before constructing the email
      if (participantEmails.length > 0) {
        // Path to the EJS email template
        const templatePath = 'src/EmailTemplates/mrmEmailTemplate.ejs';

        console.log("mrmDetails", mrmDetails);

        // Render the EJS template with dynamic data
        ejs.renderFile(templatePath, {
          agendaName: mrmDetails.agendaName,
          targetDate: mrmDetails.targetDate,
          discussion: mrmDetails.discussion,
          responsibilities: mrmDetails.responsibilities
        }, (err, emailBody) => {
          if (err) {
            console.error('Error rendering EJS template:', err);
            return res.status(500).json({ message: 'Error rendering email template', error: err.message });
          }

          // Set up the mail options
          const mailOptions = {
            from: process.env.email,
            to: participantEmails.join(','),
            subject: template.subject,
            html: emailBody
          };

          // Send the email
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.error('Error sending email:', error);
              return res.status(500).json({ message: 'Error sending email', error: error.message });
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        });
      } else {
        console.log('No participants found. Skipping email sending.');
      }
    }

    // Save the MRM document
    await createdMRM.save();

    res.status(200).json({
      status: true,
      message: "MRM document created successfully",
      data: createdMRM
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating MRM document', error: error.message });
  }
});


// * Get all MRM documents
router.get('/get-all-mrms', async (req, res) => {
  try {
    const mrms = await MRM.find({ UserDepartment: req.header('Authorization') }).populate('Notification').populate('UserDepartment').populate({
      path: 'AgendaDetails.Agenda',
      model: 'Agenda'
    }).populate({
      path: 'AgendaDetails.Participants',
      model: 'Participants'
    });

    if (!mrms) {
      console.log('MRM documents not found');
      return res.status(404).json({ message: 'MRM documents not found' });
    }


    console.log('MRM documents retrieved successfully');
    res.status(200).json({ status: true, data: mrms });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting MRM documents', error: error.message });
  }
});

// * Get an MRM document by ID
router.get('/get-mrmbyId/:mrmId', async (req, res) => {
  try {

    const mrmId = req.params.mrmId;
    const mrm = await MRM.findById(mrmId).populate('Notification').populate('UserDepartment').populate({
      path: 'AgendaDetails.Agenda',
      model: 'Agenda'
    }).populate({
      path: 'AgendaDetails.Participants',
      model: 'Participants'
    });

    if (!mrm) {
      console.log(`MRM document with ID: ${mrmId} not found`);
      return res.status(404).json({ message: `MRM document with ID: ${mrmId} not found` });
    }

    console.log(`MRM document with ID: ${mrmId} retrieved successfully`);
    res.status(200).json({ status: true, data: mrm });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting MRM document', error: error.message });
  }
});

// * Delete an MRM document by ID
router.delete('/delete-mrm', async (req, res) => {
  try {

    const mrmId = req.body.id;
    const deletedMRM = await MRM.findByIdAndDelete(mrmId);

    if (!deletedMRM) {
      console.log(`MRM document with ID: ${mrmId} not found`);
      return res.status(404).json({ message: `MRM document with ID: ${mrmId} not found` });
    }

    console.log(`MRM document with ID: ${mrmId} deleted successfully`);
    res.status(200).json({ status: true, message: 'MRM document deleted successfully', data: deletedMRM });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting MRM document', error: error.message });
  }
});

// * Delete all MRM documents
router.delete('/delete-all-mrms', async (req, res) => {
  try {

    const result = await MRM.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).send({ status: false, message: "No MRM documents found to delete!" });
    }
    res.status(200).send({ status: true, message: "All MRM documents have been deleted!", data: result });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE All MRM documents Successfully!');

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;