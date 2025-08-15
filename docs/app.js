// Home Plant Bot Mobile App JavaScript - GitHub Pages Version

// Configuration
const API_CONFIG = {
    // Backend API endpoint - will be configured with your backend service
    CHAT_ENDPOINT: '/api/chat', // This will be handled by your backend
    // Note: Never expose API keys in client-side code
};

// Global state
let deferredPrompt;
let chatHistory = [];

// PWA Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

function showInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    if (installPrompt) {
        installPrompt.classList.remove('hidden');
        installPrompt.classList.add('install-pulse');
    }
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
            dismissInstallPrompt();
        });
    }
}

function dismissInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    if (installPrompt) {
        installPrompt.classList.add('hidden');
    }
}

// Chat Interface Functions
function startChat() {
    const chatInterface = document.getElementById('chatInterface');
    if (chatInterface) {
        chatInterface.classList.remove('hidden');
        setTimeout(() => {
            const messageInput = document.getElementById('messageInput');
            if (messageInput) messageInput.focus();
        }, 100);
    }
}

function closeChat() {
    const chatInterface = document.getElementById('chatInterface');
    if (chatInterface) {
        chatInterface.classList.add('hidden');
    }
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    messageInput.value = '';
    addChatMessage(message, 'user');
    
    const typingId = addTypingIndicator();
    
    try {
        const response = await callPlantExpertAPI(message);
        removeTypingIndicator(typingId);
        addChatMessage(response, 'bot');
    } catch (error) {
        removeTypingIndicator(typingId);
        console.error('Chat error:', error);
        
        const fallbackResponses = [
            "I'm having trouble connecting right now. For general plant care: water when the top inch of soil is dry, provide bright indirect light, and maintain humidity around 40-60%.",
            "Connection issue detected. Quick tip: Yellow leaves often indicate overwatering (most common) or underwatering. Check soil moisture to determine which.",
            "I'm experiencing technical difficulties. Remember: most houseplants prefer to dry out slightly between waterings and thrive in bright, indirect light."
        ];
        
        const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        addChatMessage(fallbackResponse + " Please try again!", 'bot');
    }
}

async function callPlantExpertAPI(message) {
    // For now, provide intelligent plant care responses based on common scenarios
    // This will be replaced with your actual backend API integration
    
    const expertResponses = {
        // Watering issues
        'yellow': "Yellow leaves often indicate overwatering, which is very common! Check if the soil feels soggy or if there's water sitting in the saucer. Let the soil dry out completely before watering again, and ensure your pot has drainage holes. If the yellowing continues, it might be a nutrient deficiency.",
        'brown': "Brown tips usually mean low humidity or water quality issues. Try using filtered water and increase humidity around your plant with a pebble tray or humidifier. If the brown is spreading, check for overwatering or pests.",
        'drooping': "Drooping can mean your plant needs water OR is getting too much! Check the soil - if it's dry, give it a thorough drink. If it's wet, you may be overwatering. Also check if it's getting too much direct sun.",
        'water': "Most houseplants prefer to dry out slightly between waterings. Stick your finger 1-2 inches into the soil - if it's dry, it's time to water! Water thoroughly until it drains from the bottom, then empty the saucer.",
        'light': "Most houseplants thrive in bright, indirect light. If you can comfortably read a book in that spot, it's usually good for plants! Avoid direct sunlight which can scorch leaves, except for succulents and cacti.",
        'fertilizer': "Feed your plants monthly during spring and summer with a diluted liquid fertilizer. Use about 1/4 strength of what the package recommends - it's better to underfeed than overfeed! Skip fertilizing in fall and winter when growth slows.",
        // Plant-specific advice
        'snake': "Snake plants are very forgiving! Water them every 2-6 weeks, letting soil dry completely between waterings. They tolerate low light but prefer bright, indirect light. Yellow leaves usually mean overwatering.",
        'monstera': "Monsteras love humidity and bright, indirect light. Water when the top inch of soil is dry. Brown tips often indicate low humidity - try a humidifier or pebble tray. They also love to climb!",
        'pothos': "Pothos are nearly indestructible! They can handle low light and irregular watering. Water when soil feels dry. Yellow leaves usually mean overwatering. They grow quickly and love to trail or climb.",
        'succulent': "Succulents need bright light and infrequent watering. Wait until soil is completely dry, then water deeply. Most prefer temperatures above 60°F and good air circulation. Overwatering is the #1 killer!",
        // General advice
        'default': "I'd be happy to help with your plant care! For the best advice, could you tell me more about what you're seeing? Is it about watering, light, or a specific problem with the leaves? Also, what type of plant are you caring for?"
    };
    
    // Simple keyword matching for plant advice
    const lowerMessage = message.toLowerCase();
    
    for (const [keyword, response] of Object.entries(expertResponses)) {
        if (lowerMessage.includes(keyword)) {
            return response + " Feel free to ask more specific questions about your plant care! 🌿";
        }
    }
    
    // Return default helpful response
    return expertResponses.default;
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    
    if (sender === 'user') {
        messageDiv.className = 'bg-green-500 text-white rounded-lg p-3 max-w-xs ml-auto';
    } else {
        messageDiv.className = 'bg-gray-100 rounded-lg p-3 max-w-xs';
    }
    
    messageDiv.innerHTML = `<p class="text-sm">${escapeHtml(message)}</p>`;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    chatHistory.push({ message, sender, timestamp: new Date() });
}

