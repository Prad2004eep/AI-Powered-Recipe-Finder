# AI-Powered Recipe Finder 🍛

![RecipeMagic Logo](https://img.shields.io/badge/AI--Powered%20Recipe%20Finder-blue?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/license-MIT-green.svg)
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

3. **Configure API Keys**:
   - Create a `.env` file in the project root:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```
   - Or edit `script.js` and replace the placeholder API keys:
   ```javascript
   const GROQ_API_KEY = 'your-groq-api-key-here';
   const YOUTUBE_API_KEY = 'your-youtube-api-key-here';
   ```

## 🔧 Configuration

### API Setup

1. **GROQ API Key**:
   - Visit [GROQ Console](https://console.groq.com/)
   - Create a new API key
   - Replace the placeholder in `script.js` line 19

2. **YouTube Data API Key**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable YouTube Data API v3
   - Create an API key
   - Replace the placeholder in `script.js` line 20

### Environment Variables
For production deployment, you can use environment variables:
```javascript
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'your-fallback-key';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'your-fallback-key';
```

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

# Install dependencies (if using package.json)
npm install

# Start development server
npm start
# Or using Python
python -m http.server 8000
# Or using Node.js serve
npx serve .
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
GROQ_API_KEY=your_development_key
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
- `GROQ_API_KEY`: Your GROQ API key
- `YOUTUBE_API_KEY`: Your YouTube Data API key
- `NODE_ENV`: Set to 'production'

## 🔒 Security Considerations

### API Key Protection
- Never commit API keys to version control
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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
- 🌐 Visit our [website](https://yourwebsite.com) for live demo
- 🐦 Follow us on [Twitter](https://twitter.com/yourhandle) for updates

---

<div align="center">

### 🌟 If this project helped you, please give it a star!

[![Star History Chart](https://api.star-history.com/button.svg?url=https://github.com/Prad2004eep/AI-Powered-Recipe-Finder&style=flat)]

Made with ❤️ by [Prad2004eep](https://github.com/Prad2004eep)

[⬆ Back to top](#readme)

</div>
