const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const EmergencyCall = require('../models/EmergencyCall');
const User = require('../models/User');

// @route   POST api/appointments/assign
// @desc    Assign a doctor to an emergency call and create an appointment
// @access  Private/Admin
router.post('/assign', auth, async (req, res) => {
  try {
    const { emergencyCallId, doctorId, date, time, facility, department } = req.body;

    // Verify emergency call exists
    const emergencyCall = await EmergencyCall.findById(emergencyCallId);
    if (!emergencyCall) {
      return res.status(404).json({ msg: 'Emergency call not found' });
    }

    // Create new appointment
    const appointment = new Appointment({
      userId: req.user.id, // Use the authenticated user's ID
      emergencyCallId,
      doctorId, // Use the mock doctor ID directly
      date,
      time,
      facility,
      department,
      reason: emergencyCall.description,
      status: 'Scheduled'
    });

    await appointment.save();

    // Update emergency call to mark as assigned
    emergencyCall.isAssigned = true;
    emergencyCall.assignedDoctor = doctorId;
    await emergencyCall.save();

    res.json(appointment);
  } catch (err) {
    console.error('Error assigning doctor:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/appointments/user
// @desc    Get all appointments for a user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .populate('doctorId', 'name')
      .sort({ date: 1 });
    
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/appointments/doctor
// @desc    Get all appointments for a doctor
// @access  Private
router.get('/doctor', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user.id })
      .populate('userId', 'name')
      .sort({ date: 1 });
    
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 