const express = require("express");
const router = new express.Router();
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const User = require('../../models/AccountCreation/UserModel');
const multer = require('multer');
const fs = require("fs");
const nodemailer = require('nodemailer');
const authMiddleware = require('../../middleware/auth');
const smtpTransport = require('nodemailer-smtp-transport');
const emailTemplates = require('../../EmailTemplates/userEmail.json');
const template = emailTemplates.registrationConfirmation;
const CryptoJS = require('crypto-js');
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
                { resource_type: "auto" },
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

const transporter = nodemailer.createTransport(smtpTransport({
    host: process.env.host,
    port: process.env.port,
    auth: {
        user: process.env.email,
        pass: process.env.pass,
    }
}));

// * Send email to auditor
router.post('/send-email-to-auditor', async (req, res) => {
    try {
        const { auditorId } = req.body;
        const auditor = await Auditor.findById(auditorId);

        if (!auditor) {
            return res.status(404).json({ message: 'Auditor not found' });
        }

        const mailOptions = {
            from: process.env.email, // Sender email address
            to: auditor.Email, // Recipient's email address
            subject: `Welcome, ${auditor.Name}!`,
            text: `Email: ${auditor.Email}\nPassword: ${auditor.Password}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email', error: error.message });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).json({ message: 'Email sent successfully' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending email', error: error.message });
    }
});

// * POST Auditor Data To MongooDB Database
router.post("/addAuditor", upload.fields([{ name: 'AuditorImage' }, { name: 'AuditorDocument' }, { name: 'ApprovedAuditorLetter' }]), async (req, res) => {
    console.log("request made auditor..")

    try {

        const userNameExist = await User.findOne({ UserName: req.body.UserName });
        if (userNameExist) {
            console.log('Exists already');
            res.status(201).json({ status: false, message: 'UserName already exists!' });
        } else {
            console.log('This is entry point')
            // Get the files of the uploaded image and documents
            var auditorImageFile;
            var auditorDocumentFile;
            var approvedAuditorDocumentFile;

            var auditorImageUrl;
            var auditorDocumentUrl;
            var approvedAuditorDocumentUrl;
            console.log(req.body);
            console.log(req.files);
            var approvedAuditor = false

            if (req.body.ApprovedInternalAuditor === 'on') {
                approvedAuditor = true
            }

            if (req.files['AuditorImage']) {
                auditorImageFile = req.files['AuditorImage'][0];

                // Upload the image buffer to Cloudinary and obtain the URL
                auditorImageUrl = await uploadToCloudinary(auditorImageFile.buffer).then((result) => {
                    return (result.secure_url)
                }).catch((err) => {
                    console.log(err);
                });
                console.log(auditorImageUrl);
            }

            if (req.files['AuditorDocument']) {
                auditorDocumentFile = req.files['AuditorDocument'][0];

                // Upload the document buffers to Cloudinary and obtain the URLs
                auditorDocumentUrl = await uploadToCloudinary(auditorDocumentFile.buffer).then((result) => {
                    return (result.secure_url)
                }).catch((err) => {
                    console.log(err);
                });
                console.log(auditorDocumentUrl);
            }

            if (req.files['ApprovedAuditorLetter']) {
                approvedAuditorDocumentFile = req.files['ApprovedAuditorLetter'][0];

                // Upload the document buffers to Cloudinary and obtain the URLs
                approvedAuditorDocumentUrl = await uploadToCloudinary(approvedAuditorDocumentFile.buffer).then((result) => {
                    return (result.secure_url)
                }).catch((err) => {
                    console.log(err);
                });
                console.log(approvedAuditorDocumentUrl);
            }

            const createdBy = req.user.Name;

            const newUser = new User({
                ...req.body,
                ApprovedInternalAuditor: approvedAuditor,
                AuditorImage: auditorImageUrl,
                AuditorDocument: auditorDocumentUrl,
                ApprovedAuditorLetter: approvedAuditorDocumentUrl,
                CreatedBy: createdBy,
                CreationDate: new Date(),
                User : req.user._id,
                Password: CryptoJS.AES.encrypt(req.body.Password, process.env.PASS_CODE).toString(),
                isAuditor : true
            });

            // Send email to the new user
            const emailBody = template.body.replace('{{name}}', newUser.Name)
                .replace('{{username}}', newUser.UserName)
                .replace('{{password}}', req.body.Password);

            const mailOptions = {
                from: process.env.email, // Sender email address
                to: newUser.Email, // Recipient's email address
                subject: template.subject,
                text: emailBody
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ message: 'Error sending email', error: error.message });
                } else {
                    console.log('Email sent: ' + info.response);
                    // Save the new user after sending email
                    newUser.save().then(() => {
                        res.status(200).send({ status: true, message: "The Auditor is added!", data: newUser });
                    }).catch((error) => {
                        console.error(error);
                        res.status(500).json({ message: 'Error adding Trainer!', error: error.message });
                    });
                }
            });
            console.log(new Date().toLocaleString() + " " + "ADD Auditor Successfully!");
        }
    } catch (e) {
        console.log(e);
        res.status(400).send({ status: false, message: e.message });

    }
});

// * GET All Auditor Data From MongooDB Database
router.get("/readAuditor", async (req, res) => {
    try {

        const auditors = await User.find({isAuditor : true}).populate('Department User')

        const auditorsToSend = auditors.filter(Obj => Obj.User.Department.equals(req.user.Department));

        res.status(201).send({ status: true, message: "The Following are the Auditors!", data: auditorsToSend });
        console.log(new Date().toLocaleString() + " " + "GET Auditor Successfully!");

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// * DELETE Auditor Data By Id From MongooDB Database
router.delete('/deleteAuditor', async (req, res) => {
    try {

        const auditor = await User.findOneAndDelete({ _id: req.body.id })
        console.log(new Date().toLocaleString() + ' ' + 'Loading Auditors...')

        if (!auditor) {
            res.status(404).send({ status: false, message: "This Auditor is Not found!" })
        }

        res.status(201).send({ status: true, message: "The following Auditor has been Deleted!", data: auditor });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE Auditor Successfully!')

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
})

// * DELETE All Auditors Data From MongooDB Database
router.delete('/deleteAllAuditors', async (req, res) => {
    try {

        const auditor = await User.deleteMany({})
        console.log(new Date().toLocaleString() + ' ' + 'Loading Auditors...')

        if (auditor.deletedCount === 0) {
            res.status(404).send({ status: false, message: "No Auditors Found to Delete!" })
        }

        res.status(201).send({ status: true, message: "All Auditors have been Deleted!", data: auditor });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE Auditors Successfully!')

    } catch (e) {
        res.status(500).json({ message: e.message });
    }

})




module.exports = router;