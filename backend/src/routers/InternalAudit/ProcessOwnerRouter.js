const express = require('express');
const ProcessOwner = require('../../models/InternalAudit/ProcessOwnerModel')
const router = new express.Router();
const User = require('../../models/AccountCreation/UserModel');
require('dotenv').config()
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const emailTemplates = require('../../EmailTemplates/userEmail.json');
const template = emailTemplates.registrationConfirmation;
const authMiddleware = require('../../middleware/auth');
const CryptoJS = require('crypto-js');

router.use(authMiddleware);

const transporter = nodemailer.createTransport(smtpTransport({
    host: process.env.host,
    port: process.env.port,
    auth: {
        user: process.env.email,
        pass: process.env.pass,
    }
}));

// * Send email to process owner
router.post('/send-email-to-process-owner', async (req, res) => {
    try {
        const { ownerId } = req.body;
        const processOwner = await ProcessOwner.findById(ownerId);

        if (!processOwner) {
            return res.status(404).json({ message: 'Process Owner not found' });
        }

        const emailBody = template.body.replace('{{name}}', user.user.Name)
            .replace('{{username}}', user.user.UserName)
            .replace('{{password}}', user.user.Password);

        const mailOptions = {
            from: process.env.email, // Sender email address
            to: user.user.Email, // Recipient's email address
            subject: template.subject,
            text: emailBody
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

// * Post Process Data Into MongoDB Database
router.post('/addProcess', async (req, res) => {
    console.log("request made process..");
    console.log(req.body);
    try {
        const userNameExist = await User.findOne({ UserName: req.body.ProcessOwner.UserName });
        if (userNameExist) {
            console.log('Exists already');
            res.status(201).json({ status: false, message: 'UserName already exists!' });
        } else {
            const newUser = new User({
                ...req.body.ProcessOwner,
                UserDepartment: req.body.user.Department._id,
                Department: req.body.user.Department._id,
                Company: req.body.user.Company._id,
                isProcessOwner: req.body.processOwner?.deputyOwner ? false : true,
                isDeputyOwner : req.body.processOwner?.deputyOwner ? true : false,
                CreatedBy: req.body.user.Name,
                CreationDate: new Date(),
                Password: CryptoJS.AES.encrypt(req.body.ProcessOwner.Password, process.env.PASS_CODE).toString(),

            });

            // Send email to the new user
            const emailBody = template.body.replace('{{name}}', newUser.Name)
                .replace('{{username}}', newUser.UserName)
                .replace('{{password}}', req.body.ProcessOwner.Password);

            const mailOptions = {
                from: process.env.email, // Sender email address
                to: newUser.Email, // Recipient's email address
                subject: template.subject,
                text: emailBody
            };

            transporter.sendMail(mailOptions, async function (error, info) {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ message: 'Error sending email', error: error.message });
                } else {
                    console.log('Email sent: ' + info.response);
                    // Save the new user after sending email
                    await newUser.save().then(async () => {

                        const processOwner = new ProcessOwner({
                            ...req.body,
                            ProcessOwner: newUser._id,
                            CreatedBy: req.body.user.Name,
                            CreationDate: new Date(),
                            UserDepartment: req.body.user.Department._id
                        });

                        await processOwner.save().then(() => {
                            console.log('Saved ProcessOwner : ' + processOwner);
                            res.status(200).send({ status: true, message: "The Trainer is added!", data: processOwner });
                        });
                    }).catch((error) => {
                        console.error(error);
                        res.status(500).json({ message: 'Error adding Trainer!', error: error.message });
                    });
                }
            });
        }

        console.log(new Date().toLocaleString() + ' ' + 'ADD ProcessOwner Successfully!');

    } catch (e) {
        console.log(e);
        res.status(400).json({ status: false, message: e.message });

    }
});

// * GET All Process Data From MongooDB Database
router.get('/readProcess', async (req, res) => {
    console.log("request made for process")
    try {

        const processOwner = await ProcessOwner.find({isProcessOwner : true, UserDepartment : req.header('Authorization')}).populate('Department User ProcessOwner');

        

        res.status(201).send({ status: true, message: "The Following are ProcessOwner!", data: processOwner });
        console.log(new Date().toLocaleString() + ' ' + 'READ ProcessOwner Successfully!')

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// * DELETE Process Data By Id From MongooDB Database
router.delete('/deleteProcess', async (req, res) => {
    try {

        const processOwner = await ProcessOwner.findOneAndDelete({ _id: req.body.id })
        console.log(new Date().toLocaleString() + ' ' + 'Checking ProcessOwner...')

        if (!processOwner) {
            res.status(404).send({ status: false, message: "This ProcessOwner is Not found!" })
        }

        res.status(201).send({ status: true, message: "The Following ProcessOwner has been Deleted!", data: processOwner });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE ProcessOwner Successfully!')

    } catch (e) {
        res.status(500).json({ message: e.message });
    }

})

// * DELETE All Processes Data From MongooDB Database
router.delete('/deleteAllProcesses', async (req, res) => {
    try {

        const processOwner = await ProcessOwner.deleteMany({})
        console.log(new Date().toLocaleString() + ' ' + 'Checking ProcessOwner...')

        if (processOwner.deletedCount === 0) {
            res.status(404).send({ status: false, message: "No processOwner Found to Delete!" })
        }

        res.status(201).send({ status: true, message: "All processOwner have been Deleted!", data: processOwner });
        console.log(new Date().toLocaleString() + ' ' + 'DELETE processOwner Successfully!')

    } catch (e) {
        res.status(500).json({ message: e.message });
    }

})




module.exports = router