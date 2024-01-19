const express = require('express');
const PersonalRecuisition = require('../../models/HR/PersonalRecuisitionModel');
const authMiddleware = require('../../middleware/auth');
const router = new express.Router();

// router.use(authMiddleware);

// * Post PersonalRecuisition Data Into MongooDB Database
router.post('/addPersonalRecuisition', async (req, res) => {
  console.log(req.body);
  try {

    const requestBy = req.body.addedBy
    const personalRecuisition = new PersonalRecuisition({
      ...req.body,
      RequestBy: requestBy,
      UserDepartment: req.header('Authorization'),
      RequestDate: new Date()
    });

    await personalRecuisition.save().then(console.log("saved")).catch((error) => {
      console.log(error);
    })

    console.log(new Date().toLocaleString() + ' ' + 'Loading Required Person...')
    res.status(201).send({ status: true, message: "The Required Person is Added!", data: personalRecuisition, });
    console.log(new Date().toLocaleString() + ' ' + 'ADD Required Person Successfully!')

  } catch (e) {
    res.status(400).json({ message: e.message })
  }
});

// * GET All Personal Recuisition Data From MongooDB Database
router.get('/readPersonalRecuisition', async (req, res) => {
  try {
    const personalRecuisition = await PersonalRecuisition.find({UserDepartment : req.header('Authorization')}).populate('UserDepartment');
   

    res.status(201).send({ status: true, message: "The following are Required Person!", data: personalRecuisition, });
    console.log(new Date().toLocaleString() + ' ' + 'GET Required Person Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// * Update The Status of Person's Data From Mon MongooDB Database
router.patch('/updatePersonStatus', async (req, res) => {
  try {

    const user = req.body.updatedBy
    const reqPerson = await PersonalRecuisition.findById(req.body.personId)

    if (req.body.status === "Approved") {
      reqPerson.Status = "Approved"
      reqPerson.ApprovedBy = user
      reqPerson.ApprovalDate = new Date()
    } else if (req.body.status === "Disapproved") {
      reqPerson.Status = "Disapproved",
        reqPerson.Reason = req.body.Reason
      reqPerson.DisapprovedBy = user
      reqPerson.DisapprovalDate = new Date()
    }

    await reqPerson.save().then(console.log("Person Status Updated"))
    res.status(200).send("Success")

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
})

// * DELETE All Personal Recuision Data From MongooDB Database
router.delete('/deleteAllPersonalRecuision', async (req, res) => {
  try {

    const personalRecuisition = await PersonalRecuisition.deleteMany({})
    console.log(new Date().toLocaleString() + ' ' + 'Checking PersonalRecuisitions...')

    if (personalRecuisition.deletedCount === 0) {
      res.status(404).send({ status: false, message: "No PersonalRecuisitions Found to Delete!" })
    }

    res.status(201).send({ status: true, message: "All PersonalRecuisitions have been Deleted!", data: personalRecuisition });
    console.log(new Date().toLocaleString() + ' ' + 'DELETE PersonalRecuisitions Successfully!')

  } catch (e) {
    res.status(500).json({ message: e.message });
  }

})

module.exports = router