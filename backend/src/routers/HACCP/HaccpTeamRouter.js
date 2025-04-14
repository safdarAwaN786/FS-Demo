const express = require('express');
const router = express.Router();
const HaccpTeam = require('../../models/HACCP/HaccpTeamModel');
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const CryptoJS = require('crypto-js')
const authMiddleWare = require('../../middleware/auth');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const emailTemplates = require('../../EmailTemplates/userEmail.json');
const UserModel = require('../../models/AccountCreation/UserModel');
const TeamMember = require('../../models/HACCP/TeamMember') 
const template = emailTemplates.registrationConfirmation;
require('dotenv').config()
const { rgb, degrees, PDFDocument, StandardFonts } = require('pdf-lib');
const axios = require('axios');
const user = require('../../models/AccountCreation/UserModel');
const { addFirstPage } = require('../Admin/UploadDocumentRouter');
const haccpTeamMember = require('../../models/HACCP/TeamMember');

// router.use(authMiddleWare); // Perform authentication checks using the attached user information

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

const upload = multer();

// Function to add the company logo and information to the first page
// const addFirstPage = async (page, logoImage, Company, user) => {
//   const { width, height } = page.getSize();

//   const pdfDoc = await PDFDocument.create();
//   const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const logoDims = { width: 300, height: 300 };
//   const centerTextX = width / 2;

//   // Function to wrap text to fit within a specific width
//   const wrapText = (text, maxWidth, font, fontSize) => {
//     const words = text.split(' ');
//     let lines = [];
//     let currentLine = '';

//     for (const word of words) {
//       const testLine = currentLine ? `${currentLine} ${word}` : word;
//       const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
//       if (testLineWidth <= maxWidth) {
//         currentLine = testLine;
//       } else {
//         lines.push(currentLine);
//         currentLine = word;
//       }
//     }
//     if (currentLine) lines.push(currentLine);
//     return lines;
//   };

//   // Draw company logo
//   page.drawImage(logoImage, {
//     x: centerTextX - logoDims.width / 2,
//     y: height - 400,
//     width: logoDims.width,
//     height: logoDims.height
//   });

//   // Add company name
//   const fontSize = 25;
//   const maxWidth = width - 100; // Allow some padding
//   const companyNameText = Company.CompanyName;
//   page.drawText(companyNameText, {
//     x: centerTextX - helveticaFont.widthOfTextAtSize(companyNameText, fontSize) / 2,
//     y: height - 420,
//     color: rgb(0, 0, 0),
//     fontSize
//   });

//   // Add company contact
//   const companyContactText = `Contact # ${Company.PhoneNo}`;
//   page.drawText(companyContactText, {
//     x: centerTextX - helveticaFont.widthOfTextAtSize(companyContactText, fontSize) / 2,
//     y: height - 450,
//     color: rgb(0, 0, 0),
//     fontSize
//   });

//   // Add company email
//   const companyEmailText = `${Company.Email}`;
//   page.drawText(companyEmailText, {
//     x: centerTextX - helveticaFont.widthOfTextAtSize(companyEmailText, fontSize) / 2,
//     y: height - 480,
//     color: rgb(0, 0, 0),
//     fontSize
//   });

//   // Add wrapped company address
//   const companyAddressText = `${Company.Address}`;
//   const wrappedAddress = wrapText(companyAddressText, maxWidth, helveticaFont, fontSize);
//   let yPosition = height - 510;
//   for (const line of wrappedAddress) {
//     page.drawText(line, {
//       x: centerTextX - helveticaFont.widthOfTextAtSize(line, fontSize) / 2,
//       y: yPosition,
//       color: rgb(0, 0, 0),
//       fontSize
//     });
//     yPosition -= 30; // Adjust line spacing
//   }

//   // Add uploaded by and date
//   const uploadByText = `Uploaded By : ${user.Name}`;
//   page.drawText(uploadByText, {
//     x: centerTextX - helveticaFont.widthOfTextAtSize(uploadByText, 20) / 2,
//     y: yPosition - 50,
//     color: rgb(0, 0, 0),
//     size: 20
//   });

//   const uploadDateText = `Uploaded Date : ${formatDate(new Date())}`;
//   page.drawText(uploadDateText, {
//     x: centerTextX - helveticaFont.widthOfTextAtSize(uploadDateText, 20) / 2,
//     y: yPosition - 80,
//     color: rgb(0, 0, 0),
//     size: 20
//   });
// };

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
const formatDate = (date) => {

  const newDate = new Date(date);
  const formatDate = newDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return formatDate;
}
function generateMembersDocArray() {
  const array = [];
  for (let i = 0; i <= 100; i++) {
    array.push({ name: `Document-${i}` });
  }
  return array;
}

