// voice.js - Add voice capabilities to poppins.bot
import { HumeClient } from '@humeai/voice';

let voiceClient = null;
let isVoiceActive = false;

// Your credentials (use .env for production!)
const HUME_API_KEY = 'your-api-key';  // Move to .env!
const HUME_CONFIG_ID = 'your-config-id';

export async function startVoiceChat(onMessageCallback) {
    if (voiceClient) {
        await stopVoiceChat();
    }
    
    try {
        // Connect to Hume EVI
        const client = new HumeClient({
            apiKey: HUME_API_KEY,
            configId: HUME_CONFIG_ID
        });
        
        voiceClient = await client.empathicVoice.chat.connect();
        isVoiceActive = true;
        
        console.log('🎤 Voice connected - speak naturally with poppins');
        
        // Listen for assistant responses
        voiceClient.on('assistant_message', (message) => {
            const text = message.content;
            console.log('🤖 poppins says:', text);
            
            // Send the response to your chat display
            if (onMessageCallback) {
                onMessageCallback(text);
            }
        });
        
        // Listen for user speech
        voiceClient.on('user_message', (message) => {
            console.log('👤 User said:', message.content);
        });
        
        // Handle errors
        voiceClient.on('error', (error) => {
            console.error('Voice error:', error);
            stopVoiceChat();
        });
        
        return true;
        
    } catch (error) {
        console.error('Failed to connect voice:', error);
        return false;
    }
}

export async function stopVoiceChat() {
    if (voiceClient) {
        await voiceClient.disconnect();
        voiceClient = null;
        isVoiceActive = false;
        console.log('🎤 Voice disconnected');
    }
}

export function isVoiceActive() {
    return isVoiceActive;
}