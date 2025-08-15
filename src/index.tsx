import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

// Type definitions for Cloudflare environment
type Bindings = {
  OPENAI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Use JSX renderer
app.use(renderer)

// API route for plant bot chat
app.post('/api/chat', async (c) => {
  try {
    const { message, image } = await c.req.json()
    
    // Get OpenAI API key from environment variables
    const openaiApiKey = c.env?.OPENAI_API_KEY
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      return c.json({
        success: false,
        error: 'OpenAI API key not configured. Please contact support.'
      }, 500)
    }

    // Plant expert system prompt
    const systemPrompt = `You are an expert houseplant care specialist and botanist with over 20 years of experience helping people care for their indoor plants. Your name is PlantBot and you're friendly, knowledgeable, and encouraging.

Your expertise includes:
- Plant identification and care requirements
- Diagnosing plant health issues (yellowing leaves, brown tips, drooping, etc.)
- Watering schedules and techniques
- Light requirements and placement
- Soil types and fertilization
- Pest identification and treatment
- Repotting and propagation
- Seasonal care adjustments

Always provide:
- Clear, actionable advice
- Specific steps the user can take
- Warning signs to watch for
- Encouragement and reassurance
- Brief explanations of why certain care practices work

Keep responses concise but thorough (2-4 sentences usually). Use a warm, encouraging tone. If you're not certain about something, say so and suggest consulting with a local plant expert or extension office.

If the user mentions specific plant names, provide care advice specific to that plant type. If they describe symptoms, help diagnose the likely cause and provide solutions.`

    // Prepare the user message
    let userContent = message
    
    // If image is provided, mention it in the message
    if (image) {
      userContent = `I'm sharing a photo of my plant. ${message || 'Can you help me understand what might be wrong or how to care for it better?'}`
    }

    // Make request to OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Fast and cost-effective model, good for plant advice
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userContent
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      
      // Provide helpful fallback responses
      const fallbackResponses = [
        "I'm having trouble connecting to my plant expertise database right now. For general plant care, make sure your plant has appropriate light, water when the top inch of soil is dry, and check for pests regularly.",
        "My plant knowledge system is temporarily unavailable. In the meantime, check if your plant needs water by sticking your finger into the soil about 1-2 inches deep.",
        "I'm experiencing a connection issue. For most houseplants: bright, indirect light works best, water when soil starts to dry out, and maintain humidity around 40-60%."
      ]
      
      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
      
      return c.json({
        success: true,
        response: fallbackResponse + " Please try asking again in a moment!",
        timestamp: new Date().toISOString(),
        fallback: true
      })
    }

    const data = await openaiResponse.json()
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API')
    }

    const plantExpertResponse = data.choices[0].message.content.trim()

    return c.json({
      success: true,
      response: plantExpertResponse,
      timestamp: new Date().toISOString(),
      tokens_used: data.usage?.total_tokens || 0
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Provide helpful fallback response instead of generic error
    const helpfulFallbacks = [
      "I'm having trouble right now, but here's some general advice: Check your plant's soil moisture by inserting your finger 1-2 inches deep. If it's dry, water thoroughly until water drains from the bottom.",
      "I'm experiencing technical difficulties. While I recover, remember most houseplants prefer bright, indirect light and should be watered when the top inch of soil feels dry.",
      "Sorry, I'm having connection issues! Quick tip: If your plant has yellow leaves, it could be overwatering (most common) or underwatering. Check the soil moisture to determine which."
    ]
    
    const fallbackResponse = helpfulFallbacks[Math.floor(Math.random() * helpfulFallbacks.length)]
    
    return c.json({
      success: true,
      response: fallbackResponse + " Please try your question again!",
      timestamp: new Date().toISOString(),
      fallback: true
    })
  }
})

// API route for plant care tips
app.get('/api/tips', (c) => {
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
    }
  ]
  
  return c.json({ tips })
})

