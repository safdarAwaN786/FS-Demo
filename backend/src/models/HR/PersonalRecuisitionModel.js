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

  UserDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
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

