const mongoose = require('mongoose');

const emergencyCallSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  vitals: {
    deviceType: String,
    heartRate: Number,
    bloodPressure: String,
    spO2: Number,
    temperature: Number
  },
  medicalReportSummary: {
    type: String,
    default: ''
  },
  severity: {
    painLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    breathingDifficulty: {
      type: Number,
      min: 1,
      max: 5
    },
    distressLevel: {
      type: String,
      enum: ['Mildly Concerned', 'Moderately Concerned', 'Very Concerned', 'Panicked']
    },
    consciousness: {
      type: String,
      enum: ['Alert and Oriented', 'Confused', 'Drowsy', 'Unresponsive']
    }
  },
  triagePriority: {
    type: String,
    enum: ['Immediate', 'Urgent', 'Delayed', 'Minimal'],
    required: true
  },
  aiResponse: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyCall', emergencyCallSchema);