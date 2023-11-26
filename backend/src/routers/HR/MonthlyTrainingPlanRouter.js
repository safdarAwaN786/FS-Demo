const express = require('express');
const MonthlyPlan = require('../../models/HR/MonthlyTrainingPlanModel');
const YearlyTrainingPlan = require('../../models/HR/YearlyTrainingPlanModel')
const User = require('../../models/AccountCreation/UserModel');
const Training = require('../../models/HR/TrainingModel');
const router = new express.Router();
require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const authMiddleware = require('../../middleware/auth');


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
    console.log('error inside uploadation' + error);
  }
};

// * POST Monthly Plan Data Into MongoDB Database
router.post('/addMonthlyPlan', async (req, res) => {
  console.log(req.body);
  try {

    const trainerExist = await User.findById(req.body.Trainer);
    const trainingExist = await Training.findById(req.body.Training);
    const yearlyPlan = await YearlyTrainingPlan.findOne({ Year: req.body.Year });

    if (!yearlyPlan) {
      return res.status(404).send({
        status: false,
        message: `This Year ${req.body.Year} is not exist`
      });
    }

    const selectedMonth = req.body.Month;
    const monthExists = yearlyPlan.Month.some(month => month.MonthName === selectedMonth);

    if (!monthExists) {
      return res.status(404).send({
        status: false,
        message: `The selected month ${selectedMonth} does not exist in the yearly plan for ${req.body.Year}`
      });
    }

    // const trainingsForMonth = await yearlyPlan.getMonthlyTrainings(req.body.Year, selectedMonth);

    console.log('prechecks');

    if (!trainerExist || !trainingExist) {
      const errorMessage = [];
      if (!trainerExist) {
        errorMessage.push("Trainer not found");
      }
      if (!trainingExist) {
        errorMessage.push("Training not found");
      }
      if (!trainingsForMonth) {
        errorMessage.push("Trainings for the selected month not found");
      }
      return res.status(404).send({
        status: false,
        message: errorMessage.join(" and "),
      });
    }
    console.log('pre saving');

    const createdBy = req.user.Name;
    const monthlyPlan = new MonthlyPlan({
      ...req.body,
      User: req.user._id,
      CreatedBy: createdBy,
      CreationDate: new Date()
    });
    await monthlyPlan.save();

    console.log(new Date().toLocaleString() + ' ' + 'Loading MonthlyPlan...');
    res.status(200).send({ Status: true, message: "The MonthlyPlan is added!", data: monthlyPlan });
    console.log(new Date().toLocaleString() + ' ' + 'ADD MonthlyPlan Successfully!');

  } catch (e) {
    console.log(e);
    res.status(400).json({ message: e.message });
  }
});

