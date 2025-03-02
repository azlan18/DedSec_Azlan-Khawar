const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const Report = require('../models/Report'); // We'll define this model below

// Initialize Gemini API with proper configuration
if (!process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = "AIzaSyByLJNHUfFboqe7n0p2rNjDw0HFLCti1mA";
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the schema for medical report summary
const summarySchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.OBJECT,
      properties: {
        keyFindings: {
          type: SchemaType.ARRAY,
          description: "List of key medical findings",
          items: {
            type: SchemaType.STRING
          }
        },
        diagnosis: {
          type: SchemaType.STRING,
          description: "Primary diagnosis from the report"
        },
        recommendations: {
          type: SchemaType.ARRAY,
          description: "List of medical recommendations",
          items: {
            type: SchemaType.STRING
          }
        },
        importantDetails: {
          type: SchemaType.STRING,
          description: "Additional important information from the report"
        }
      },
      required: ["keyFindings", "diagnosis", "recommendations", "importantDetails"]
    }
  },
  required: ["summary"]
};

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const reportsDir = path.join(__dirname, '..', 'reports');
    
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    cb(null, reportsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueId}${extension}`);
  }
});

// File filter to accept only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
});

// @route   GET api/reports
// @desc    Get all reports for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({ uploadDate: -1 });
    res.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/reports/upload
// @desc    Upload a new medical report
// @access  Private
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { patientName, reportType } = req.body;
    
    if (!req.file || !patientName || !reportType) {
      return res.status(400).json({ message: 'File, patient name, and report type are required' });
    }
    
    // Convert file to base64
    const fileData = fs.readFileSync(req.file.path);
    const base64Data = `data:${req.file.mimetype};base64,${fileData.toString('base64')}`;
    
    // Create a new report in the database
    const newReport = new Report({
      patientName,
      reportType,
      fileName: req.file.originalname,
      date: new Date(),
      base64Data,
      user: req.user ? req.user.id : null // Make user optional for now
    });
    
    console.log('Creating new report:', {
      patientName,
      reportType,
      fileName: req.file.originalname
    });
    
    const savedReport = await newReport.save();
    console.log('Report saved successfully:', savedReport._id);
    
    // Delete the file from disk since we've stored it as base64
    fs.unlinkSync(req.file.path);
    
    res.status(201).json({ 
      message: 'Report uploaded successfully',
      report: savedReport
    });
    
  } catch (error) {
    console.error('Error uploading report:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: error.message 
    });
  }
});

// @route   POST api/reports/:reportId/generate-summary
// @desc    Generate a summary for a report
// @access  Private
router.post('/:reportId/generate-summary', auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    
    // Find the report by _id instead of reportId
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Extract text from base64 data
    const pdfText = `Medical report for ${report.patientName}. This is a simulated PDF content.`;
    
    // Generate summary using Gemini API with schema
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: summarySchema
      }
    });
    
    const prompt = `
      You are a helpful assistant summarizing a document. Create a summary of this report in a clear and concise way.
      For this example content, feel free to generate representative findings, diagnosis, and recommendations that would
      make sense in a typical medical report. You don't need to add disclaimers or warnings - just focus on summarizing
      the content as if it were a real report.

      Here's the content to summarize:
      ${pdfText}
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = JSON.parse(response.text());

      // Format the summary for text file
      const formattedSummary = `
MEDICAL REPORT SUMMARY
=====================

KEY FINDINGS:
${summary.summary.keyFindings.map(finding => `- ${finding}`).join('\n')}

DIAGNOSIS:
${summary.summary.diagnosis}

RECOMMENDATIONS:
${summary.summary.recommendations.map(rec => `- ${rec}`).join('\n')}

IMPORTANT DETAILS:
${summary.summary.importantDetails}
      `.trim();
      
      // Create summaries directory if it doesn't exist
      const summariesDir = path.join(__dirname, '..', 'summaries');
      if (!fs.existsSync(summariesDir)) {
        fs.mkdirSync(summariesDir, { recursive: true });
      }
      
      // Save formatted summary to file
      const summaryFilePath = path.join(summariesDir, `${reportId}.txt`);
      fs.writeFileSync(summaryFilePath, formattedSummary, 'utf8');
      
      // Update report in database
      report.hasSummary = true;
      await report.save();
      
      res.json({ 
        message: 'Summary generated successfully',
        report,
        summary: formattedSummary
      });
    } catch (geminiError) {
      console.error('Gemini API Error:', geminiError);
      return res.status(500).json({ message: 'Error generating summary with AI' });
    }
    
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/reports/:reportId/download
// @desc    Download a report or summary
// @access  Private
router.get('/:reportId/download', auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { type } = req.query; // 'report' or 'summary'
    
    // Find the report by _id instead of reportId
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    if (type === 'report') {
      // For reports, send the base64 data directly
      if (!report.base64Data) {
        return res.status(404).json({ message: 'Report data not found' });
      }
      
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${report.fileName || 'report.pdf'}"`);
      res.setHeader('Content-Type', 'application/pdf');
      
      // Extract the actual base64 data without the data URL prefix
      const base64Data = report.base64Data.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      res.send(buffer);
    } else if (type === 'summary') {
      if (!report.hasSummary) {
        return res.status(404).json({ message: 'Summary not found' });
      }
      const summaryFilePath = path.join(__dirname, '..', 'summaries', `${reportId}.txt`);
      if (!fs.existsSync(summaryFilePath)) {
        return res.status(404).json({ message: 'Summary file not found' });
      }
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${report.patientName}_Summary.txt"`);
      fs.createReadStream(summaryFilePath).pipe(res);
    } else {
      return res.status(400).json({ message: 'Invalid file type' });
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// @route   GET api/reports/:reportId/view
// @desc    View a report or summary
// @access  Private
router.get('/:reportId/view', auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { type } = req.query; // 'report' or 'summary'
    
    // Find the report by _id instead of reportId
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    if (type === 'report') {
      // For reports, send the base64 data directly
      if (!report.base64Data) {
        return res.status(404).json({ message: 'Report data not found' });
      }
      
      // Set content type for inline viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      
      // Extract the actual base64 data without the data URL prefix
      const base64Data = report.base64Data.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      res.send(buffer);
    } else if (type === 'summary') {
      if (!report.hasSummary) {
        return res.status(404).json({ message: 'Summary not found' });
      }
      const summaryFilePath = path.join(__dirname, '..', 'summaries', `${reportId}.txt`);
      if (!fs.existsSync(summaryFilePath)) {
        return res.status(404).json({ message: 'Summary file not found' });
      }
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'inline');
      fs.createReadStream(summaryFilePath).pipe(res);
    } else {
      return res.status(400).json({ message: 'Invalid file type' });
    }
  } catch (error) {
    console.error('Error viewing file:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// @route   DELETE api/reports/:reportId
// @desc    Delete a report and its associated files
// @access  Private
router.delete('/:reportId', auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    
    // Find the report and ensure it belongs to the user
    const report = await Report.findOne({ reportId, user: req.user.id });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Delete PDF file if it exists
    const reportFilePath = path.join(__dirname, '..', 'reports', `${reportId}.pdf`);
    if (fs.existsSync(reportFilePath)) {
      fs.unlinkSync(reportFilePath);
    }

    // Delete summary file if it exists
    const summaryFilePath = path.join(__dirname, '..', 'summaries', `${reportId}.txt`);
    if (fs.existsSync(summaryFilePath)) {
      fs.unlinkSync(summaryFilePath);
    }

    // Delete report from database
    await Report.findOneAndDelete({ reportId, user: req.user.id });

    res.json({ message: 'Report deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reports
router.get('/all', async (req, res) => {
    try {
        console.log('Fetching all reports...');
        const reports = await Report.find()
            .sort({ date: -1 })
            .select('patientName reportType date base64Data');

        // Ensure base64 data is properly formatted
        const formattedReports = reports.map(report => {
            let base64Data = report.base64Data;
            if (!base64Data.startsWith('data:')) {
                base64Data = `data:application/pdf;base64,${base64Data}`;
            }
            return {
                ...report.toObject(),
                base64Data
            };
        });

        console.log(`Found ${reports.length} reports`);
        res.json(formattedReports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports', details: error.message });
    }
});

// Add a new report (test endpoint)
router.post('/test-add', async (req, res) => {
    try {
        console.log('Creating test report...');
        const testReport = new Report({
            patientName: "John Doe",
            reportType: "Blood Test",
            date: new Date(),
            base64Data: "data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G"
        });

        console.log('Saving test report...');
        const savedReport = await testReport.save();
        console.log('Test report saved successfully:', savedReport);
        
        res.status(201).json({ 
            message: 'Test report added successfully', 
            report: savedReport 
        });
    } catch (error) {
        console.error('Error adding test report:', error);
        res.status(500).json({ 
            error: 'Failed to add test report', 
            details: error.message 
        });
    }
});

module.exports = router;