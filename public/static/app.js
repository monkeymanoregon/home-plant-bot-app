// Home Plant Bot Mobile App JavaScript

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
    // Focus on input after animation
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
  
  // Clear input
  messageInput.value = '';
  
  // Add user message to chat
  addChatMessage(message, 'user');
  
  // Show typing indicator
  const typingId = addTypingIndicator();
  
  try {
    // Send to API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    const data = await response.json();
    
    // Remove typing indicator
    removeTypingIndicator(typingId);
    
    if (data.success) {
      addChatMessage(data.response, 'bot');
    } else {
      addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
  } catch (error) {
    removeTypingIndicator(typingId);
    addChatMessage('Connection error. Please check your internet and try again.', 'bot');
  }
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
  
  // Store in history
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
  
  // Create preview
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
    
    // Simulate image analysis (replace with actual API call)
    setTimeout(() => {
      const responses = [
        "Based on your photo, your plant looks healthy! The leaves appear vibrant and well-hydrated.",
        "I can see some yellowing in the lower leaves. This is often normal as plants age, but check your watering schedule.",
        "The brown tips on the leaves suggest low humidity. Try placing a humidifier nearby or using a pebble tray.",
        "Your plant appears to be stretching toward light. Consider moving it to a brighter location.",
        "Those spots on the leaves could indicate overwatering. Allow the soil to dry out more between waterings."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addChatMessage(randomResponse, 'bot');
    }, 2000);
  };
  
  reader.readAsDataURL(file);
  
  // Clear the input
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

async function loadTips() {
  const tipsContent = document.getElementById('tipsContent');
  
  try {
    const response = await fetch('/api/tips');
    const data = await response.json();
    
    if (data.tips) {
      tipsContent.innerHTML = data.tips.map(tip => `
        <div class="bg-white rounded-lg p-4 mb-4 shadow-sm border-l-4 border-blue-400">
          <h3 class="font-semibold text-gray-800 mb-2">${escapeHtml(tip.title)}</h3>
          <p class="text-gray-600 text-sm mb-2">${escapeHtml(tip.content)}</p>
          <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            ${escapeHtml(tip.category)}
          </span>
        </div>
      `).join('');
    }
  } catch (error) {
    tipsContent.innerHTML = `
      <div class="text-center py-8">
        <div class="text-4xl mb-4">⚠️</div>
        <p class="text-gray-600">Failed to load tips. Please try again.</p>
        <button onclick="loadTips()" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
          Retry
        </button>
      </div>
    `;
  }
}

// Utility Functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Keyboard event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Enter key support for message input
  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  // Show install prompt after delay if PWA not installed
  setTimeout(() => {
    if (!window.matchMedia('(display-mode: standalone)').matches && !deferredPrompt) {
      // Check if app is not already installed
      showInstallPrompt();
    }
  }, 5000);
});

// Handle app installation
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  dismissInstallPrompt();
});

// Network status handling
window.addEventListener('online', () => {
  console.log('Back online');
});

window.addEventListener('offline', () => {
  console.log('Gone offline');
  addChatMessage('You are currently offline. Some features may not work properly.', 'bot');
});

// Prevent zoom on input focus (iOS)
document.addEventListener('touchstart', function() {}, {passive: true});