// * GET All MonthlyPlan Data From MongooDB Database
router.get('/readMonthlyPlan', async (req, res) => {
  try {

    const monthlyPlan = await MonthlyPlan.find().populate("Training Trainer Employee YearlyTrainingPlan User");

    const monthlyPlansToSend = monthlyPlan.filter((Obj) => {
      if (Obj.User.Department.equals(req.user.Department)) {
        console.log('got Equal');
        return Obj
      }
    });


    res.status(201).send({ status: true, message: "The Following are Monthlyplans!", data: monthlyPlansToSend, });
    console.log(new Date().toLocaleString() + ' ' + 'GET MonthlyPlans Successfully!')

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});

// * PATCH Assign Employee ID to MonthlyPlan in MongoDB Database
router.patch('/assignEmployee', async (req, res) => {
  const employeeIds = req.body.employeeIds;
  const monthlyId = req.body.monthlyId;
  const assignedBy = req.user.Name;
  console.log('request to assign employees to plan');
  try {
    const monthlyPlan = await MonthlyPlan.findOne({ _id: monthlyId });

    if (!monthlyPlan) {
      return res.status(404).send({ status: false, message: `${monthlyId} MonthlyPlan not found!` });
    }

    if (!Array.isArray(employeeIds)) {
      return res.status(400).send({ status: false, message: 'Employee IDs should be provided as an array!' });
    }

    const employees = await User.find({ _id: { $in: employeeIds } });
    
    const foundEmployeeIds = employees.map((employee) => employee._id.toString());
   
    const notFoundEmployeeIds = employeeIds.filter((id) => !foundEmployeeIds.includes(id));

    let message = '';

    if (notFoundEmployeeIds.length > 0) {
      message += `Employee ID not found: ${notFoundEmployeeIds.join(', ')}. `;
    }

    const alreadyAssignedEmployees = monthlyPlan.Employee.filter((employee) =>
      foundEmployeeIds.includes(employee.EmployeeId.toString())
    );

    if (alreadyAssignedEmployees.length > 0) {
      message += `Already assigned employees: ${alreadyAssignedEmployees
        .map((employee) => employee.EmployeeId)
        .join(', ')}. `;
    }
    console.log(monthlyPlan.Employee);
    const newEmployeeIds = foundEmployeeIds.filter((id) => !monthlyPlan.Employee.includes(id));
    console.log(newEmployeeIds);
    if (newEmployeeIds.length > 0) {
      // Update Employee schema for newly assigned employees
      await User.updateMany({ _id: { $in: newEmployeeIds } }, { $set: { Assigned: true } });

      // Assign employees to MonthlyPlan
      newEmployeeIds.forEach((employeeId) => {
        monthlyPlan.Employee.push(employeeId);
      });

      monthlyPlan.Assigned = true;
      console.log(monthlyPlan);
      await monthlyPlan.save();
      message += `Employees assigned successfully: ${newEmployeeIds.join(', ')}. `;
    }

    if (message === '') {
      message = 'No new employees to assign.';
    }
    res.status(200).send({ status: true, message: message });
  } catch (e) {
    console.log(e);
    res.status(400).send({ status: false, message: e.message });
  }
});

// * Update the Status when Training is Conducted into MongoDB Database
router.patch('/update-training-status', async (req, res) => {
  try {

    const dataArr = req.body;
    console.log(dataArr);

    for (let index = 0; index < dataArr.length; index++) {
      const employeeId = dataArr[index].EmployeeId;
      const monthlyId = dataArr[index].trainingId;
      console.log(dataArr[index]);

      // Check if the Employee ID is found
      const employee = await User.findById(employeeId);
      if (!employee) {
        throw new Error('Employee ID not found');
      } else {

        // Check if the MonthlyPlan ID is found
        const monthlyPlan = await MonthlyPlan.findById(monthlyId);
        if (!monthlyPlan) {
          throw new Error('MonthlyPlan ID not found');
        } else {
          console.log("plan found");
        }

        const employeeData = employee.EmployeeData;
        function hasId(array, id) {
          for (const obj of array) {
            if (obj.Training.toString() === id.toString()) {
              return true;
            }
          }
          return false;
        }

        const existObj = hasId(employeeData, dataArr[index].trainingId)
        console.log(existObj);
        console.log(req.body[index].trainingId);
        if (existObj) {
          for (let dataIndex = 0; dataIndex < employeeData.length; dataIndex++) {
            console.log(employeeData[dataIndex].Training.toString());
            if (employeeData[dataIndex].Training.toString() === dataArr[index].trainingId) {
              employeeData[dataIndex].Marks = dataArr[index].Marks;
              employeeData[dataIndex].IsPass = dataArr[index].IsPass;
              employeeData[dataIndex].IsPresent = dataArr[index].IsPresent;
              employeeData[dataIndex].Remarks = dataArr[index].Remarks;
              employeeData[dataIndex].EmployeeResultStatus = "Active"
              if (dataArr[index].IsPass === true) {
                employee.TrainingStatus = "Trained"
              }
              if (monthlyPlan) {
                monthlyPlan.TrainingResultStatus = "Conducted";
                monthlyPlan.ActualDate = new Date();
              }
            }
          }
        } else {
          employeeData.push({
            Training: dataArr[index].trainingId,
            EmployeeResultStatus: "Active",
            Marks: dataArr[index].Marks,
            Remarks: dataArr[index].Remarks,
            IsPresent: dataArr[index].IsPresent,
            IsPass: dataArr[index].IsPass
          });

          if (monthlyPlan) {
            monthlyPlan.TrainingResultStatus = "Conducted";
            monthlyPlan.ActualDate = new Date();
          }

          if (dataArr[index].IsPass === true) {
            employee.TrainingStatus = "Trained"
          }
        }
        await monthlyPlan.save()
        await employee.save().then(() => {
        })
      }
    }
    res.status(200).send({ status: true, message: "Success" });

  } catch (error) {
    res.status(400).send({ message: error.message });
  }
})

// * Upload the images in mothlyplan 
router.patch('/upload-images', upload.array("Images"), async (req, res) => {
  try {

    console.log(req.body);
    console.log(req.files);
    const monthlyPlan = await MonthlyPlan.findById(req.body.planId);

    if (monthlyPlan) {
      let imagesLinksArr;
      for (let index = 0; index < req.files['Images'].length; index++) {
        const imageLink = await uploadToCloudinary(req.files['Images'][index].buffer).then((result) => {
          return result.secure_url;
        }).catch((err) => {
          console.log(err)
        });
        imagesLinksArr.push(imageLink);
      }

      console.log(imagesLinksArr);
      monthlyPlan.Images = imagesLinksArr;

      await monthlyPlan.save().then(() => {
        res.status(200).send({ status: true, message: "Success" });
      })

    } else {
      throw new Error('MonthlyPlan ID not found');
    }

  } catch (error) {
    res.status(400).send({ message: error.message })
  }
})

// * DELETE MonthlyPlan Data By Id From MongooDB Database
router.delete('/deleteMonthlyPlan/:id', async (req, res) => {
  try {

    const monthlyPlan = await MonthlyPlan.findOneAndDelete({ _id: req.params.id })
    console.log(new Date().toLocaleString() + ' ' + 'Checking MonthlyPlans...')

    if (!monthlyPlan) {
      res.status(404).send({ status: false, message: "This MonthlyPlan is Not found!" })
    }

    res.status(201).send({ status: true, message: "The Following MonthlyPlan has been Deleted!", data: monthlyPlan });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE MonthlyPlan Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
})

// * DELETE All MonthlyPlan Data From MongooDB Database
router.delete('/deleteAllMonthlyPlans', async (req, res) => {
  try {

    const monthlyPlan = await MonthlyPlan.deleteMany({});
    console.log(new Date().toLocaleString() + ' ' + 'Checking MonthlyPlans...');

    if (monthlyPlan.deletedCount === 0) {
      res.status(404).send({ status: false, message: "No MonthlyPlans Found to Delete!" });
    }

    res.status(201).send({ status: true, message: "All monthlyPlans have been deleted!", data: monthlyPlan });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE MonthlyPlans Successfully!');

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router