const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;

// * Creation of Company Schema
const CompanySchema = new mongoose.Schema({
 
    

    CompanyId: {
        type: String,
        unique: true
    },

    CompanyName: {
        type: String,
        required: true,
        unique: true
    },

    ShortName: {
        type: String,
        required: true,
        unique: true
    },

    Address: {
        type: String
    },

    PhoneNo: {
        type: Number
    },

    Email: {
        type: String,
        unique: false,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },

    CompanyLogo: {
        type: String
    }

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

CompanySchema.pre('save', async function (next) {
    try {
        const latestCompany = await this.constructor.findOne(
            {},
            { CompanyId: 1 },
            { sort: { CompanyId: -1 } }
        ).exec();

        let nextNumericPart = 1;
        if (latestCompany) {
            const numericPart = parseInt(latestCompany.CompanyId.slice(1), 10);
            if (!isNaN(numericPart)) {
                nextNumericPart = numericPart + 1;
            }
        }

        this.CompanyId = 'C' + nextNumericPart.toString().padStart(3, '0');
        next();
    } catch (error) {
        next(error);
    }
});

// * Creation of model
const Company = mongoose.model('Company', CompanySchema);
module.exports = Company;