const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;

// * Creation of User Schema
const EmployeeSchema = new mongoose.Schema({

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

    Name: {
        type: String
    },

   UserId : {
    type : String
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


}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

EmployeeSchema.pre('save', async function (next) {
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

        this.UserId = 'E' + nextNumericPart.toString().padStart(3, '0');
        next();

    } catch (error) {
        next(error);
    }
});

// * Creation of model
const user = mongoose.model('Employee', EmployeeSchema);
module.exports = user;