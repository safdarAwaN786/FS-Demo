const express = require('express');
const router = express.Router();
const Calibration = require('../../models/Tech/CalibrationRecordModel');
const Equipment = require('../../models/Tech/EquipmentModel');
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer();
const { rgb, degrees, PDFDocument, StandardFonts } = require('pdf-lib');
// router.use(authMiddleware);
const axios = require('axios');
const User = require('../../models/AccountCreation/UserModel');

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});
const formatDate = (date) => {

  const newDate = new Date(date);
  const formatDate = newDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return formatDate;
}
// Function to add the company logo and information to the first page
const addFirstPage = async (page, logoImage, Company, user) => {
  const { width, height } = page.getSize();

  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const logoDims = { width: 300, height: 300 };
  const centerTextX = width / 2;

  // Function to wrap text to fit within a specific width
  const wrapText = (text, maxWidth, font, fontSize) => {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testLineWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Draw company logo
  page.drawImage(logoImage, { 
    x: centerTextX - logoDims.width / 2, 
    y: height - 400, 
    width: logoDims.width, 
    height: logoDims.height 
  });

  // Add company name
  const fontSize = 25;
  const maxWidth = width - 100; // Allow some padding
  const companyNameText = Company.CompanyName;
  page.drawText(companyNameText, { 
    x: centerTextX - helveticaFont.widthOfTextAtSize(companyNameText, fontSize) / 2, 
    y: height - 420, 
    color: rgb(0, 0, 0), 
    fontSize 
  });

  // Add company contact
  const companyContactText = `Contact # ${Company.PhoneNo}`;
  page.drawText(companyContactText, { 
    x: centerTextX - helveticaFont.widthOfTextAtSize(companyContactText, fontSize) / 2, 
    y: height - 450, 
    color: rgb(0, 0, 0), 
    fontSize 
  });

  // Add company email
  const companyEmailText = `${Company.Email}`;
  page.drawText(companyEmailText, { 
    x: centerTextX - helveticaFont.widthOfTextAtSize(companyEmailText, fontSize) / 2, 
    y: height - 480, 
    color: rgb(0, 0, 0), 
    fontSize 
  });

  // Add wrapped company address
  const companyAddressText = `${Company.Address}`;
  const wrappedAddress = wrapText(companyAddressText, maxWidth, helveticaFont, fontSize);
  let yPosition = height - 510;
  for (const line of wrappedAddress) {
    page.drawText(line, { 
      x: centerTextX - helveticaFont.widthOfTextAtSize(line, fontSize) / 2, 
      y: yPosition, 
      color: rgb(0, 0, 0), 
      fontSize 
    });
    yPosition -= 30; // Adjust line spacing
  }

  // Add uploaded by and date
  const uploadByText = `Uploaded By : ${user.Name}`;
  page.drawText(uploadByText, { 
    x: centerTextX - helveticaFont.widthOfTextAtSize(uploadByText, 20) / 2, 
    y: yPosition - 50, 
    color: rgb(0, 0, 0), 
    size: 20 
  });

  const uploadDateText = `Uploaded Date : ${formatDate(new Date())}`;
  page.drawText(uploadDateText, { 
    x: centerTextX - helveticaFont.widthOfTextAtSize(uploadDateText, 20) / 2, 
    y: yPosition - 80, 
    color: rgb(0, 0, 0), 
    size: 20 
  });
};

const uploadToCloudinaryImg = (buffer) => {
  try {

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
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
    console.log('from inside of function' + error);
  }
};

// * POST route to add a Calibration Record
router.post('/addCalibration/:EquipmentId', upload.fields([{ name: 'Image' }, { name: 'exCertificate' }, { name: 'masterCertificate' }, { name: 'Certificate' }]), async (req, res) => {
  console.log(req.body);
  console.log(req.files);
  try {

    const requestUser = await User.findById(req.header('Authorization')).populate('Company')
    const EquipmentId = req.params.EquipmentId;
    const caliberateBy = requestUser.Name;

    if (!EquipmentId) {
      return res.status(404).json({ error: 'Please Provide Machine ID' });
    }

    // Get the Equipment by ID
    const equipment = await Equipment.findById(EquipmentId);

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    let ImageURL = '';
    let CertificateURL = '';
    let exCertificateURL = '';
    let masterCertificateURL = '';

    if (req.files['Image']) {
      // Get the file buffers of the uploaded image and document
      const imageBuffer = req.files['Image'][0].buffer;

      // Upload the image buffer to Cloudinary and obtain the URL
      ImageURL = await uploadToCloudinaryImg(imageBuffer).then((res) => {
        return res.secure_url;
      }).catch((err) => {
        console.log('from outside of function ' + err);
      });

    }

    if (req.files['Certificate']) {
      const fileBuffers = req.files['Certificate'][0].buffer;

      const response = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
      const pdfDoc = await PDFDocument.load(fileBuffers);
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
      addFirstPage(firstPage, pdfLogoImage, requestUser.Company, requestUser);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      pdfDoc.getPages().slice(1).forEach(async (page) => {
        const extraSpace = 24; // Increase this value for more space at the top
                    // Resize the page to add extra space at the top
                    page.setSize(width, height + extraSpace);
                    // Move the original content down
                    page.translateContent(0, -extraSpace);
                    // Now add your custom text at the top
                    const watermarkText = 'Certificate';
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
                    const dateText = `Upload Date : ${formatDate(new Date())}`;
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
      });
      // Save the modified PDF
      const modifiedPdfBuffer = await pdfDoc.save();

      CertificateURL = await uploadToCloudinaryImg(modifiedPdfBuffer).then((res) => {
        return res.secure_url;
      }).catch((err) => {
        console.log('from outside of function ' + err);
      });
    }

    if (req.files['exCertificate']) {
      const fileBuffers = req.files['exCertificate'][0].buffer;

      const response = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
      const pdfDoc = await PDFDocument.load(fileBuffers);
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
      addFirstPage(firstPage, pdfLogoImage, requestUser.Company, requestUser);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      pdfDoc.getPages().slice(1).forEach(async (page) => {
        const extraSpace = 24; // Increase this value for more space at the top
        // Resize the page to add extra space at the top
        page.setSize(width, height + extraSpace);
        // Move the original content down
        page.translateContent(0, -extraSpace);
        // Now add your custom text at the top
        const watermarkText = 'External Certificate';
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
        const dateText = `Upload Date : ${formatDate(new Date())}`;
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
      });
      // Save the modified PDF
      const modifiedPdfBuffer = await pdfDoc.save();

      exCertificateURL = await uploadToCloudinaryImg(modifiedPdfBuffer).then((res) => {
        return res.secure_url;
      }).catch((err) => {
        console.log('from outside of function ' + err);
      });
    }

    if (req.files['masterCertificate']) {
      const fileBuffers = req.files['exCertificate'][0].buffer;

      const response = await axios.get(requestUser.Company.CompanyLogo, { responseType: 'arraybuffer' });
      const pdfDoc = await PDFDocument.load(fileBuffers);
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
      addFirstPage(firstPage, pdfLogoImage, requestUser.Company, requestUser);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      pdfDoc.getPages().slice(1).forEach(async (page) => {
        const extraSpace = 24; // Increase this value for more space at the top
                    // Resize the page to add extra space at the top
                    page.setSize(width, height + extraSpace);
                    // Move the original content down
                    page.translateContent(0, -extraSpace);
                    // Now add your custom text at the top
                    const watermarkText = 'Master Cerificate';
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
                    const dateText = `Upload Date : ${formatDate(new Date())}`;
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
      });
      // Save the modified PDF
      const modifiedPdfBuffer = await pdfDoc.save();

      masterCertificateURL = await uploadToCloudinaryImg(modifiedPdfBuffer).then((res) => {
        return res.secure_url;
      }).catch((err) => {
        console.log('from outside of function ' + err);
      });
    }

    // Create a new Calibration record
    const calibrationRecord = new Calibration({
      Equipment: EquipmentId,
      lastCallibrationDate: new Date(Date.parse(req.body.lastDate.replace(/^"(.*)"$/, '$1'))),
      nextCallibrationDate: new Date(Date.parse(req.body.nextDate.replace(/^"(.*)"$/, '$1'))),
      CaliberateBy: caliberateBy,
      UserDepartment: requestUser.Department,
      CaliberatDate: new Date(),
      dateType: req.body.dateType,
      callibrationType: req.body.callibrationType,
      CR: req.body.CR,
      comment: req.body.comment,
      measuredReading: {
        firstReading: req.body.firstReading,
        secondReading: req.body.secondReading,
        thirdReading: req.body.thirdReading
      },
      internal: {
        ImageURL,
        CertificateURL,
        masterCertificateURL,
      },
      external: {
        companyName: req.body.companyName,
        masterReference: req.body.masterReference,
        exCertificateURL
      }

    });

    console.log('saving this object' + calibrationRecord);

    // Save the Calibration record
    try {
      await calibrationRecord.save();
      console.log('Calliobration record saved successfully');
      res.status(200).json({ message: 'Callibration record added successfully' });
    } catch (err) {
      console.error('Error while saving the Callibration record: ', err);
      res.status(500).json({ error: 'Server Error' });
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to add Calibration Record', message: error.message });
  }
});

// * GET All Machinery Data From MongooDB Database
router.get('/readAllCalibration', async (req, res) => {
  try {

    const callibration = await Calibration.find({ UserDepartment: req.header('Authorization') }).populate('Equipment').populate('UserDepartment');

  

    res.status(201).send({ status: true, message: "The following are Callibration!", data: callibration });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Callibration', message: error.message });
  }
});

// * GET route to fetch callibration by equipment ID
router.get('/readCalibrationByEquipmentId/:equipmentId', async (req, res) => {
  try {
    
    const equipmentId = req.params.equipmentId;
    if (!equipmentId) {
      return res.status(404).json({ error: 'Please Provide Machine ID' });
    }
    
    const calibration = await Calibration.find({ Equipment: equipmentId, UserDepartment: req.header('Authorization') }).populate('Equipment');
    if (!calibration) {
      return res.status(404).json({ error: 'calibration not found' });
    }
    res.status(201).send({ status: true, message: "The following calibration!", data: calibration });

  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: 'Failed to fetch calibration', message: error.message });
  }
});
module.exports = router;