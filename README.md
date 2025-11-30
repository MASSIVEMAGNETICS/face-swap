# Face Swap Studio

<p align="center">
  <strong>Production-Ready Face Swap Studio Suite</strong><br>
  Professional face swapping application for Windows 10 and Web
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/platform-Windows%2010%20%7C%20Web-lightgrey.svg" alt="Platform">
</p>

---

## 🚀 Features

- **AI-Powered Face Detection**: Advanced face detection using machine learning algorithms
- **High-Quality Face Swapping**: Seamless face swap with expression preservation
- **Multi-Platform Support**: Web application and native Windows 10 desktop app
- **Real-Time Preview**: See results before processing
- **Batch Processing**: Process multiple images at once
- **Video Support**: Swap faces in video files
- **Project Management**: Organize and manage your face swap projects
- **Export Options**: Multiple output formats (PNG, JPEG, WebP)
- **Secure & Private**: Your images are processed securely

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Web Application](#web-application)
- [Desktop Application](#desktop-application)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Operating System**: 
  - Web: Any modern browser
  - Desktop: Windows 10 (64-bit)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/face-swap-studio.git
cd face-swap-studio
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 3. Configure Environment

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=12

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_TEMP_DIR=uploads/temp
UPLOAD_PROCESSED_DIR=uploads/processed

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

## 🚀 Quick Start

### Development Mode

Run both backend and frontend in development mode:

```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:3001`
- Frontend dev server on `http://localhost:3000`

### Production Mode

```bash
# Build the frontend
npm run build:frontend

# Start the production server
npm run start
```

## 📁 Project Structure

```
face-swap-studio/
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── app.js           # Main application
│   ├── tests/               # Test files
│   ├── uploads/             # File upload directory
│   └── package.json
│
├── frontend/                 # React.js web application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── styles/          # CSS styles
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx          # Main component
│   ├── index.html
│   └── package.json
│
├── desktop/                  # Electron desktop application
│   ├── src/
│   │   ├── main.js          # Main process
│   │   └── preload.js       # Preload script
│   ├── resources/           # App resources (icons)
│   └── package.json
│
├── docs/                     # Documentation
├── shared/                   # Shared code/types
├── package.json              # Root package.json
└── README.md
```

## 🌐 Web Application

The web application is built with:
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client

### Features

1. **Authentication**
   - User registration and login
   - JWT-based authentication
   - Profile management

2. **Dashboard**
   - Project overview
   - Quick actions
   - Statistics

3. **Studio**
   - Drag and drop image upload
   - Face detection
   - Swap settings customization
   - Real-time processing

4. **Projects**
   - Create and manage projects
   - View history
   - Export results

## 💻 Desktop Application

The Windows 10 desktop application is built with Electron and includes:
- Native window controls
- File system integration
- Offline support
- System tray integration

### Building the Desktop App

```bash
# Build frontend first
npm run build:frontend

# Build Windows installer
npm run build:desktop
```

The installer will be created in `desktop/dist/`.

## 📡 API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/me` | PUT | Update profile |
| `/api/auth/password` | PUT | Change password |

### Projects

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | List all projects |
| `/api/projects` | POST | Create new project |
| `/api/projects/:id` | GET | Get project by ID |
| `/api/projects/:id` | PUT | Update project |
| `/api/projects/:id` | DELETE | Delete project |
| `/api/projects/stats` | GET | Get user statistics |

### Upload

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload/source` | POST | Upload source image |
| `/api/upload/target` | POST | Upload target image |
| `/api/upload/pair` | POST | Upload image pair |
| `/api/upload/detect-faces` | POST | Detect faces in image |

### Face Swap

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/swap/:projectId` | POST | Execute face swap |
| `/api/swap/result/:id` | GET | Get swap result |
| `/api/swap/download/:id` | GET | Download result |

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
cd backend && npm run test
```

## 🔒 Security

This application implements several security measures:

- **Authentication**: JWT-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Joi schema validation
- **File Validation**: MIME type and size checking
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

## 🚀 Deployment

### Manual Deployment

1. Set `NODE_ENV=production`
2. Configure environment variables
3. Build frontend: `npm run build:frontend`
4. Start server: `npm run start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by the Face Swap Studio Team
</p>
