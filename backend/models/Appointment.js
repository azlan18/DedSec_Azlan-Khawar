const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emergencyCallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyCall',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  facility: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema); 