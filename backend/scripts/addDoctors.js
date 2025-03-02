const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const doctors = [
  {
    name: "Dr. Priya Sharma",
    email: "priya.sharma@hospital.com",
    password: "doctor123",
    role: "doctor",
    department: "Cardiology",
    phone: "9876543210",
    address: "123 Medical Center Road",
    pincode: "400001",
    age: 35,
    gender: "Female"
  },
  {
    name: "Dr. Rajesh Patel",
    email: "rajesh.patel@hospital.com",
    password: "doctor123",
    role: "doctor",
    department: "Neurology",
    phone: "9876543211",
    address: "456 Hospital Street",
    pincode: "400002",
    age: 42,
    gender: "Male"
  },
  {
    name: "Dr. Anita Desai",
    email: "anita.desai@hospital.com",
    password: "doctor123",
    role: "doctor",
    department: "Pediatrics",
    phone: "9876543212",
    address: "789 Healthcare Avenue",
    pincode: "400003",
    age: 38,
    gender: "Female"
  },
  {
    name: "Dr. Suresh Kumar",
    email: "suresh.kumar@hospital.com",
    password: "doctor123",
    role: "doctor",
    department: "Orthopedics",
    phone: "9876543213",
    address: "321 Doctor's Lane",
    pincode: "400004",
    age: 45,
    gender: "Male"
  },
  {
    name: "Dr. Meera Reddy",
    email: "meera.reddy@hospital.com",
    password: "doctor123",
    role: "doctor",
    department: "Gynecology",
    phone: "9876543214",
    address: "654 Medical Plaza",
    pincode: "400005",
    age: 40,
    gender: "Female"
  }
];

const addDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hash password and create doctors
    for (const doctor of doctors) {
      const salt = await bcrypt.genSalt(10);
      doctor.password = await bcrypt.hash(doctor.password, salt);
      
      // Check if doctor already exists
      const existingDoctor = await User.findOne({ email: doctor.email });
      if (!existingDoctor) {
        await User.create(doctor);
        console.log(`Added doctor: ${doctor.name}`);
      } else {
        console.log(`Doctor already exists: ${doctor.name}`);
      }
    }

    console.log('All doctors added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding doctors:', error);
    process.exit(1);
  }
};

addDoctors(); 