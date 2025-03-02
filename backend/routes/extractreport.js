const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const prompt = `Analyze the following medical report and provide a summary focusing on:
1. Key medical findings and abnormalities
2. Important test results and values
3. Diagnoses or conditions mentioned
4. Any recommendations or follow-up actions

Please provide a concise summary (100-200 words) that captures the most important medical information. Do not include patient identifying information.

## Summary:`;

router.post('/extractreportgemini', async (req, res) => {
    try {
        const { base64 } = req.body;
        if (!base64) {
            return res.status(400).json({ error: 'Missing base64 file data' });
        }

        // Validate base64 format
        if (!base64.includes('base64,')) {
            return res.status(400).json({ error: 'Invalid base64 format' });
        }

        const filePart = fileToGenerativePart(base64);
        
        try {
            const response = await model.generateContent([prompt, filePart]);
            const textResponse = response.response?.text();

            if (!textResponse) {
                return res.status(500).json({ error: 'No response from AI model' });
            }

            return res.json({ text: textResponse });
        } catch (aiError) {
            console.error('AI Processing Error:', aiError);
            return res.status(500).json({ 
                error: 'AI processing failed',
                details: aiError.message 
            });
        }

    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ 
            error: 'Failed to process document',
            details: error.message 
        });
    }
});

function fileToGenerativePart(imageData) {
    try {
        const base64Data = imageData.split('base64,')[1];
        const mimeType = imageData.substring(
            imageData.indexOf(":") + 1,
            imageData.indexOf(";")
        );

        return {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            },
        };
    } catch (error) {
        throw new Error(`Failed to process file data: ${error.message}`);
    }
}

module.exports = router;
