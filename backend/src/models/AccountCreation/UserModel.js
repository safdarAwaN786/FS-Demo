const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;

// * Creation of User Schema
const UserSchema = new mongoose.Schema({

    Department: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
    },

    PhoneNumber: {
        type: Number,
        validate: {
            validator: function (PhoneNumber) {
                const phoneNumberString = PhoneNumber.toString();
                return phoneNumberString.length <= 11;
            },
            message: 'Phone number must have a maximum of 11 digits.',
        },
    },

    Qualification: {
        type: String,
    },

    CNIC: {
        type: Number,
        validate: {
            validator: function (cnic) {
                const cnicString = cnic.toString();
                return cnicString.length === 13;
            },
            message: 'CNIC must have exactly 13 digits.',
        },
    },

    Company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
    },

    UserDepartment: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
    },

    Assigned: {
        type: Boolean,
        default: false
    },

    TrainingStatus: {
        type: String,
        enum: ['Trained', 'Not Trained'],
        default: 'Not Trained'
    },

    UserId: {
        type: String
    },

    Name: {
        type: String
    },

    Skills: {
        type: String
    },

    Designation: {
        type: String
    },

    DepartmentText: {
        type: String
    },
    Address: {
        type: String,
    },
    DateOfBirth: {
        type: Date,
    },

    EmployeeCV: {
        type: Object
    },

    Age: {
        type: Number,
    },

    Specialities: {
        type: String
    },

    TrainerImage: {
        type: String
    },

    TrainerDocument: {
        type: String
    },

    EmployeeImage: {
        type: Object
    },
    
    EmployeeData: [{

        Training: {
            type: Schema.Types.ObjectId,
            ref: 'Training'
        },

        EmployeeResultStatus: {
            type: String,
            enum: ['Pending', 'Active'],
            default: 'Pending'
        },

        Marks: {
            type: Number
        },

        Remarks: {
            type: String,
        },

        IsPresent: {
            type: Boolean,
            default: false
        },

        IsPass: {
            type: Boolean,
            default: false
        },
    }
    ],

    CreatedBy: {
        type: String
    },

    CreationDate: {
        type: Date
    },

    AuditorImage: {
        type: String
    },

    AuditorDocument: {
        type: String
    },

    ApprovedAuditorLetter: {
        type: String
    },
  
    ApprovedInternalAuditor: {
        type: Boolean,
        default: false
    },

    Role: {
        type: String,
    },

    PhoneNo: {
        type: Number
    },

    Email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },

    isEmployee: {
        type: Boolean,
        default: false,
        required: true
    },

    isProcessOwner : {
        type : Boolean,
        default : false,
        required : true
    },

    isDeputyOwner : {
        type : Boolean,
        default : false,
        required : true
    },

    isAuditor : {
        type : Boolean,
        default : false,
        required : true
    },

    isMember: {
        type: Boolean,
        required: true,
        default: false
    },

    isTrainer: {
        type: Boolean,
        required: true,
        default: false
    },

    UserName: {
        type: String,
        unique: true,
        required: true
    },

    Password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },

    Tabs: [{
        Tab: {
            type: String
        },
        Creation: {
            type: Boolean,
            default: false,
        },
        Approval: {
            type: Boolean,
            default: false,
        },
        Review: {
            type: Boolean,
            default: false,
        },
        Edit: {
            type: Boolean,
            default: false,
        },
        Authority: {
            type: Boolean,
            default: false
        }
    }],

    Education: {
        type: String
    },

    Experience: {
        type: String
    },

    RoleInTeam: {
        type: String
    },

    TrainingsAttended: {
        type: String
    },

    TrainingDate: {
        type: Date
    },

    Document: {
        type: String
    },

    isSuspended: {
        type: Boolean,
        required: true,
        default: false
    }

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

UserSchema.pre('save', async function (next) {
    try {
        const latestUser = await this.constructor.findOne(
            {},
            { UserId: 1 },
            { sort: { UserId: -1 } }
        ).exec();

        let nextNumericPart = 1;

        if (latestUser) {
            const numericPart = parseInt(latestUser.UserId?.slice(1), 10);
            if (!isNaN(numericPart)) {
                nextNumericPart = numericPart + 1;
            }
        }

        this.UserId = 'U' + nextNumericPart.toString().padStart(3, '0');
        next();

    } catch (error) {
        next(error);
    }
});

// * Creation of model
const user = mongoose.model('User', UserSchema);
module.exports = user;