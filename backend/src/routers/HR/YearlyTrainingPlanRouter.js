const express = require('express');
const YearlyPlan = require('../../models/HR/YearlyTrainingPlanModel')
const router = new express.Router();
const authMiddleware = require('../../middleware/auth');

// router.use(authMiddleware);
// * POST YearlyPlan Data Into MongooDB Database
router.post('/addYearlyPlan', async (req, res) => {
  console.log(req.body);
  try {

    const createdBy = req.body.createdBy;
    const yearlyPlan = await YearlyPlan.findOne({
      UserDepartment: req.header('Authorization'),
      Year: req.body.Year
    });
    console.log('Already Saved Plan', yearlyPlan);


    if (yearlyPlan) {
      for (const month of req.body.Month) {
        const existingMonth = yearlyPlan.Month.find(
          (existingMonth) => existingMonth.MonthName === month.MonthName
        );

        if (!existingMonth) {
          yearlyPlan.Month.push(month);
        } else {
          month.Trainings.forEach(trainingObj => {

            const trainingExist = existingMonth.Trainings.find(obj => obj.Training.equals(trainingObj.Training))
            if (trainingExist) {
              console.log('updating week numbers');
              
              trainingExist.WeekNumbers = trainingObj.WeekNumbers
            } else {
              console.log('pushing new training');
              
              existingMonth.Trainings.push(trainingObj)
            }
          })
        }
      }
      console.log('updatedYearlyPlan', yearlyPlan);

      await yearlyPlan.save();
      res.status(200).send({ status: true, message: "The YearlyPlan is updated!", data: yearlyPlan });
      console.log(new Date().toLocaleString() + ' ' + 'UPDATE YearlyPlan Successfully!');

    } else {
      const newYearlyPlan = new YearlyPlan({
        UserDepartment: req.header('Authorization'),
        Year: req.body.Year,
        Month: req.body.Month,
        CreatedBy: createdBy,
        CreationDate: new Date()
      });
      await newYearlyPlan.save();
      res.status(201).send({ status: true, message: "The YearlyPlan is added!", data: newYearlyPlan });
      console.log(new Date().toLocaleString() + ' ' + 'ADD YearlyPlan Successfully!');
    }

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// * GET All YearlyPlan Data From MongooDB Database
router.get('/readYearlyPlan', async (req, res) => {
  try {
    const yearlyPlan = await YearlyPlan.find({ UserDepartment: req.header('Authorization') }).populate({
      path: 'Month.Trainings.Training'
    }).populate('UserDepartment');

    res.status(201).send({ status: true, message: "The following are yearlyPlans!", data: yearlyPlan, });
    console.log(new Date().toLocaleString() + ' ' + 'GET YearlyPlan Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// * DELETE YearlyPlan Data By Id From MongooDB Database
router.delete('/deleteYearlyPlan/:id', async (req, res) => {
  try {

    const yearlyPlan = await YearlyPlan.findOneAndDelete({ _id: req.params.id })
    console.log(new Date().toLocaleString() + ' ' + 'Checking YearlyPlans...')

    if (!yearlyPlan) {
      res.status(404).send({ status: false, message: "This YearlyPlan is Not found!" })
    }

    res.status(201).send({ status: true, message: "The Following YearlyPlan has beebn Deleted!", data: yearlyPlan });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE YearlyPlan Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
})

// * DELETE All YearlyPlan Data From MongooDB Database
router.delete('/deleteAllYearlyPlans', async (req, res) => {
  try {

    const yearlyPlan = await YearlyPlan.deleteMany({})
    console.log(new Date().toLocaleString() + ' ' + 'Loading YearlyPlans...')

    if (yearlyPlan.deletedCount === 0) {
      res.status(404).send({ status: false, message: "No YearlyPlans Found to Delete!" })
    }

    res.status(201).send({ status: true, message: "All YearlyPlans have been deleted!", data: yearlyPlan });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE YearlyPlans Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
})

module.exports = router