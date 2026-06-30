# Utility Tools Hub

Utility Tools Hub is a modern, full-stack application offering a suite of useful media tools, featuring a beautiful glassmorphism UI. This repository is structured as a monorepo containing a React frontend and a NestJS backend.

## 🚀 Features

- **Video Downloader**: Download videos and extract audio from various sources in multiple qualities.
- **Audio Tool**: Process and manipulate audio files seamlessly.
- **Image Tool**: Handle image processing tasks directly from the dashboard.
- **Modern Dashboard UI**: A highly responsive, sleek glassmorphism-inspired design with customized themes and interactive elements.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: Vanilla CSS with modern Glassmorphism, tailored HSL color palettes, and fluid animations.
- **Icons**: Lucide React

### Backend
- **Framework**: [NestJS 11](https://nestjs.com/)
- **Language**: TypeScript
- **Media Processing**: `fluent-ffmpeg`, `@ffmpeg-installer/ffmpeg`
- **Downloading engine**: `youtube-dl-exec`
- **Upload handling**: `multer`

## 📁 Project Structure

```text
utility-tools/
├── frontend/          # React + Vite application
├── backend/           # NestJS API server
├── package.json       # Monorepo scripts
└── start_app.bat      # Windows startup script
```

## ⚙️ Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **FFmpeg**: Handled automatically via `@ffmpeg-installer/ffmpeg` for basic usage, but having it installed globally on your system is recommended for advanced media processing.

## 📦 Installation

1. Clone this repository (or navigate to the project directory):
   ```bash
   cd utility-tools
   ```

2. Install dependencies for both frontend and backend using the monorepo script:
   ```bash
   npm run install-all
   ```
   *(Alternatively, you can manually `npm install` inside both the `frontend` and `backend` directories).*

## 🏃‍♂️ Running the Application

### Using the Batch Script (Windows)
You can easily start the application by running the provided batch file:
```bash
./start_app.bat
```

### Using NPM Scripts
To start both the frontend and backend concurrently in development mode from the root directory:
```bash
npm run dev
```

If you prefer to start them separately:
- **Frontend**: `cd frontend && npm run dev` (Runs on Vite default port, e.g., 5173)
- **Backend**: `cd backend && npm run start:dev` (Runs on NestJS default port, e.g., 3000)

## 🏗️ Build for Production

To build both projects for production:
```bash
npm run build-all
```

## 🎨 UI/UX Design

The application features a premium UI focused on visual excellence:
- **Glassmorphism**: Translucent panels with blur effects to create depth.
- **Tailored Palettes**: Deep dark backgrounds (`#060910`) contrasting with vibrant glowing accents (Royal Purple & Cyber Cyan).
- **Micro-interactions**: Smooth hover transitions, animated glowing blobs, and custom scrollbars to make the interface feel alive and responsive.
