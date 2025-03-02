const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const EmergencyCall = require('../models/EmergencyCall');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const User = require('../models/User');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyByLJNHUfFboqe7n0p2rNjDw0HFLCti1mA");

// Setup file storage with multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// @route   POST api/emergency/report-analysis
// @desc    Analyze medical report using Gemini
// @access  Private
router.post('/report-analysis', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Read file as base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');
    
    // Define Gemini model for medical report analysis
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    // Prompt for medical report analysis
    const prompt = `
    You are a medical AI assistant. Analyze the following medical report PDF (I'll describe the content) and provide a concise summary of the patient's medical history.
    Focus on:
    1. Chronic conditions
    2. Current medications
    3. Recent test results
    4. Known allergies
    5. Important medical history
    
    The content of the PDF is as follows:
    ${base64File.substring(0, 1000)}...
    
    Provide a concise 3-5 sentence summary covering the most important medical information for emergency responders.
    
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.json({ summary });
  } catch (err) {
    console.error('Error analyzing medical report:', err);
    res.status(500).json({ msg: 'Error analyzing medical report', error: err.message });
  }
});

// @route   POST api/emergency
// @desc    Create new emergency call and get AI assessment
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      description,
      vitals,
      medicalReportSummary,
      painLevel,
      breathingDifficulty,
      distressLevel,
      consciousness
    } = req.body;

    // Fetch user data
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Create emergency call object
    const emergencyData = {
      description,
      vitals,
      medicalReportSummary,
      severity: {
        painLevel,
        breathingDifficulty,
        distressLevel,
        consciousness
      }
    };

    // Define response schema for Gemini
    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        summary: {
          type: SchemaType.STRING,
          description: "A concise summary of the emergency situation based on all provided information",
        },
        triagePriority: {
          type: SchemaType.STRING,
          description: "The recommended triage priority level based on severity",
          enum: ["Immediate", "Urgent", "Delayed", "Minimal"],
        },
        recommendations: {
          type: SchemaType.STRING,
          description: "Medical recommendations for emergency responders",
        }
      },
      required: ["summary", "triagePriority", "recommendations"],
    };

    // Initialize Gemini model with schema
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    // Format emergency contacts for prompt
    const emergencyContactsFormatted = user.emergencyContacts
      .map(contact => `${contact.name} (${contact.relationship}): ${contact.phoneNumber}`)
      .join('\n    ');

    // Create prompt for emergency assessment
    const prompt = `
    You are an AI emergency medical assistant. Assess the following emergency situation and provide a structured response.
    Include relevant patient history in your assessment and recommendations.

    PATIENT INFORMATION:
    - Age: ${user.age}
    - Gender: ${user.gender}
    - Blood Type: ${user.bloodType}
    - Location: ${user.address} (${user.pincode})
    - Coordinates: Lat ${user.locationCoordinates.lat}, Lng ${user.locationCoordinates.lng}

    MEDICAL HISTORY:
    - Chronic Conditions: ${user.chronicConditions.join(', ') || 'None reported'}
    - Allergies: ${user.allergies.join(', ') || 'None reported'}
    - Current Medications: ${user.currentMedications.join(', ') || 'None reported'}

    EMERGENCY CONTACTS:
    ${emergencyContactsFormatted}

    EMERGENCY DESCRIPTION:
    ${description}

    VITAL SIGNS:
    - Heart Rate: ${vitals.heartRate} bpm
    - Blood Pressure: ${vitals.bloodPressure}
    - SpO2: ${vitals.spO2}%
    - Temperature: ${vitals.temperature}°C

    ADDITIONAL MEDICAL HISTORY:
    ${medicalReportSummary || "No additional medical history provided"}

    SEVERITY ASSESSMENT:
    - Pain Level (0-10): ${painLevel}
    - Breathing Difficulty (1-5): ${breathingDifficulty}
    - Distress Level: ${distressLevel}
    - Level of Consciousness: ${consciousness}

    Provide a medical assessment including:
    1. A comprehensive summary of the emergency situation incorporating the patient's medical history
    2. An appropriate triage priority level (Immediate, Urgent, Delayed, or Minimal)
    3. Detailed medical recommendations for emergency responders, taking into account the patient's chronic conditions, allergies, and current medications
    `;

    // Generate AI response
    const result = await model.generateContent(prompt);
    const aiResponseJson = JSON.parse(result.response.text());

    // Update emergency data with AI response
    emergencyData.aiResponse = JSON.stringify(aiResponseJson);
    emergencyData.triagePriority = aiResponseJson.triagePriority;

    // Save emergency call to database
    const emergencyCall = new EmergencyCall(emergencyData);
    await emergencyCall.save();

    // Return response
    res.status(201).json({
      emergencyCall,
      aiResponse: aiResponseJson
    });
  } catch (err) {
    console.error('Error creating emergency call:', err);
    res.status(500).json({ msg: 'Error creating emergency call', error: err.message });
  }
});

// @route   GET api/emergency
// @desc    Get all emergency calls
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    const emergencyCalls = await EmergencyCall.find().sort({ createdAt: -1 });
    res.json(emergencyCalls);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/emergency/:id
// @desc    Get emergency call by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const emergencyCall = await EmergencyCall.findById(req.params.id);
    
    if (!emergencyCall) {
      return res.status(404).json({ msg: 'Emergency call not found' });
    }

    res.json(emergencyCall);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Emergency call not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/emergency/create
// @desc    Create a new emergency call
// @access  Private
router.post('/create', auth, async (req, res) => {
  try {
    const {
      description,
      vitals,
      medicalReportSummary,
      severity
    } = req.body;

    // Create new emergency call
    const emergencyCall = new EmergencyCall({
      description,
      vitals,
      medicalReportSummary,
      severity,
      triagePriority: determinePriority(severity),
      aiResponse: generateAIResponse(description, vitals, severity)
    });

    // Save to database
    await emergencyCall.save();

    // Send response
    res.json({
      success: true,
      aiResponse: emergencyCall.aiResponse,
      triagePriority: emergencyCall.triagePriority,
      recommendations: generateRecommendations(emergencyCall.triagePriority)
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Helper function to determine priority
function determinePriority(severity) {
  const { breathingDifficulty, consciousness, painLevel, distressLevel } = severity;
  
  if (breathingDifficulty >= 4 || consciousness === 'Unresponsive') {
    return 'Immediate';
  } else if (painLevel >= 8 || distressLevel === 'Panicked' || consciousness === 'Drowsy') {
    return 'Urgent';
  } else if (painLevel >= 5 || breathingDifficulty >= 3 || distressLevel === 'Very Concerned') {
    return 'Delayed';
  } else {
    return 'Minimal';
  }
}

// Helper function to generate AI response
function generateAIResponse(description, vitals, severity) {
  return `Patient presents with ${description}. Vitals show heart rate of ${vitals.heartRate} bpm, blood pressure of ${vitals.bloodPressure}, SpO2 at ${vitals.spO2}%, and temperature of ${vitals.temperature}°C.`;
}

// Helper function to generate recommendations
function generateRecommendations(priority) {
  switch (priority) {
    case 'Immediate':
      return 'Immediate medical intervention required. Prepare for emergency response. Monitor vitals continuously.';
    case 'Urgent':
      return 'Urgent medical assessment needed. Monitor vital signs every 15 minutes. Prepare for potential escalation.';
    case 'Delayed':
      return 'Medical assessment required within 1 hour. Monitor for changes in condition. Regular vital sign checks.';
    default:
      return 'Non-urgent medical assessment needed. Monitor for changes in condition. Regular check-ins recommended.';
  }
}

module.exports = router;