function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    const typingId = 'typing-' + Date.now();
    
    typingDiv.id = typingId;
    typingDiv.className = 'bg-gray-100 rounded-lg p-3 max-w-xs';
    typingDiv.innerHTML = `
        <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingId;
}

function removeTypingIndicator(typingId) {
    const typingDiv = document.getElementById(typingId);
    if (typingDiv) {
        typingDiv.remove();
    }
}

// Image Upload Handler
function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imagePreview = document.createElement('div');
        imagePreview.className = 'bg-green-500 text-white rounded-lg p-3 max-w-xs ml-auto mb-3';
        imagePreview.innerHTML = `
            <img src="${e.target.result}" class="image-preview mb-2" alt="Uploaded plant image">
            <p class="text-sm">Photo uploaded! Analyzing your plant...</p>
        `;
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.appendChild(imagePreview);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // For now, provide general photo analysis advice
        setTimeout(() => {
            const responses = [
                "Based on plant photos I've seen, here are some general tips: Check if leaves are vibrant green, look for any discoloration or pests, and ensure proper lighting conditions.",
                "When analyzing plant photos, I look for: leaf color and texture, soil moisture levels, pot size, and overall plant structure. Make sure your plant gets adequate light!",
                "From plant images, key indicators include: healthy green foliage, proper soil drainage, appropriate pot size, and no signs of pests or disease."
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addChatMessage(randomResponse + " Feel free to describe what you're seeing for more specific advice!", 'bot');
        }, 2000);
    };
    
    reader.readAsDataURL(file);
    input.value = '';
}

// Tips Interface Functions
function showTips() {
    const tipsInterface = document.getElementById('tipsInterface');
    if (tipsInterface) {
        tipsInterface.classList.remove('hidden');
        loadTips();
    }
}

function closeTips() {
    const tipsInterface = document.getElementById('tipsInterface');
    if (tipsInterface) {
        tipsInterface.classList.add('hidden');
    }
}

function loadTips() {
    const tipsContent = document.getElementById('tipsContent');
    
    const tips = [
        {
            id: 1,
            title: "Watering Basics",
            content: "Most houseplants prefer to dry out slightly between waterings. Check soil moisture before watering.",
            category: "watering"
        },
        {
            id: 2,
            title: "Light Requirements",
            content: "Most houseplants thrive in bright, indirect light. Avoid direct sunlight which can scorch leaves.",
            category: "lighting"
        },
        {
            id: 3,
            title: "Humidity Levels",
            content: "Many houseplants benefit from 40-60% humidity. Use a humidifier or pebble tray to increase moisture.",
            category: "humidity"
        },
        {
            id: 4,
            title: "Fertilizing Guide",
            content: "Feed houseplants monthly during growing season (spring/summer) with diluted liquid fertilizer.",
            category: "nutrition"
        },
        {
            id: 5,
            title: "Repotting Signs",
            content: "Repot when roots emerge from drainage holes or soil dries out very quickly after watering.",
            category: "maintenance"
        },
        {
            id: 6,
            title: "Common Problems",
            content: "Yellow leaves = overwatering, Brown tips = low humidity, Drooping = needs water or too much light.",
            category: "troubleshooting"
        }
    ];
    
    tipsContent.innerHTML = tips.map(tip => `
        <div class="bg-white rounded-lg p-4 mb-4 shadow-sm border-l-4 border-blue-400">
            <h3 class="font-semibold text-gray-800 mb-2">${escapeHtml(tip.title)}</h3>
            <p class="text-gray-600 text-sm mb-2">${escapeHtml(tip.content)}</p>
            <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                ${escapeHtml(tip.category)}
            </span>
        </div>
    `).join('');
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Show install prompt after delay
    setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches && !deferredPrompt) {
            showInstallPrompt();
        }
    }, 5000);
});

// PWA event handlers
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    dismissInstallPrompt();
});

window.addEventListener('online', () => {
    console.log('Back online');
});

window.addEventListener('offline', () => {
    console.log('Gone offline');
    addChatMessage('You are currently offline. Some features may not work properly.', 'bot');
});

// Prevent zoom on input focus (iOS)
document.addEventListener('touchstart', function() {}, {passive: true});