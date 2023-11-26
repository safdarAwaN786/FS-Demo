const express = require('express')
const cors = require('cors');
const axios = require('axios');
const mime = require('mime-types');
const app = express();
require('./src/db/connectdb')
const path = require('path')
const employeeRouter = require('./src/routers/HR/EmployeeRouter')
const monthlyPlanRouter = require('./src/routers/HR/MonthlyTrainingPlanRouter')
const yearlyPlanRouter = require('./src/routers/HR/YearlyTrainingPlanRouter')
const trainingRouter = require('./src/routers/HR/TrainingRouter')
const trainerRouter = require('./src/routers/HR/TrainerRouter')
const personalRecuisitionRouter = require('./src/routers/HR/PersonalRecuisitionRouter')
const supplierRouter = require('./src/routers/HR/SupplierRouter')
const machineryRouter = require('./src/routers/Tech/MachineryRouter')
const equipmentRouter = require('./src/routers/Tech/EquipmentRouter')
const calibrationRouter = require('./src/routers/Tech/CalibrationRecordRouter')
const maintainceRouter = require('./src/routers/Tech/PreventiveMaintainanceRouter')
const workrequestRouter = require('./src/routers/Tech/MaintenanceWorkRequestRouter');

const listOfDocumentRouter = require('./src/routers/Admin/ListOfDocumentsRouter');
const changeRequestRouter = require('./src/routers/Admin/ChangeRequestRouter');
const listOfFormRouter = require('./src/routers/Admin/ListOfFormsRouter');
const formRecordRouter = require('./src/routers/Admin/FormRecordsRouter');
const uploadDocRouter = require('./src/routers/Admin/UploadDocumentRouter')

const internalAuditorRouter = require('./src/routers/InternalAudit/InternalAuditorRouter')
const monthlyAuditingPlanRouter = require('./src/routers/InternalAudit/MonthlyAuditingPlanRouter')
const processOwnerRouter = require('./src/routers/InternalAudit/ProcessOwnerRouter')
const YearlyAuditingPlanRouter = require('./src/routers/InternalAudit/YearlyAuditingPlanRouter')

const conductAuditRouter = require('./src/routers/Auditor/ConductAuditsRouter')
const correctiveActionRouter = require('./src/routers/Auditor/CorrectiveActionRouter')
const createCheclistRouter = require('./src/routers/Auditor/CreateChecklistRouter')
const reportsRouter = require('./src/routers/Auditor/ReportsRouter')

const mrmRouter = require('./src/routers/ManagementRev/MRMRouter')
const notificationRouter = require('./src/routers/ManagementRev/NotificationRouter')
const participantsRouter = require('./src/routers/ManagementRev/ParticipantsRouter')

const conductHaccpRouter = require('./src/routers/HACCP/ConductHaccpRouter')
const decisionTreeRouter = require('./src/routers/HACCP/DecisionTreeRouter')
const foodSafetyPlanRouter = require('./src/routers/HACCP/FoodSafetyPlanRouter')
const haccpTeamRouter = require('./src/routers/HACCP/HaccpTeamRouter')
const processesRouter = require('./src/routers/HACCP/ProcessesRouter')
const productRouter = require('./src/routers/HACCP/ProductRouter')

const companyRouter = require('./src/routers/AccountCreation/CompanyRouter')
const departmentRouter = require('./src/routers/AccountCreation/DepartmentRouter')
const userRouter = require('./src/routers/AccountCreation/UserRouter')

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});


// Initialize session middleware
// app.use(session({
//   secret: '159abr',
//   resave: false,
//   saveUninitialized: false,
// }));



// * Connecting To Port
const port = process.env.PORT || 1126;
app.use(cors());

// * Automatically parse incoming JSON to an object so we access it in our request handlers
app.use(express.json())
// app.use(express.json());

app.use(express.urlencoded({extended: false}))
  
// Set CORS headers manually
// Add middleware to set CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET','POST','OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
  

app.use(employeeRouter);
app.use(monthlyPlanRouter);
app.use(yearlyPlanRouter);
app.use(trainingRouter);
app.use(trainerRouter);
app.use(personalRecuisitionRouter);
app.use(supplierRouter)

app.use(machineryRouter);
app.use(equipmentRouter)
app.use(calibrationRouter)
app.use(maintainceRouter)
app.use(workrequestRouter)

app.use(listOfDocumentRouter)
app.use(changeRequestRouter)
app.use(listOfFormRouter)
app.use(formRecordRouter)
app.use(uploadDocRouter)

app.use(internalAuditorRouter)
app.use(monthlyAuditingPlanRouter)
app.use(processOwnerRouter)
app.use(YearlyAuditingPlanRouter)

app.use(conductAuditRouter)
app.use(correctiveActionRouter)
app.use(createCheclistRouter)
app.use(reportsRouter)

app.use(mrmRouter)
app.use(notificationRouter)
app.use(participantsRouter)

app.use(conductHaccpRouter)
app.use(decisionTreeRouter)
app.use(foodSafetyPlanRouter)
app.use(haccpTeamRouter)
app.use(processesRouter)
app.use(productRouter)

app.use(companyRouter)
app.use(departmentRouter)
app.use(userRouter)

app.get('/download-image', async (req, res) => {
  console.log('Downloading file');
  try {
    const imageURL = req.query.url;

    // Extract the file extension from the imageURL
    const fileExtension = imageURL.substring(imageURL.lastIndexOf('.'));

    //  // Extract the public ID from the imageURL (the part after the last '/')
    // //  const publicID = imageURL.substring(imageURL.lastIndexOf('/') + 1, imageURL.lastIndexOf('.'));

    // Download the image data from Cloudinary using the SDK
    // const imageResponse = await cloudinary.api.download(publicID);
    // const imageBuffer = Buffer.from(imageResponse.data, 'binary');
    var imageResponse;
    var imageBuffer;


    if (fileExtension !== '.pdf') {
      
      
      // Fetch the image data from the provided URL
       imageResponse = await axios.get(imageURL, { responseType: 'arraybuffer' });
       imageBuffer = Buffer.from(imageResponse.data, 'binary');
    } else {
       imageResponse = await axios.get(imageURL);
      imageBuffer = Buffer.from(imageResponse.data, 'binary');
    }

    // Set the appropriate Content-Disposition header for download with the correct file extension
    res.setHeader('Content-Disposition', `attachment; filename="your_desired_filename${fileExtension}"`);

    // Send the image data as a response
    res.send(imageBuffer);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Error downloading the image.');
  }
});

// * listening To Port
app.listen(port, () => {
    console.log(`This is the ${port} active port! Wait for DB Connection...`);
});
