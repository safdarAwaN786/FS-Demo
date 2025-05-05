const express = require('express');
const router = express.Router();
const Notification = require('../../models/ManagementRev/NotificationModel').Notification;
const { Agenda } = require('../../models/ManagementRev/NotificationModel');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const ejs = require('ejs');
const authMiddleware = require('../../middleware/auth');
const Participants = require('../../models/ManagementRev/ParticipantsModel');
require('dotenv').config();

// Email transporter setup
const transporter = nodemailer.createTransport(smtpTransport({
  host: process.env.host,
  port: Number(process.env.port) || 587,
  secure: false,
  auth: {
    user: process.env.email,
    pass: process.env.pass
  }
}));

router.post('/create-notification', async (req, res) => {
  try {
    const notificationData = req.body;

    // Format agenda details for email
    const agendaDetails = notificationData.Agendas.map(item =>
      `\nAgenda Name:  ${item.Name}\nAgenda Description:  ${item.Description}`
    ).join('\n\n');

    // Fetch participant emails
    const participants = await Participants.find({
      _id: { $in: notificationData.Participants }
    });

    const participantEmails = participants.map(p => p.Email);

    // Path to the EJS email template
    const templatePath = 'src/EmailTemplates/notificationEmail.ejs';  // Update this to your template path
console.log("notificationData", notificationData);

    // Render the EJS template with dynamic data
    ejs.renderFile(templatePath, {
      venue: notificationData.Venue,
      mrmNo: notificationData.MRMNo,
      date: notificationData.Date,
      time: notificationData.Time,
      agendas: notificationData.Agendas,  // Array of agendas
    }, (err, emailBody) => {
      if (err) {
        console.error('Error rendering EJS template:', err);
        return res.status(500).json({ message: 'Error rendering email template', error: err.message });
      }

      // Set up the mail options
      const mailOptions = {
        from: process.env.email, // Sender email address
        to: participantEmails.join(','), // Recipient's email address
        subject: 'New Meeting Notification', // Email subject
        html: emailBody // Use the rendered HTML from EJS
      };

      // Send the email
      transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Error sending email', error: error.message });
        } else {
          console.log('Email sent: ' + info.response);

          // Save Agendas
          const createdAgendas = await Agenda.create(notificationData.Agendas);
          const agendaIds = createdAgendas.map(a => a._id);

          // Create notification document
          const notificationToSave = new Notification({
            ...notificationData,
            Agendas: agendaIds,
            UserDepartment: req.header('Authorization') // or get it from auth middleware
          });

          await notificationToSave.save();

          return res.status(201).json({
            status: true,
            message: 'Notification created and emails sent successfully',
            data: notificationToSave
          });
        }
      });
    });

  } catch (error) {
    console.error('Error in /create-notification:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

// * Get all Notification documents
router.get('/get-all-notifications', async (req, res) => {
  try {

    const notifications = await Notification.find({ UserDepartment: req.header('Authorization') }).populate('Agendas').populate('Participants').populate('UserDepartment').select('-__v').sort({ createdAt: -1 });

    if (!notifications) {
      console.log('Notification documents not found');
      return res.status(404).json({ message: 'Notification documents not found' });
    }

    console.log('Notification documents retrieved successfully');
    res.status(200).json({ status: true, data: notifications });

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