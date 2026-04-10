# AI-Powered Recipe Finder 🍛

![RecipeMagic Logo](https://img.shields.io/badge/AI--Powered%20Recipe%20Finder-blue?style=for-the-badge&logo=react)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3)

A modern, intelligent web application that transforms your ingredients into delicious Indian recipes using AI-powered technology. Features voice input, image recognition, video tutorials, and smart cooking timers.

## ✨ Features

### 🤖 AI-Powered Recipe Generation
- **GROQ AI Integration**: Advanced AI trained on thousands of authentic Indian recipes
- **Smart Ingredient Analysis**: Understands ingredient combinations and cooking methods
- **Recipe Customization**: Adjust recipes for dietary preferences (vegetarian, vegan, keto, gluten-free)
- **Intelligent Scaling**: Automatically adjusts quantities based on serving size
- **Authentic Indian Cuisine**: Specializes in traditional Indian cooking techniques and flavors

### 📸 Image Recognition Technology
- **Ingredient Recognition**: Upload photos of ingredients and let AI identify them
- **Dish Recreation**: Take a photo of any Indian dish and get step-by-step recreation instructions
- **Drag & Drop Interface**: Easy file upload with visual feedback
- **Real-time Processing**: Instant AI analysis with detailed results
- **Multi-format Support**: Works with JPEG, PNG, WebP, and other common formats

### 🎤 Voice Input System
- **Hands-Free Operation**: Speak ingredients instead of typing
- **Natural Language Processing**: Understands spoken ingredient lists
- **Multi-language Support**: Works with various accents and pronunciations
- **Kitchen-Friendly**: Perfect for when your hands are messy from cooking
- **Real-time Transcription**: Converts speech to text instantly

### 📺 Video Tutorial Integration
- **YouTube API Integration**: Automatically finds relevant cooking videos
- **Step-by-Step Guidance**: Professional video tutorials for every recipe
- **In-App Video Player**: Watch tutorials without leaving the application
- **Recipe Matching**: Videos are matched to specific dishes and techniques
- **High Quality Content**: Curated cooking tutorials from expert chefs

### ⏰ Smart Cooking Timer System
- **Multi-Timer Support**: Manage multiple cooking times simultaneously
- **Visual Warnings**: Color-coded alerts at critical time intervals
- **Named Timers**: Label each timer (e.g., "Rice," "Curry," "Dal")
- **Independent Controls**: Separate start, pause, reset for each timer
- **Audio Alerts**: Optional sound notifications for timer completion

### 💾 Favorites & Storage
- **Local Storage**: Save favorite recipes directly on your device
- **Offline Access**: View saved recipes without internet connection
- **Quick Access**: One-click access to your go-to recipes
- **No Account Required**: Complete privacy and data ownership
- **Recipe History**: Automatically tracks recently viewed recipes

### 🎨 Modern UI/UX Design
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode**: Eye-friendly theme for low-light cooking environments
- **Smooth Animations**: Beautiful transitions and micro-interactions
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Glassmorphism Effects**: Modern frosted glass design elements
- **Intuitive Navigation**: Clear user flow and logical menu structure

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection for AI features
- Microphone access (for voice input)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Prad2004eep/AI-Powered-Recipe-Finder.git
   cd AI-Powered-Recipe-Finder
   ```

2. **Open the application**:
   ```bash
   # Simply open index.html in your web browser
   # Or use a local server for development
   python -m http.server 8000
   # Or with Node.js
   npx serve .
   ```

3. **Configure environment variables**:
   - Create a `.env` file in the project root:
   ```env
   APP_ENV=development
   PORT=3000
   ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   API_PROXY_BASE_URL=http://localhost:3000/api
   RECIPE_API_URL=https://api.groq.com/openai/v1/chat/completions
   RECIPE_API_KEY=your_recipe_api_key_here
   RECIPE_API_MODEL=llama-3.1-8b-instant
   YOUTUBE_API_URL=https://www.googleapis.com/youtube/v3/search
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```
   - Install tooling and generate browser-safe runtime config:
   ```bash
   npm install
   npm run build:config
   ```
   - Start the backend proxy:
   ```bash
   npm start
   ```
   - `config.js` contains only public runtime values.
   - Real API keys stay in `.env`, GitHub Secrets, or the backend runtime.

## 🔧 Configuration

### API Setup

1. **Recipe API Key**:
   - Visit [GROQ Console](https://console.groq.com/)
   - Create a new API key
   - Save it as `RECIPE_API_KEY`
   - Do not expose it in browser JavaScript

2. **YouTube Data API Key**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable YouTube Data API v3
   - Create an API key
   - Save it as `YOUTUBE_API_KEY`
   - Prefer routing it through the same proxy used by the app

### Environment Variables
For production deployment, use environment variables and generate the public runtime config from them:
```bash
APP_ENV=production
API_PROXY_BASE_URL=https://your-proxy.example.com/api
RECIPE_API_URL=https://api.groq.com/openai/v1/chat/completions
RECIPE_API_KEY=your_recipe_api_key
RECIPE_API_MODEL=llama-3.1-8b-instant
YOUTUBE_API_KEY=your_youtube_api_key
```

### Security Model
- Browser code reads only `config.js`, which contains public runtime values only.
- Real keys are stored in `.env` and consumed by the backend or serverless runtime.
- The backend exposes `/api/recipe`, `/api/youtube-search`, and `/api/health`.
- `api/index.js` is included so the same proxy can be deployed as a Vercel-style serverless function.

## CI/CD Pipeline

- Workflow file: `.github/workflows/deploy.yml`
- Trigger: every push to `main`
- Stages:
  - ESLint linting
  - TruffleHog secret scanning
  - Start local backend in CI
  - Validate backend API routes through `test-api.js`
  - Static deployment to the `gh-pages` branch

### Required GitHub Configuration
- Repository variable:
  - `API_PROXY_BASE_URL`
- Repository secrets:
  - `RECIPE_API_URL`
  - `RECIPE_API_KEY`
  - `RECIPE_API_MODEL`
  - `YOUTUBE_API_KEY`
- In GitHub Pages settings, select the `gh-pages` branch.

### Backend Deployment Options
- Local/backend host: run `npm start` with `.env`
- Serverless: deploy `api/index.js` to Vercel and set the same environment variables there
- Separate frontend host: set `API_PROXY_BASE_URL` to your deployed backend URL

## 📖 Usage Guide

### Basic Recipe Generation
1. Click "Start Cooking" on the landing page
2. Add ingredients you have at home
3. Set the number of servings needed
4. Click "Generate Recipe" to create your custom recipe
5. Follow step-by-step instructions with video tutorials

### Voice Input Method
1. Click the microphone button instead of typing
2. Speak your ingredients clearly
3. AI will process your voice input automatically
4. Generate recipe as usual

### Photo Upload Method
1. Click "Photo" in the navigation menu
2. Choose "Ingredient Recognition" or "Dish Recreation"
3. Upload a clear photo of ingredients or dish
4. AI analyzes the image and generates appropriate recipes
5. Follow the generated instructions

### Advanced Features
- **Dietary Filters**: Set preferences for vegetarian, vegan, keto, gluten-free
- **Recipe Remix**: Transform recipes to be healthier, spicier, or suit different needs
- **Multi-Timer System**: Manage multiple cooking times for complex recipes
- **Step-by-Step Mode**: Follow recipes with guided cooking stages
- **AI Chat Assistant**: Get cooking tips and ingredient substitutions

## 🏗️ Technical Architecture

### Frontend Technologies
- **HTML5**: Semantic markup with modern web standards
- **CSS3**: Responsive design with animations and transitions
- **JavaScript ES6+**: Modern JavaScript with async/await and modules
- **Font Awesome 6**: Comprehensive icon library
- **Google Fonts**: Poppins font family for typography

### APIs & Services
- **GROQ AI**: Advanced language model for recipe generation
- **YouTube Data API v3**: Video tutorial integration
- **Web Speech API**: Voice input recognition
- **FileReader API**: Image upload and processing
- **LocalStorage**: Client-side data persistence
- **Service Workers**: Offline functionality and caching

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer: Not supported

## 📁 Project Structure

```
AI-Powered-Recipe-Finder/
├── index.html              # Main application entry point
├── style.css              # Complete styling and responsive design
├── script.js              # Core application logic and API integrations
├── README.md              # This documentation file
├── SECURITY.md            # Security guidelines and best practices
├── .gitignore            # Git ignore rules for security
└── assets/                # Static assets (images, icons, etc.)
    ├── icons/            # Application icons and graphics
    └── images/           # Sample images and placeholders
```

## Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/RecipeMagic.git
cd RecipeMagic

# Install dependencies
npm install

# Generate browser config and start backend
npm run build:config
npm start
```

### Building for Production
```bash
# Minify CSS and JavaScript
npm run build

# Optimize images
npm run optimize

# Generate production build
npm run build:prod
```

### Environment Configuration
Create a `.env` file for local development:
```
APP_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
API_PROXY_BASE_URL=http://localhost:3000/api
RECIPE_API_URL=https://api.groq.com/openai/v1/chat/completions
RECIPE_API_KEY=your_development_key
RECIPE_API_MODEL=llama-3.1-8b-instant
YOUTUBE_API_URL=https://www.googleapis.com/youtube/v3/search
YOUTUBE_API_KEY=your_youtube_api_key
```

## 📊 API Usage & Limits

### GROQ AI API
- **Rate Limit**: 100 requests per minute
- **Token Limit**: 150,000 tokens per request
- **Models**: llama-3.1-8b-instant (default)
- **Cost**: Pay-as-you-go pricing model

### YouTube Data API
- **Quota**: 10,000 units per day (default)
- **Cost**: Free tier available with usage-based pricing
- **Features**: Video search, metadata retrieval
- **Rate Limit**: 100 requests per 100 seconds per user

## 🧪 Testing

### Running Tests
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- Unit Tests: Core JavaScript functions
- Integration Tests: API interactions and data flow
- E2E Tests: Complete user workflows
- Accessibility Tests: WCAG compliance verification

## 🚀 Deployment

### Static Hosting
```bash
# Build for production
npm run build

# Deploy to Netlify
npm run deploy:netlify

# Deploy to Vercel
npm run deploy:vercel

# Deploy to GitHub Pages
npm run deploy:gh-pages
```

### Server Deployment
```bash
# Deploy to Node.js server
npm run build:server
npm start:prod

# Deploy with Docker
docker build -t ai-powered-recipe-finder .
docker run -p 8080:8080 ai-powered-recipe-finder
```

### Environment Variables
Set these in your hosting environment:
- `RECIPE_API_KEY`: Your recipe generation API key
- `RECIPE_API_URL`: The recipe generation endpoint
- `RECIPE_API_MODEL`: The recipe model used in validation
- `YOUTUBE_API_KEY`: Your YouTube Data API key
- `API_PROXY_BASE_URL`: Public URL of your backend or serverless proxy
- `NODE_ENV`: Set to 'production'

## 🔒 Security Considerations

### API Key Protection
- Never commit API keys to version control
- Never inject real API keys into browser JavaScript
- Use environment variables in production
- Implement rate limiting on server-side (if applicable)
- Regular key rotation recommended

### Data Privacy
- All data stored locally in browser
- No user tracking or analytics collection
- No third-party data sharing
- GDPR compliant design

### Input Validation
- Sanitize all user inputs
- Validate file uploads (type, size, format)
- Prevent XSS attacks with proper escaping
- Rate limiting for API requests

## 🐛 Troubleshooting

### Common Issues

#### Recipe Generation Problems
**Problem**: API errors or failed generation
**Solutions**:
- Check internet connection
- Verify API keys are correctly configured
- Ensure GROQ API quota is not exceeded
- Check browser console for error messages

#### Voice Input Issues
**Problem**: Microphone not working
**Solutions**:
- Check browser microphone permissions
- Ensure HTTPS connection (required for microphone access)
- Test with different browsers
- Check Web Speech API compatibility

#### Image Upload Problems
**Problem**: Images not recognized
**Solutions**:
- Use better lighting and clearer photos
- Ensure images are under 5MB in size
- Try with different image formats (JPEG, PNG)
- Check browser file upload permissions

#### Timer Issues
**Problem**: Timer not functioning
**Solutions**:
- Refresh the page and try again
- Check browser JavaScript is enabled
- Clear browser cache and cookies
- Test in incognito/private browsing mode

### Performance Optimization
- Enable browser caching for static assets
- Minimize API calls with debouncing
- Use lazy loading for images
- Implement service worker for offline functionality

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ES6+ JavaScript features
- Follow CSS BEM methodology
- Maintain responsive design principles
- Add comments for complex logic
- Ensure accessibility compliance

### Feature Requests
- Open an issue with the "enhancement" label
- Provide detailed requirements and use cases
- Include mockups or designs if applicable
- Discuss implementation approach before starting

### Bug Reports
- Use the issue template for bug reports
- Include browser, OS, and device information
- Provide steps to reproduce the issue
- Include expected vs actual behavior
- Add screenshots or screen recordings if possible

## 🙏 Acknowledgments

- **GROQ**: For providing the amazing AI technology
- **YouTube**: For video tutorial integration
- **Font Awesome**: For the beautiful icon set
- **Google Fonts**: For the Poppins font family
- **Open Source Community**: For inspiration and best practices

## 📞 Support

### Getting Help
- 📖 Check this README for common solutions
- 🐛 Open an issue on GitHub for bug reports
- 💬 Start a discussion for feature requests
- 📧 Check the [Issues](../../issues) page for known problems

### Contact
- 📧 Create an issue for technical support

---

<div align="center">

### 🌟 If this project helped you, please give it a star!

Made with ❤️ by [Prad2004eep](https://github.com/Prad2004eep)

[⬆ Back to top](#readme)

</div>
