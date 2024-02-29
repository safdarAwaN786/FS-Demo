const express = require('express')
const router = express.Router()
const User = require('../../models/AccountCreation/UserModel')
const Company = require('../../models/AccountCreation/CompanyModel')
const Department = require('../../models/AccountCreation/DepartmentModel')
const ProcessOwner = require('../../models/InternalAudit/ProcessOwnerModel')
const HaccpTeam = require('../../models/HACCP/HaccpTeamModel');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const emailTemplates = require('../../EmailTemplates/userEmail.json');
const template = emailTemplates.registrationConfirmation;
require('dotenv').config();
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth')
// router.use(authMiddleware);


const transporter = nodemailer.createTransport(smtpTransport({
  host: process.env.host,
  port: process.env.port,
  auth: {
    user: process.env.email,
    pass: process.env.pass
  }
}));

// * Create a new User document or update existing
router.post('/create-user', async (req, res) => {
  try {
    console.log('User for creation came');
    const { companyId, departmentId } = req.body;

    // Check if the company with the given ID exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if the department with the given ID belongs to the given company
    const department = await Department.findOne({
      _id: departmentId,
      Company: companyId,
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found or does not belong to the company' });
    }



    const addedUsers = await Promise.all(
      req.body.Users.map(async (user) => {


        // Check if the user with the given username already exists
        const existingUser = await User.findOne({ Company: companyId, UserName: user.UserName });
        if (existingUser) {
          console.log(new Date().toLocaleString() + ' ' + 'User already exists!');
          return res.status(201).json({ status: true, message: 'User already exists!' });
        }
        const password = user.Password;
        // Create a new user
        const newUser = new User({
          Department: department?._id,
          Company: company?._id,
          ...user,
          Password: CryptoJS.AES.encrypt(password, process.env.PASS_CODE).toString()
        });

        // Send email to the new user
        const emailBody = template.body.replace('{{name}}', newUser.Name)
          .replace('{{username}}', newUser.UserName)
          .replace('{{password}}', password);

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
              return newUser;
            }).catch((error) => {
              console.error(error);
              res.status(500).json({ message: 'Error adding user', error: error.message });
            });
          }
        });

      }))


    res.status(201).json({ status: true, message: "user created successfully", data: addedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding user', error: error.message });
  }
});

