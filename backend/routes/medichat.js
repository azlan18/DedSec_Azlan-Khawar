const express = require('express');
const { queryPineconeVectorStore } = require('../utils/pinecone');
const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const router = express.Router();

const pinecone = new Pinecone({
    apiKey: "pcsk_757Uux_JWP3Vvx82ML38JDSPxhT7sHUyyv22P8sPqw7VbFktS8C8B2fEVswRYFue4HeCuw",
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    generationConfig: {
        maxOutputTokens: 2048,
    },
});

router.post('/medichatgemini', async (req, res) => {
    try {
        const { messages, data } = req.body;
        const userQuestion = messages[messages.length - 1]?.content || '';

        const reportData = data?.reportData || '';
        const query = `Represent this for searching relevant passages: patient medical report says: \n${reportData}. \n\n${userQuestion}`;

        const retrievals = await queryPineconeVectorStore(pinecone, 'index-one', 'testspace', query);

        const finalPrompt = `Here is a summary of a patient's clinical report, and a user query. Some generic clinical findings are also provided that may or may not be relevant for the report.
        Go through the clinical report and answer the user query.
        Ensure the response is factually accurate, and demonstrates a thorough understanding of the query topic and the clinical report.
        Before answering you may enrich your knowledge by going through the provided clinical findings. 
        The clinical findings are generic insights and not part of the patient's medical report. Do not include any clinical finding if it is not relevant for the patient's case.

        \n\n**Patient's Clinical report summary:** \n${reportData}. 
        \n**end of patient's clinical report** 

        \n\n**User Query:**\n${userQuestion}?
        \n**end of user query** 

        \n\n**Generic Clinical findings:**
        \n\n${retrievals}. 
        \n\n**end of generic clinical findings** 

        \n\nProvide thorough justification for your answer.
        \n\n**Answer:**`;

        // Set headers for streaming
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const text = response.text();

        // Send the complete response
        res.json({
            text,
            retrievals,
            role: 'assistant'
        });

    } catch (error) {
        console.error('Error in chat route:', error);
        res.status(500).json({ 
            error: 'Failed to generate response',
            details: error.message 
        });
    }
});

module.exports = router;
