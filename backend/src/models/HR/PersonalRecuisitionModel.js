const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// * Creation of Personal Recuision Schema
const personalRecuisionSchema = new mongoose.Schema({
  
 // ! This attribute is used By HR Panel when all details are filled and submitted 
  Status : {
    type: String,
    enum: ['Approved', 'Disapproved', 'Pending'],
    default : 'Pending'
  },

  User: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  Reason : {
    type : String,
  },

  Station : {
    type: String
  },

  JobTitle : {
    type: String,
  },

  // ! It should be drop-down like Department1, Department2, ... on frontend
  DepartmentText: {
    type: String,
    required : true
  },

  Section: {
    type: String,
    required: true
  },

  Supervisor : {
    type: String,
    required: true
  },

  EmploymentType: {
    type: String,
    // * Enum to restrict the value from the following
    enum: ['Permanent', 'Contractual', 'Specific Record','Part Time','Temporary','Internship']
  },

  GrossSalary: {
    type: Number
  },

  NetSalary: {
    type:Number
  },

  BasicSalaryDetail: {
    type:String
  },

  AllowanceDetail: {
    type:String
  },

  IncentivesDetail: {
    type:String
  },

  MiniQualification: {
    type:String,
    required: true
  },

  MiniExperienced: {
    type:String,
    required: true
  },

  IndustrySpecificExp: {
    type:String,
    required: true
  },

  AgeBracket: {
    type:String,
    required: true
  },

  ComputerSkill: {
    type: String,
    // * Enum to restrict the value from the following
    enum: ['High', 'Medium', 'Average','Not Applicable']
  },

  CommunicationSkill: {
    type: String,
    // * Enum to restrict the value from the following
    enum: ['High','Medium', 'Average','Not Applicable']
  },

  Justification: {
    type: String,

    enum : ['New Business Need', 'New Structure Need', 'New Target Requirement', 'Department Extension', 'Work Overload Sharing', 'Employee Resignation', ]

  },

  Others : {
    type: String
  },

  // ! It should be drop-down like Designation1, Designation2, ... on frontend  
  Designation: {
    type: String,
    required: true
  },

  MainJobResponsibility: {
    type: String,
    required: true
  },
  
  RequestInitiatedBy: {
    type:String
  },

  RequestBy: {
    type: String
  },

  RequestDate: {
    type: Date
  },

  ApprovedBy: {
    type: String
  },

  ApprovalDate: {
    type: Date
  },

  DisapprovedBy: {
    type: String
  },

  DisapprovalDate: {
    type: Date
  }

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

// * Creation of Model 
const PersonalRecuision = new mongoose.model('PersonalRecuision', personalRecuisionSchema)
module.exports = PersonalRecuision











// Virtual Get data to check which user create the  note
// personalRecuisionSchema.virtual('notes', {
//   ref : 'Note',
//   localField : '_id', 
//   foreignField : 'owner'
// })


// // Get UseFull Information of User
// userSchema.methods.toJSON = function () {
//   const user = this
//   const userObject = user.toObject()
//   delete userObject.password
//   delete userObject.confirmPassword
//   delete userObject.tokens
//   return userObject  
// }

// // Authentication Schema
// userSchema.methods.generateAuthToken = async function () {
//   const user = this;
//   const token = jwt.sign({ _id: user._id.toString() }, 'thisisthesecret');
//   user.tokens = user.tokens.concat({ token })
//   await user.save()
//   return token
// };

// // Login Schema
// userSchema.statics.findByCredentials = async (email, password) => {
//   const user = await User.findOne({ email });
//   if (!user) {
//     throw new Error("Unable to Login");
//   }
//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     throw new Error("Unable to Login");
//   }
//   return user;
// };

// // Hash the plain text password before saving
// userSchema.pre("save", async function (next) {
//   const user = this;
//   if (user.isModified("password")) {
//     user.password = await bcrypt.hash(user.password, 8);
//   }
//   next();
// });
















  // user.tokens = user.tokens.concat({ token })
  // await user.save()



// Hiding Private Data Schema
// notesSchema.methods.getPublicData = async function () {
//   const user = this
//   const userObject = user.toObject()
//   delete userObject.password
//   delete userObject.tokens
//   return userObject;
// } 








 
        // validate(value) {
        //     if (!validator.isAlpha(value)) {
        //       throw new Error("Please Enter Only Notes!");
        //     }
        //   },

        // Get UseFull Information of User
// userSchema.methods.getPublicProfile = function () {
//   const user = this
//   const userObject = user.toObject()
//   delete userObject.password
//   delete userObject.confirmPassword
//   delete userObject.tokens
//   return userObject  
// }


// : user.getPublicProfile() // used in userRouter 