const mongoose = require('mongoose');
const { Schema } = mongoose;

// * Creation of Department Schema
const DepartmentSchema = new mongoose.Schema({

    Company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
    },
    
    DepartmentId: {
        type: String
    },

    DepartmentName: {
        type: String
    },

    ShortName: {
        type: String,
        required: true
    }

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

DepartmentSchema.pre('save', async function (next) {
    try {
        const latestDepartment = await this.constructor.findOne(
            {},
            { DepartmentId: 1 },
            { sort: { DepartmentId: -1 } }
        ).exec();

        let nextNumericPart = 1;
        if (latestDepartment) {
            const numericPart = parseInt(latestDepartment.DepartmentId?.slice(1), 10);
            if (!isNaN(numericPart)) {
                nextNumericPart = numericPart + 1;
            }
        }

        this.DepartmentId = 'D' + nextNumericPart.toString().padStart(3, '0');
        next();
    } catch (error) {
        next(error);
    }
});

// * Creation of model
const Department = mongoose.model('Department', DepartmentSchema);
module.exports = Department;