// Main app route
app.get('/', (c) => {
  return c.render(
    <div>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        {/* Header */}
        <header className="bg-green-600 text-white p-4 shadow-lg">
          <div className="flex items-center justify-center">
            <div className="text-2xl mr-3">🌱</div>
            <h1 className="text-xl font-bold">Home Plant Bot</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 pb-20">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Welcome to your AI Plant Helper! 🌿</h2>
            <p className="text-gray-600 text-sm">
              Get instant help with your houseplant care. Ask questions, upload photos, and receive expert advice.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button 
              onclick="startChat()"
              className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center"
            >
              <span className="mr-2">💬</span>
              Ask Bot
            </button>
            <button 
              onclick="showTips()"
              className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center"
            >
              <span className="mr-2">💡</span>
              Care Tips
            </button>
          </div>

          {/* Feature Cards */}
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-400">
              <h3 className="font-medium text-gray-800 mb-1">🤖 AI Plant Expert</h3>
              <p className="text-gray-600 text-sm">Get instant answers to your plant care questions</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
              <h3 className="font-medium text-gray-800 mb-1">📸 Photo Analysis</h3>
              <p className="text-gray-600 text-sm">Upload photos for plant problem diagnosis</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-400">
              <h3 className="font-medium text-gray-800 mb-1">📚 Expert Tips</h3>
              <p className="text-gray-600 text-sm">Browse our library of plant care guides</p>
            </div>
          </div>
        </main>

        {/* Chat Interface (Initially Hidden) */}
        <div id="chatInterface" className="fixed inset-0 bg-white z-50 hidden">
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <header className="bg-green-600 text-white p-4 flex items-center shadow-lg">
              <button 
                onclick="closeChat()"
                className="mr-3 p-1 hover:bg-green-700 rounded"
              >
                ←
              </button>
              <div className="text-xl mr-3">🌱</div>
              <h1 className="text-lg font-bold">Plant Bot Chat</h1>
            </header>

            {/* Chat Messages */}
            <div id="chatMessages" className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="bg-green-100 rounded-lg p-3 max-w-xs">
                <p className="text-sm text-gray-800">
                  Hi! I'm your AI plant expert. How can I help you today? 🌿
                </p>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex space-x-2">
                <input 
                  type="file" 
                  id="imageInput" 
                  accept="image/*" 
                  className="hidden"
                  onchange="handleImageUpload(this)"
                />
                <button 
                  onclick="document.getElementById('imageInput').click()"
                  className="bg-gray-300 hover:bg-gray-400 p-3 rounded-lg"
                >
                  📷
                </button>
                <input 
                  type="text" 
                  id="messageInput" 
                  placeholder="Ask about your plants..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  onkeypress="if(event.key==='Enter') sendMessage()"
                />
                <button 
                  onclick="sendMessage()"
                  className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Interface (Initially Hidden) */}
        <div id="tipsInterface" className="fixed inset-0 bg-white z-50 hidden">
          <div className="flex flex-col h-full">
            {/* Tips Header */}
            <header className="bg-blue-600 text-white p-4 flex items-center shadow-lg">
              <button 
                onclick="closeTips()"
                className="mr-3 p-1 hover:bg-blue-700 rounded"
              >
                ←
              </button>
              <div className="text-xl mr-3">💡</div>
              <h1 className="text-lg font-bold">Plant Care Tips</h1>
            </header>

            {/* Tips Content */}
            <div id="tipsContent" className="flex-1 overflow-y-auto p-4">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🌿</div>
                <p className="text-gray-600">Loading tips...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Install Prompt (PWA) - Initially Hidden */}
        <div id="installPrompt" className="fixed bottom-4 left-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Install App</h3>
              <p className="text-sm opacity-90">Add to home screen for quick access</p>
            </div>
            <div className="flex space-x-2">
              <button onclick="dismissInstallPrompt()" className="text-green-200 hover:text-white">✕</button>
              <button onclick="installApp()" className="bg-white text-green-600 px-3 py-1 rounded font-medium">Install</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default app