const transporter = nodemailer.createTransport(smtpTransport({
  host: process.env.host,
  port: process.env.port,
  auth: {
    user: process.env.email,
    pass: process.env.pass,
  }
}));

// * Send Email Individaully To each Team member
router.post('/send-email-to-member', async (req, res) => {
  try {
    const { memberId } = req.body;
    const haccpTeam = await HaccpTeam.findOne({ 'TeamMembers._id': memberId });

    if (!haccpTeam) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const member = haccpTeam.TeamMembers.find(m => m._id.toString() === memberId);

    const emailBody = template.body
      .replace('{{name}}', member.Name)
      .replace('{{username}}', member.UserName)
      .replace('{{password}}', member.Password);

    const mailOptions = {
      from: process.env.email, // Sender email address
      to: member.Email, // Recipient's email address
      subject: template.subject,
      text: emailBody,
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

// * Create a new HACCP Team document
router.post('/create-haccp-team', upload.fields(generateMembersDocArray()), async (req, res) => {

  try {
    const requestUser = await user.findById(req.header('Authorization')).populate('Company Department')
    // The HACCP Team data sent in the request body
    const teamData = JSON.parse(req.body.Data);
    console.log(teamData);
    const createdBy = requestUser.Name;

    const createdTeam = new HaccpTeam({
      DocumentType: teamData.DocumentType,
      teamName: teamData.teamName,
      Department: teamData.Department,
      UserDepartment: requestUser.Department._id,
      CreatedBy: createdBy,
      CreationDate: new Date()
    });
    await createdTeam.save();
    console.log(createdTeam);
    
    const filesObj = req.files;
    if (filesObj.length !== 0) {
      // Process each question in the Questions array
      for (const key in filesObj) {
        const fileData = filesObj[key][0];
        const index = fileData.fieldname.split('-')[1];
        const response = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFDocument.load(fileData.buffer);
        const logoImage = Buffer.from(response.data);
        const isJpg = requestUser.Company.CompanyLogo.includes('.jpeg') || requestUser.Company.CompanyLogo.includes('.jpg');
        const isPng = requestUser.Company.CompanyLogo.includes('.png');
        let pdfLogoImage;
        if (isJpg) {
          pdfLogoImage = await pdfDoc.embedJpg(logoImage);
        } else if (isPng) {
          pdfLogoImage = await pdfDoc.embedPng(logoImage);
        }
        const firstPage = pdfDoc.insertPage(0);
        addFirstPage(firstPage, pdfLogoImage, requestUser.Company, requestUser, createdTeam.DocumentId, `0`);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        pdfDoc.getPages().slice(1).forEach(async (page) => {
          const { width, height } = page.getSize();
          const extraSpace = 24; // Increase this value for more space at the top
          // Resize the page to add extra space at the top
          page.setSize(width, height + extraSpace);
          // Move the original content down
          page.translateContent(0, -extraSpace);
          // Now add your custom text at the top
          const watermarkText = 'HACCP Team Member Document';
          const watermarkFontSize = 15;
          const watermarkTextWidth = helveticaFont.widthOfTextAtSize(watermarkText, watermarkFontSize);
          const centerWatermarkX = width / 2 - watermarkTextWidth / 2;
          const centerWatermarkY = height + extraSpace - 10; // Place in new space
          page.drawText(watermarkText, {
            x: centerWatermarkX,
            y: centerWatermarkY,
            size: watermarkFontSize,
            color: rgb(0, 0, 0)
          });
          const companyText = `${requestUser.Company.CompanyName}`;
          const companyTextFontSize = 10;
          const companyTextWidth = helveticaFont.widthOfTextAtSize(companyText, companyTextFontSize);
          const centerCompanyTextX = width - companyTextWidth - 20;
          const centerCompanyTextY = height + extraSpace; // Place in new space
          page.drawText(companyText, {
            x: centerCompanyTextX,
            y: centerCompanyTextY,
            size: companyTextFontSize,
            color: rgb(0, 0, 0)
          });
          const dateText = `Document ID : ${createdTeam.DocumentId}`;
          const dateTextFontSize = 10;
          const dateTextWidth = helveticaFont.widthOfTextAtSize(dateText, dateTextFontSize);
          const centerDateTextX = width - dateTextWidth - 20;
          const centerDateTextY = height + extraSpace - 12; // Place in new space
          page.drawText(dateText, {
            x: centerDateTextX,
            y: centerDateTextY,
            size: dateTextFontSize,
            color: rgb(0, 0, 0)
          });

          const revisionNoText = `Revision No : 0`;
          const revisionNoTextFontSize = 10;
          const revisionNoTextWidth = helveticaFont.widthOfTextAtSize(revisionNoText, revisionNoTextFontSize);
          const centerRevisionNoTextX = width - revisionNoTextWidth - 20;
          const centerRevisionNoTextY = height + extraSpace - 24; // Place in new space

          page.drawText(revisionNoText, {
              x: centerRevisionNoTextX,
              y: centerRevisionNoTextY,
              size: revisionNoTextFontSize,
              color: rgb(0, 0, 0)
          });


        });
        // Save the modified PDF
        const modifiedPdfBuffer = await pdfDoc.save();
        teamData.TeamMembers[index].Document = await uploadToCloudinary(modifiedPdfBuffer).then((result) => {
          return (result.secure_url)
        }).catch((err) => {
          console.log(err);
        });
        console.log('Document :', teamData.TeamMembers[index].Document);
      }
    }
    // this array will have the ids of users added in this team and will be populated on getting, user will be  added in users model;
    const membersIds = await Promise.all(
      teamData.TeamMembers.map(async (member) => {
        try {
          const addedUser = new TeamMember({ ...member });
          // const emailBody = template.body
          //   .replace('{{name}}', member.Name)
          //   .replace('{{username}}', member.UserName)
          //   .replace('{{password}}', member.Password);
          // const mailOptions = {
          //   from: process.env.email, // Sender email address
          //   to: member.Email, // Recipient's email address
          //   subject: template.subject,
          //   text: emailBody,
          // };
          // transporter.sendMail(mailOptions, async function (error, info) {
          //   if (error) {
          //     console.error('Error sending email:', error);
          //   } else {
          //     console.log('Email sent: ' + info.response);
              await addedUser.save().then(() => {
                console.log('userAdded');
              })
          //   }
          // });
          return addedUser._id;
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: 'Error creating HACCP Team document', error: error.message });
        }
      })
    );
    console.log(membersIds);
    // teamData.TeamMembers = membersIds;
    await HaccpTeam.findByIdAndUpdate(createdTeam._id, { TeamMembers: membersIds }, { new: true }).then(() => {
      res.status(200).json({ status: true, message: "HACCP Team document created successfully", data: createdTeam });
    })
    // const createdTeam = new HaccpTeam({
    //   ...teamData,
    //   UserDepartment: requestUser.Department._id,
    //   CreatedBy: createdBy,
    //   CreationDate: new Date()
    // });
    // await createdTeam.save().then(() => {
    //   res.status(200).json({ status: true, message: "HACCP Team document created successfully", data: createdTeam });
    // })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating HACCP Team document', error: error.message });
  }
});

// * Get all HACCP Team documents
router.get('/get-all-haccp-teams', async (req, res) => {
  try {
    const teams = await HaccpTeam.find({ UserDepartment: req.header('Authorization') }).populate('Department').populate({
      path: 'UserDepartment',
      model: 'Department'
    }).populate({
      path: 'TeamMembers',
      model: 'haccpTeamMember',
    });
    if (!teams) {
      console.log('HACCP Team documents not found');
      return res.status(404).json({ message: 'HACCP Team documents not found' });
    }
    console.log('HACCP Team documents retrieved successfully');
    res.status(200).json({ status: true, data: teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting HACCP Team documents', error: error.message });
  }
});

router.get('/get-approved-haccp-teams', async (req, res) => {
  try {
    const teams = await HaccpTeam.find({ UserDepartment: req.header('Authorization'), Status: 'Approved' }).populate('Department').populate({
      path: 'UserDepartment',
      model: 'Department'
    }).populate({
      path: 'TeamMembers',
      model: 'haccpTeamMember'
    });
    if (!teams) {
      console.log('HACCP Team documents not found');
      return res.status(404).json({ message: 'HACCP Team documents not found' });
    }
    console.log('HACCP Team documents retrieved successfully');
    res.status(200).json({ status: true, data: teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting HACCP Team documents', error: error.message });
  }
});

// * Get a HACCP Team document by ID
router.get('/get-haccp-team/:teamId', async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const team = await HaccpTeam.findById(teamId).populate('UserDepartment').populate('Department').populate({
      path: 'TeamMembers',
      model: 'haccpTeamMember'
    });
    if (!team) {
      console.log(`HACCP Team document with ID: ${teamId} not found`);
      return res.status(404).json({ message: `HACCP Team document with ID: ${teamId} not found` });
    }
    console.log(`HACCP Team document with ID: ${teamId} retrieved successfully`);
    res.status(200).json({ status: true, data: team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting HACCP Team document', error: error.message });
  }
});

// * Delete a HACCP Team document by ID
router.delete('/delete-haccp-team/:teamId', async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const deletedTeam = await HaccpTeam.findByIdAndDelete(teamId);
    if (!deletedTeam) {
      console.log(`HACCP Team document with ID: ${teamId} not found`);
      return res.status(404).json({ message: `HACCP Team document with ID: ${teamId} not found` });
    }
    console.log(deletedTeam);
    deletedTeam.TeamMembers.forEach(async (memberId) => {
      await UserModel.findByIdAndDelete(memberId)
    })
    console.log(`HACCP Team document with ID: ${teamId} deleted successfully`);
    res.status(200).json({ status: true, message: 'HACCP Team document deleted successfully', data: deletedTeam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting HACCP Team document', error: error.message });
  }
});

// * Delete all HACCP Team documents
router.delete('/delete-all-haccp-teams', async (req, res) => {
  try {

    const result = await HaccpTeam.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).send({ status: false, message: "No HACCP Team documents found to delete!" });
    }

    res.status(200).send({ status: true, message: "All HACCP Team documents have been deleted!", data: result });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE All HACCP Team documents Successfully!');

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

// * Update a HACCP Team document by ID
router.patch('/update-haccp-team/:teamId', upload.fields(generateMembersDocArray()), async (req, res) => {
  console.log(req.files);
  try {
    const teamId = req.params.teamId;
    // The HACCP Team data sent in the request body
    console.log(req.body);
    const teamData = JSON.parse(req.body.Data);
    const filesObj = req.files;
    const requestUser = await user.findById(req.header('Authorization')).populate('Company Department');

    // Retrieve the existing team document
    const existingTeam = await HaccpTeam.findById(teamId);

    if (!existingTeam) {
      console.log(`HACCP Team document with ID: ${teamId} not found`);
      return res.status(401).json({ message: `HACCP Team document with ID: ${teamId} not found` });
    }



    if (filesObj && Object.keys(filesObj).length !== 0) {
      // If there are uploaded files, process each one
      for (const key in filesObj) {
        const fileData = filesObj[key][0];
        const index = fileData.fieldname.split('-')[1];

        try {
          const response = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
          const pdfDoc = await PDFDocument.load(fileData.buffer);
          const logoImage = Buffer.from(response.data);
          const isJpg = requestUser.Company.CompanyLogo.includes('.jpeg') || requestUser.Company.CompanyLogo.includes('.jpg');
          const isPng = requestUser.Company.CompanyLogo.includes('.png');
          let pdfLogoImage;
          if (isJpg) {
            pdfLogoImage = await pdfDoc.embedJpg(logoImage);
          } else if (isPng) {
            pdfLogoImage = await pdfDoc.embedPng(logoImage);
          }
          const firstPage = pdfDoc.insertPage(0);
          addFirstPage(firstPage, pdfLogoImage, requestUser.Company, requestUser, existingTeam.DocumentId, existingTeam.RevisionNo + 1);
          const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
          pdfDoc.getPages().slice(1).forEach(async (page) => {
            const { width, height } = page.getSize();
          const extraSpace = 24; // Increase this value for more space at the top
          // Resize the page to add extra space at the top
          page.setSize(width, height + extraSpace);
          // Move the original content down
          page.translateContent(0, -extraSpace);
          // Now add your custom text at the top
          const watermarkText = 'HACCP Team Member Document';
          const watermarkFontSize = 15;
          const watermarkTextWidth = helveticaFont.widthOfTextAtSize(watermarkText, watermarkFontSize);
          const centerWatermarkX = width / 2 - watermarkTextWidth / 2;
          const centerWatermarkY = height + extraSpace - 10; // Place in new space
          page.drawText(watermarkText, {
            x: centerWatermarkX,
            y: centerWatermarkY,
            size: watermarkFontSize,
            color: rgb(0, 0, 0)
          });
          const companyText = `${requestUser.Company.CompanyName}`;
          const companyTextFontSize = 10;
          const companyTextWidth = helveticaFont.widthOfTextAtSize(companyText, companyTextFontSize);
          const centerCompanyTextX = width - companyTextWidth - 20;
          const centerCompanyTextY = height + extraSpace; // Place in new space
          page.drawText(companyText, {
            x: centerCompanyTextX,
            y: centerCompanyTextY,
            size: companyTextFontSize,
            color: rgb(0, 0, 0)
          });
          const dateText = `Document ID : ${existingTeam.DocumentId}`;
          const dateTextFontSize = 10;
          const dateTextWidth = helveticaFont.widthOfTextAtSize(dateText, dateTextFontSize);
          const centerDateTextX = width - dateTextWidth - 20;
          const centerDateTextY = height + extraSpace - 12; // Place in new space
          page.drawText(dateText, {
            x: centerDateTextX,
            y: centerDateTextY,
            size: dateTextFontSize,
            color: rgb(0, 0, 0)
          });

          const revisionNoText = `Revision No : ${existingTeam.RevisionNo + 1}`;
          const revisionNoTextFontSize = 10;
          const revisionNoTextWidth = helveticaFont.widthOfTextAtSize(revisionNoText, revisionNoTextFontSize);
          const centerRevisionNoTextX = width - revisionNoTextWidth - 20;
          const centerRevisionNoTextY = height + extraSpace - 24; // Place in new space

          page.drawText(revisionNoText, {
              x: centerRevisionNoTextX,
              y: centerRevisionNoTextY,
              size: revisionNoTextFontSize,
              color: rgb(0, 0, 0)
          });
          });
          // Save the modified PDF
          const modifiedPdfBuffer = await pdfDoc.save();

          const cloudinaryResult = await uploadToCloudinary(modifiedPdfBuffer);
          const secureUrl = cloudinaryResult.secure_url;
          // Update the Document property of the corresponding team member
          teamData.TeamMembers[index].Document = secureUrl;
          console.log('Document:', teamData.TeamMembers[index].Document);
        } catch (err) {
          console.error('Error uploading file:', err);
        }
      }
    }

    // this array will have the ids of users added in this team and will be populated on getting, user will be  added in users model;
    const membersIds = await Promise.all(
      teamData.TeamMembers.map(async (member) => {
        try {
          let updateduser;
          if (member._id) {
            updateduser = await haccpTeamMember.findByIdAndUpdate(member._id, { ...member, 
              // Password: CryptoJS.AES.encrypt(member.Password, process.env.PASS_CODE).toString()
             })
          } else {
            const { _id, ...user } = member
            updateduser = new haccpTeamMember({ ...user
              //  Password: CryptoJS.AES.encrypt(user.Password, process.env.PASS_CODE).toString()
             });
            await updateduser.save();
          }
          console.log(updateduser);
          // const emailBody = template.body
          //   .replace('{{name}}', member.Name)
          //   .replace('{{username}}', member.UserName)
          //   .replace('{{password}}', member.Password);
          // const mailOptions = {
          //   from: process.env.email, // Sender email address
          //   to: member.Email, // Recipient's email address
          //   subject: template.subject,
          //   text: emailBody,
          // };

          // transporter.sendMail(mailOptions, async function (error, info) {
          //   if (error) {
          //     console.error('Error sending email:', error);
          //   } else {
          //     console.log('Email sent: ' + info.response);
          //   }
          // });
          return (updateduser._id);
        } catch (error) {
          console.log(error);
          // res.status(500).json({ message: 'Error creating HACCP Team document', error: error.message });
        }
      })
    );

    teamData.RevisionNo = existingTeam.RevisionNo + 1;
    // Update the team document
    const updatedTeam = await HaccpTeam.findByIdAndUpdate(
      teamId,
      {
        $set: {
          ...teamData,
          UpdatedBy: requestUser.Name,
          UpdationDate: new Date(),
          Status: 'Pending',
          ApprovalDate: null,
          ApprovedBy: null,
          DisapprovalDate: null,
          DisapprovedBy: null,
          Reason: null,
          TeamMembers: membersIds
        }
      },
      { new: true }
    );

    console.log('Saved', updatedTeam);
    console.log(`HACCP Team document with ID: ${teamId} updated successfully`);
    res.status(200).json({ status: true, message: 'HACCP Team document updated successfully', data: updatedTeam });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating HACCP Team document', error: error.message });
  }
});

// * Approve HaccpTeam From MongooDB Database
router.patch('/approveHaccpTeam', async (req, res) => {
  try {

    const approvedBy = req.body.approvedBy
    const HaccpTeamId = req.body.id;

    // Find the HaccpTeam by ID
    const haccpTeam = await HaccpTeam.findById(HaccpTeamId);

    // If haccpTeam not found
    if (!haccpTeam) {
      console.error(`HaccpTeam with ID: ${HaccpTeamId} not found.`);
      return res.status(404).json({ error: 'HaccpTeam not found.' });
    }

    // If the HaccpTeam is already accepted
    if (haccpTeam.Status === 'Approved') {
      console.warn(`HaccpTeam with ID: ${HaccpTeamId} is already marked as 'Approved'.`);
      return res.status(400).json({ error: 'HaccpTeam is already approved.' });
    }

    // Update the HaccpTeam's fields
    haccpTeam.ApprovalDate = new Date();
    haccpTeam.Status = 'Approved';
    haccpTeam.ApprovedBy = approvedBy
    haccpTeam.DisapprovalDate = null;
    haccpTeam.DisapprovedBy = null;
    haccpTeam.Reason = null;

    await HaccpTeam.findByIdAndUpdate(
      haccpTeam._id,
      haccpTeam,
      { new: true }
    );
    // Save the updated HaccpTeam
    // await haccpTeam.save();

    // Log successful update
    console.log(`HaccpTeam with ID: ${HaccpTeamId} has been approved.`);
    res.status(200).send({ status: true, message: 'The HaccpTeam has been marked as approved.', data: haccpTeam });

  } catch (error) {
    console.error('Error while approving request:', error);
    res.status(500).json({ error: 'Failed to approve request', message: error.message });
  }
});

// * Disapprove HaccpTeam From MongooDB Database
router.patch('/disapproveHaccpTeam', async (req, res) => {
  try {

    const disapproveBy = req.body.disapprovedBy
    const HaccpTeamId = req.body.id;
    const Reason = req.body.Reason;

    // Find the HaccpTeam by ID
    const haccpTeam = await HaccpTeam.findById(HaccpTeamId);

    // If HaccpTeam not found
    if (!haccpTeam) {
      console.error(`HaccpTeam with ID: ${HaccpTeamId} not found.`);
      return res.status(404).json({ error: 'HaccpTeam not found.' });
    }

    // If the HaccpTeam is already approved
    if (haccpTeam.Status === 'Approved') {
      console.warn(`HaccpTeam with ID: ${HaccpTeamId} is already marked as 'Approved'.`);
      return res.status(400).json({ error: 'HaccpTeam is already approved.' });
    }

    // Update the haccpTeam's fields
    haccpTeam.DisapprovalDate = new Date();  // Set end time to current time
    haccpTeam.Status = 'Disapproved';
    haccpTeam.Reason = Reason;
    haccpTeam.DisapprovedBy = disapproveBy;
    haccpTeam.ApprovalDate = null;
    haccpTeam.ApprovedBy = null

    await HaccpTeam.findByIdAndUpdate(
      haccpTeam._id,
      haccpTeam,
      { new: true }
    );
    // Save the updated HaccpTeam
    // await haccpTeam.save();

    // Log successful update
    console.log(`HaccpTeam with ID: ${HaccpTeamId} has been disapproved.`);
    res.status(200).send({ status: true, message: 'The HaccpTeam has been marked as disapproved.', data: haccpTeam });

  } catch (error) {
    console.error('Error while disapproving HaccpTeam:', error);
    res.status(500).json({ error: 'Failed to disapprove HaccpTeam', message: error.message });
  }
});

// * Assign Tabs To HaccpTeam document by ID
router.patch('/haccpTeam/assign-tabs/:haccpTeamId', async (req, res) => {
  try {
    const haccpTeamId = req.params.haccpTeamId;
    const updatedHaccpTeam = await HaccpTeam.findById(haccpTeamId);

    if (!updatedHaccpTeam) {
      console.log(`HaccpTeam document with ID: ${haccpTeamId} not found`);
      return res.status(404).json({ message: `HaccpTeam document with ID: ${haccpTeamId} not found` });
    }

    // Assuming req.body.Tabs is an array of tab objects
    updatedHaccpTeam.Tabs = req.body.Tabs;
    await HaccpTeam.findByIdAndUpdate(
      updatedHaccpTeam._id,
      updatedHaccpTeam,
      { new: true }
    );
    // await updatedHaccpTeam.save();

    console.log(`HaccpTeam document with ID: ${haccpTeamId} updated successfully`);
    res.status(200).json({ status: true, message: 'HaccpTeam document updated successfully', data: updatedHaccpTeam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating HaccpTeam document', error: error.message });
  }
});



module.exports = router;