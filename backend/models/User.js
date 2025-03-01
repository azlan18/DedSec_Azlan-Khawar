const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  locationCoordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  chronicConditions: [String], // e.g., ['Diabetes', 'Hypertension']
  allergies: [String], // e.g., ['Penicillin', 'Peanuts']
  currentMedications: [String], // e.g., ['Aspirin', 'Metformin']
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
  },
  emergencyContacts: [
    {
      name: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      relationship: { type: String, required: true }, // e.g., Parent, Friend
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);