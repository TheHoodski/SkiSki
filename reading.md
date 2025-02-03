# SkiCrowd

Real-time crowd tracking for Utah ski resorts using computer vision.

## Overview

SkiCrowd provides real-time base area crowding information for Utah ski resorts through automated camera feed analysis. The system processes public webcam feeds using computer vision to estimate crowd levels.

## Quick Start

1. Prerequisites
   - Node.js 18+
   - PostgreSQL
   - Redis
   - FFmpeg

2. Installation
```bash
# Clone the repository
git clone [your-repo-url]
cd skicrowd

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

3. Development
```bash
# Start development servers
npm run dev

# Run only frontend
npm run client

# Run only backend
npm run server
```

4. Building
```bash
npm run build
```

## Features

- Real-time crowd level monitoring
- Base area camera feed processing
- Simple, clean interface
- 48-hour historical data

## Tech Stack

- Frontend: React, TypeScript, Vite, TailwindCSS
- Backend: Node.js, Express, PostgreSQL, Redis
- Computer Vision: YOLOv8, FFmpeg
- Infrastructure: Docker, AWS (planned)

## Contributing

See CONTRIBUTING.md for development guidelines.

## Architecture

See ARCHITECTURE.md for detailed system design.