// * Get a User document by User ID
router.get('/get-user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId).populate({
      path: 'Department',
      model: 'Department'
    }).populate({
      path: 'Company',
      model: 'Company'
    });

    if (!user) {
      console.log(`User with ID: ${userId} not found`);
      return res.status(404).json({ message: `User document with this ID: ${userId} not found` });
    }

    console.log(`User document with ID: ${userId} retrieved successfully`);
    res.status(200).json({ status: true, data: user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting User document', error: error.message });
  }
});
// * Get a User document by ID
router.get('/get-userByCompany/:companyId', async (req, res) => {
  try {
    const CompanyId = req.params.companyId;
    console.log(CompanyId);
    const user = await User.find({ Company: CompanyId, isAuditor: false, isMember: false, isProcessOwner: false, isEmployee: false, isTrainer: false }).populate({
      path: 'Department',
      model: 'Department'
    }).populate({
      path: 'Company',
      model: 'Company'
    });
    console.log(user);

    if (!user) {
      console.log(`User document with ID: ${CompanyId} not found`);
      return res.status(404).json({ message: `User document with ID: ${CompanyId} not found` });
    }

    console.log(`User document with ID: ${CompanyId} retrieved successfully`);
    res.status(200).json({ status: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting User document', error: error.message });
  }
});
router.get('/get-usersByDepartment/:departmentId', async (req, res) => {
  try {
    const DepartmentId = req.params.departmentId;

    const user = await User.find({ Department: DepartmentId, isAuditor: false, isMember: false, isProcessOwner: false, isEmployee: false, isTrainer: false }).populate({
      path: 'Department',
      model: 'Department'
    }).populate({
      path: 'Company',
      model: 'Company'
    });
    console.log(user);

    if (!user) {
      console.log(`User document with ID: ${DepartmentId} not found`);
      return res.status(404).json({ message: `User document with ID: ${DepartmentId} not found` });
    }

    console.log(`User document with ID: ${DepartmentId} retrieved successfully`);
    res.status(200).json({ status: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting User document', error: error.message });
  }
});

// * Get all User documents
router.get('/get-all-users', async (req, res) => {
  try {
    const departmentExist = Department.findById(req.header('Authorization'));
    if (!departmentExist) {
      return res.status(404).json({ message: `Department document with ID: ${req.header('Authorization')} not found` });

    }

    const users = await User.find({ isAuditor: false, isMember: false, isProcessOwner: false, isEmployee: false, isTrainer: false }).populate({
      path: 'Department',
      model: 'Department'
    }).populate({
      path: 'Company',
      model: 'Company'
    });
    const totalUsers = await User.countDocuments();

    if (!users) {
      console.log('User documents not found');
      return res.status(404).json({ message: 'User documents not found' });
    }

    console.log('User documents retrieved successfully');
    res.status(200).json({ status: true, total: totalUsers, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting User documents', error: error.message });
  }
});

// * Delete a User document by ID
router.delete('/delete-user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      console.log(`User document with ID: ${userId} not found`);
      return res.status(404).json({ message: `User document with ID: ${userId} not found` });
    }

    console.log(`User document with ID: ${userId} deleted successfully`);
    res.status(200).json({ status: true, message: 'User document deleted successfully', data: deletedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting User document', error: error.message });
  }
});



// * Update a User document by ID
router.patch('/update-user', async (req, res) => {
  try {
    const userId = req.body.userId;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!updatedUser) {
      console.log(`User document with ID: ${userId} not found`);
      return res.status(404).json({ status: false, message: `User document with ID: ${userId} not found` });
    }

    console.log(`User document with ID: ${userId} updated successfully`);
    res.status(200).json({ status: true, message: 'User document updated successfully', data: updatedUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Error updating User document', error: error.message });
  }
});

// * Assign Tabs To User document by ID
router.patch('/assign-tabs/:UserId', async (req, res) => {
  try {
    const userId = req.params.UserId;

    const updatedUser = await User.findById(userId);

    if (!updatedUser) {
      console.log(`User document with ID: ${userId} not found`);
      return res.status(404).json({ message: `User document with ID: ${userId} not found` });
    }
    console.log(req.body);
    updatedUser.Tabs = req.body.Tabs;
    console.log(updatedUser);

    await updatedUser.save();

    console.log(`User document with ID: ${userId} updated successfully`);
    res.status(200).json({ status: true, message: 'User document updated successfully', data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating User document', error: error.message });
  }
});

// * User Login
router.post('/user/login', async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findOne({ UserName: req.body.userName });

    if (!user) {
      return res.status(401).json({ message: 'User not Exist or Wrong Credentials!' });
    }

    // Decrypt the entered password
    const storedPasswordHash = CryptoJS.AES.decrypt(user.Password, process.env.PASS_CODE);
    const storedPassword = storedPasswordHash.toString(CryptoJS.enc.Utf8);
    console.log('storedPassword', storedPassword)

    // Compare the entered password with the stored hashed password
    if (storedPassword !== req.body.password) {
      console.log('Wrong Credentials!');
      return res.status(400).json({ message: 'Wrong Password' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: 'Access denied!.' });
    }

    const accessToken = jwt.sign(
      {
        id: user?._id
      },
      process.env.JWT_CODE,
      { expiresIn: '2d' }
    )
    const { Password, ...userData } = user._doc
    console.log(`User Logged In: ${user} successfully`);
    res.status(200).json({ status: true, message: 'User Logged In successfully', ...userData, Token: accessToken });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid credentials.' });
  }
});

// * Reassign access the tabs User, HaccpTeam, Trainer, ProcessOwner
router.patch('/reassign-access/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;


    updatedUser = await User.findByIdAndUpdate(userId, { $set: { isSuspended: false } });



    if (!updatedUser) {
      console.log(`User with ID: ${userId} not found`);
      return res.status(404).json({ message: `User with ID: ${userId} not found` });
    }

    console.log(`Access reassigned for user with ID: ${userId}`);
    res.status(200).json({ status: true, message: 'Access reassigned successfully', data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error reassigning access', error: error.message });
  }
});

// * Suspend the user temporarily and reassign access User, HaccpTeam, Trainer, ProcessOwner
router.patch('/suspend-user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    suspendedUser = await User.findByIdAndUpdate(userId, { $set: { isSuspended: true } });

    if (!suspendedUser) {
      console.log(`User with ID: ${userId} not found`);
      return res.status(404).json({ message: `User with ID: ${userId} not found` });
    }

    console.log(`User with ID: ${userId} suspended temporarily and access reassigned successfully`);
    res.status(200).json({ status: true, message: 'User suspended temporarily and access reassigned successfully', data: suspendedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error suspending user and reassigning access', error: error.message });
  }
});
// * User change own Password
router.put('/change-password', async (req, res) => {

  console.log(req.body);
  try {

    const updatedUser = req.body
    if (!updatedUser) {
      console.log(`User document with  not found`);
      return res.status(404).json({ message: `User document with not found` });
    }

    updatedUser.Password = CryptoJS.AES.encrypt(req.body.Password, process.env.PASS_CODE).toString()


    console.log(updatedUser);

    await User.findByIdAndUpdate(updatedUser?._id, updatedUser);

    console.log(`User document updated successfully`);
    res.status(200).json({ status: true, message: 'User document updated successfully', data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating User document', error: error.message });
  }
});

module.exports = router;