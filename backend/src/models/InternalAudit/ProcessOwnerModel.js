const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// * Creation of Process Owner Schema
const processOwnerSchema = new Schema({

    ProcessCode: {
        type: String,
    },
    
    UserDepartment: {
        type: Schema.Types.ObjectId,
        ref: 'Department'
    },

    Department : {
        type : Schema.Types.ObjectId,
        ref : 'Department'
    },
        
    ProcessName: {
        type: String,
        required: true
    },

    Activities: {
        type: String,
        required: true
    },

    CriticalAreas: {
        type: String
    },

    ShiftBreaks: {
        type: String
    },

    SpecialInstructions: {
        type: String
    },

    ProcessRiskAssessment: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        required: true
    },

    Reason: {
        type: String,
        required: true
    },

    ProcessOwner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    CreatedBy: {
        type: String
    },

    CreationDate: {
        type: Date
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

processOwnerSchema.pre('save', async function (next) {
    try {
        const latestProcess = await this.constructor.findOne(
            {},
            { ProcessCode: 1 },
            { sort: { ProcessCode: -1 } }
        ).exec();

        let nextNumericPart = 1;
        if (latestProcess) {
            const numericPart = parseInt(latestProcess.ProcessCode.slice(2), 10);
            nextNumericPart = numericPart + 1;
        }
        this.ProcessCode = 'P' + nextNumericPart.toString().padStart(3, '0');
        next();

    } catch (error) {
        next(error);
    }
});

// * Creation of Model
const ProcessOwner = mongoose.model('ProcessOwner', processOwnerSchema);
module.exports = ProcessOwner;