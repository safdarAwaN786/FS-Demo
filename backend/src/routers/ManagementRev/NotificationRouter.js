const express = require('express');
const router = express.Router();
const Notification = require('../../models/ManagementRev/NotificationModel').Notification;
const { Agenda } = require('../../models/ManagementRev/NotificationModel');
require('dotenv').config()
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const emailTemplates = require('../../EmailTemplates/userNotification.json');
const template = emailTemplates.newNotification;
const authMiddleware = require('../../middleware/auth');
const Participants = require('../../models/ManagementRev/ParticipantsModel');

router.use(authMiddleware);

const transporter = nodemailer.createTransport(smtpTransport({
  host: process.env.host,
  port: process.env.port,
  auth: {
    user: process.env.email,
    pass: process.env.pass
  }
}));

// * Create a new Notification document
router.post('/create-notification', async (req, res) => {
  console.log('request To Create Notification');
  try {
    const notificationToCreate = {
      ...req.body,
    }

    console.log(notificationToCreate);

    const agendaDetails = notificationToCreate.Agendas.map(item => `\nAgenda Name:  ${item.Name}\nAgenda Description:  ${item.Description}`).join('\n\n');

    // Send emails to participants
    const participantEmails = await Promise.all(
      notificationToCreate.Participants.map(async (participantId) => {
        const participantObj = await Participants.findById(participantId);
        console.log(participantObj);
        return participantObj.Email
      }))
    console.log(participantEmails);
    const mailOptions = {
      from: process.env.email,
      to: participantEmails.join(','),
      subject: template.subject,
      text: template.body
        .replace('{{venue}}', notificationToCreate.Venue)
        .replace('{{mrmNo}}', notificationToCreate.MRMNo)
        .replace('{{date}}', notificationToCreate.Date)
        .replace('{{time}}', notificationToCreate.Time)
        .replace('{{agenda}}', agendaDetails)
    };

    // Send emails
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email', error: error.message });
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    let agendaIds = [];

    Agenda.create(notificationToCreate.Agendas, (err, createdAgendas) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: 'Error sending email', error: err.message });
      } else {
        console.log(createdAgendas);
        agendaIds = createdAgendas.map(agenda => agenda._id);

        const notificationToSave = new Notification({
          ...notificationToCreate,
          Agendas: agendaIds,
          User: req.user._id
        })
        notificationToSave.save().then(() => {
          console.log('Saved' + notificationToCreate);
          res.status(201).json({ status: true, message: "Notification document created and Email Sent successfully", data: notificationToSave });
        })
      }
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Notification document', error: error.message });
  }
});

// * Get all Notification documents
router.get('/get-all-notifications', async (req, res) => {
  try {

    const notifications = await Notification.find().populate('Agendas')
      .populate('Participants').populate('User').select('-__v').sort({ createdAt: -1 });

    if (!notifications) {
      console.log('Notification documents not found');
      return res.status(404).json({ message: 'Notification documents not found' });
    }

    const notificationsToSend = notifications.filter((Obj) => {
      if (Obj.User.Department.equals(req.user.Department)) {
        console.log('got Equal');
        return Obj
      }
    });


    console.log('Notification documents retrieved successfully');
    res.status(200).json({ status: true, data: notificationsToSend });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Notification documents', error: error.message });
  }
});

// * Get a Notification document by ID
router.get('/get-notification', async (req, res) => {
  try {
    const notificationId = req.body.id;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      console.log(`Notification document with ID: ${notificationId} not found`);
      return res.status(404).json({ message: `Notification document with ID: ${notificationId} not found` });
    }

    console.log(`Notification document with ID: ${notificationId} retrieved successfully`);
    res.status(200).json({ status: true, data: notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting Notification document', error: error.message });
  }
});

// * Delete a Notification document by ID
router.delete('/delete-notification', async (req, res) => {
  try {

    const notificationId = req.body.id;
    const deletedNotification = await Notification.findByIdAndDelete(notificationId);

    if (!deletedNotification) {
      console.log(`Notification document with ID: ${notificationId} not found`);
      return res.status(404).json({ message: `Notification document with ID: ${notificationId} not found` });
    }

    console.log(`Notification document with ID: ${notificationId} deleted successfully`);
    res.status(200).json({ status: true, message: 'Notification document deleted successfully', data: deletedNotification });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting Notification document', error: error.message });
  }
});

// * Delete all Notification documents
router.delete('/delete-all-notifications', async (req, res) => {
  try {

    const result = await Notification.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).send({ status: false, message: "No Notification documents found to delete!" });
    }
    res.status(200).send({ status: true, message: "All Notification documents have been deleted!", data: result });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE All Notification documents Successfully!');

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;