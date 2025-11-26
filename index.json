// This file must be located at: /api/chat.js

const axios = require('axios');

// Vercel's serverless handler function
// This function will handle requests to /api/chat
export default async function handler(req, res) {
    // Vercel only allows POST requests for this type of API usage
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed. Only POST requests are supported.');
        return;
    }

    // 1. Get data from the Roblox client request
    const { token, character_id, message, chat_id } = req.body;

    if (!token || !character_id || !message) {
        res.status(400).json({ error: 'Missing required parameters.' });
        return;
    }

    // 2. Prepare the payload for the Character.AI API
    const ca_api_url = "https://plus.character.ai/chat/streaming/"; 
    
    const ca_payload = {
        history_external_id: chat_id,
        character_external_id: character_id,
        text: message,
    };

    // 3. Make the external request to Character.AI
    try {
        const ca_response = await axios.post(ca_api_url, ca_payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`, 
                'User-Agent': 'Roblox-Vercel-Proxy' 
            }
        });

        // 4. Extract and forward the response text back to Roblox
        let finalResponseText = ca_response.data.text || "Proxy failed to parse response.";
        let newChatId = ca_response.data.history_id || chat_id;

        // Send the clean JSON response back to Roblox
        res.status(200).json({ 
            text: finalResponseText,
            chat_id: newChatId
        });

    } catch (error) {
        // Log the detailed error to the Vercel dashboard logs
        console.error("Error communicating with Character.AI:", error.message);
        
        // Send a simple error back to the Roblox script
        res.status(500).json({ error: "Proxy failed to get response from Character.AI.", details: error.message });
    }
}
