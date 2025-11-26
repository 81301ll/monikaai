const express = require('express');
const axios = require('axios');
const app = express();

// Use environment variable for the port, required by Render
const port = process.env.PORT || 3000; 

// Middleware to parse JSON bodies from Roblox
app.use(express.json());

// 🚨 Your main proxy endpoint 🚨
app.post('/chat', async (req, res) => {
    // 1. Get data from the Roblox client request
    const { token, character_id, message, chat_id } = req.body;

    if (!token || !character_id || !message) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    // 2. Prepare the payload for the Character.AI API
    // NOTE: Character.AI endpoint may change or require updates over time.
    const ca_api_url = "https://plus.character.ai/chat/streaming/"; 

    const ca_payload = {
        history_external_id: chat_id, // For continuing an existing chat
        character_external_id: character_id,
        text: message,
    };

    // 3. Make the external request to Character.AI
    try {
        const ca_response = await axios.post(ca_api_url, ca_payload, {
            headers: {
                'Content-Type': 'application/json',
                // This is the required Character.AI header format for authentication
                'Authorization': `Token ${token}`, 
                'User-Agent': 'Roblox-Render-Proxy' 
            }
        });

        // 4. Extract and forward the response text back to Roblox
        let finalResponseText = ca_response.data.text || "Monika did not respond or the proxy could not parse the response.";
        let newChatId = ca_response.data.history_id || chat_id; // Keep the chat ID updated

        // Send the clean, simple JSON response back to Roblox
        res.status(200).json({ 
            text: finalResponseText,
            chat_id: newChatId
        });

    } catch (error) {
        // Log the detailed error on the Render console
        console.error("Error communicating with Character.AI:", error.message);

        // Send a simple error back to the Roblox script
        res.status(500).json({ error: "Proxy failed to get response from Character.AI.", details: error.message });
    }
});

// The Render server starts listening
app.listen(port, () => {
  console.log(`Render Proxy listening on port ${port}`);
});