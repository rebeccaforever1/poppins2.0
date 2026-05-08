require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- Perplexity Chat Endpoint ---
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    
    const systemMessage = {
        role: "system",
        content: `You are Poppins, a warm and knowledgeable parenting assistant.
        ONLY answer questions about parenting, child development, and family life.
        If asked about any other topic, gently redirect to parenting.

        RESPONSE RULES:
        - Be SPECIFIC. Never give vague advice like "talk openly" or "seek help early."
        - Instead of "talk openly," say exactly HOW: "Try asking 'what was one good thing today?' at dinner instead of 'how was school?'"
        - Instead of "seek help," say exactly WHEN and WHERE: "If your child has had two or more meltdowns a day for two weeks, talk to your pediatrician at the next visit."
        - Give one concrete example or script in every response.
        - Write like a wise friend who happens to know a lot about kids — not a pamphlet.
        - Short sentences. Real talk. No fluff.
        - Never end with a generic motivational line like "you've got this" or "your support makes all the difference."
        - Use hyphens (-) for bullet points only when listing 3+ items.
        - break into specific steps or tips using hyphens.
        - Never use markdown like ** or ###.
        - Maximum 3-4 sentences per response unless listing steps.
        FORMATTING RULES:
        - Never write more than 2 sentences in a row without a line break.`

    };
    
    const allMessages = [systemMessage];
    for (let i = 0; i < messages.length; i++) {
        allMessages.push(messages[i]);
    }
    
    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: 'sonar-pro',
                messages: allMessages,
                temperature: 0.7,
                max_tokens: 250
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.error('Perplexity error:', data.error);
            return res.status(500).json({ error: data.error.message });
        }
        
        res.json({ reply: data.choices[0].message.content });
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Hume TTS Endpoint ---
app.post('/api/tts', async (req, res) => {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'No text provided' });
    }
    
    // Clean the text
    let cleanText = text.replace(/<br>/g, ' ');
    cleanText = cleanText.replace(/<[^>]*>/g, '');
    cleanText = cleanText.replace(/\*/g, '');
    cleanText = cleanText.replace(/#/g, '');
    cleanText = cleanText.substring(0, 500);
    // Add breathing room after sentences
    cleanText = cleanText.replace(/\. /g, '...  ');
    cleanText = cleanText.replace(/\? /g, '?  ');
    cleanText = cleanText.replace(/! /g, '!  ');
    
    // Correct format using utterances array
    const requestBody = {
        utterances: [
            {
                text: cleanText,
                voice: {
                    id: process.env.HUME_VOICE_ID
                },
                description: "Speak slowly and warmly like a caring, experienced mother comforting a tired parent. Take a natural breath after every sentence. Pause meaningfully at every period. Never rush. Your voice is soft, unhurried, and deeply reassuring.",
                speed: 0.78
            }
        ]
    };
    
    console.log('TTS: Using voice ID:', process.env.HUME_VOICE_ID);
    console.log('TTS: Text:', cleanText.substring(0, 100));
    
    try {
        const response = await fetch('https://api.hume.ai/v0/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Hume-Api-Key': process.env.HUME_API_KEY
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hume error response:', response.status, errorText);
            return res.status(response.status).json({ error: 'TTS failed' });
        }
        
        const humeData = await response.json();

        // Extract the base64 audio from Hume's response structure
        const base64Audio = humeData.generations?.[0]?.audio;

        if (!base64Audio) {
            console.error('Hume response structure:', JSON.stringify(humeData).substring(0, 200));
            return res.status(500).json({ error: 'No audio in Hume response' });
        }

        console.log('TTS success - audio size:', base64Audio.length);
        res.json({ audio: base64Audio, format: 'mp3' });
        
    } catch (error) {
        console.error('TTS error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        chat: true,
        tts: !!process.env.HUME_API_KEY,
        humeKeyConfigured: !!process.env.HUME_API_KEY,
        humeVoiceConfigured: !!process.env.HUME_VOICE_ID,
        voiceId: process.env.HUME_VOICE_ID || "ITO (default)"
    });
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
    console.log('Hume API Key:', process.env.HUME_API_KEY ? '✓ Configured' : '✗ Missing');
    console.log('Hume Voice ID:', process.env.HUME_VOICE_ID || 'Using default: ITO');
});