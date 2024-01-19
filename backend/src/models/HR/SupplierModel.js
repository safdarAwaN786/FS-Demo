const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;

// * Creation of Supplier Schema
const supplierSchema = new mongoose.Schema({

    SupplierCode: {
        type: String,
        unique: true,
    },

    UserDepartment : {
        type : Schema.Types.ObjectId,
        ref : 'Department'
    },
    Name: {
        type: String,
        required: true,
    },

    Address: {
        type: String,
        required: true,
    },

    PhoneNumber: {
        type: String,
    },

    ContactPerson: {
        type: String
    },

    ProductServiceOffered: {
        type: String
    },

    DueDate: {
        type: String,
        enum: ['1 Year', '2 Year', '3 Year']
    },

    Status: {
        type: String,
        enum: ['Pending', 'Approved', 'Disapproved'],
        default : 'Pending'
    },
    RiskCategory: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
    },
    CurrentApprovalDate : {
        type : Date,
        required : true
    },
    NextApprovalDate : {
        type : Date,
        required : true
    },
    PhoneNumber2 : {
        type : Number,
    },
    CreatedBy: {
        type: String
    },

    CreationDate: {
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
    Reason: {
        type: String
    },

    DisapprovalDate: {
        type: Date
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// ? Pre-save middleware to generate the next supplier code
supplierSchema.pre('save', async function (next) {
    try {
        const latestSupplier = await this.constructor.findOne(
            {},
            { SupplierCode: 1 },
            { sort: { SupplierCode: -1 } }
        ).exec();

        let nextNumericPart = 1;
        if (latestSupplier) {
            const numericPart = parseInt(latestSupplier.SupplierCode.slice(1), 10);
            nextNumericPart = numericPart + 1;
        }

        this.SupplierCode = 'S' + nextNumericPart.toString().padStart(3, '0');
        next();
    } catch (error) {
        next(error);
    }
});

// * Creation of model
const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;