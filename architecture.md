# SkiCrowd System Architecture

## System Overview

SkiCrowd uses a monorepo structure combining frontend, backend, and shared code. The system processes ski resort webcam feeds using computer vision to provide real-time crowd estimates.

## Project Structure

```
/skicrowd
├── /server                 # Backend services
│   ├── /src
│   │   ├── /services      # Core business logic
│   │   ├── /routes        # API endpoints
│   │   ├── /middleware    # Express middleware
│   │   └── /utils         # Utilities
├── /client                # Frontend application
│   ├── /src
│   │   ├── /components    # React components
│   │   ├── /pages         # Page components
│   │   └── /hooks         # Custom React hooks
└── /shared                # Shared code
    └── /types             # TypeScript types
```

## Core Components

### Camera Processing Pipeline

```
HLS Stream -> FFmpeg -> Frame Capture -> YOLOv8 -> Crowd Count -> Database
```

- Captures frames every 5 minutes
- Processes images using YOLOv8 for crowd detection
- Stores results in PostgreSQL
- Caches current data in Redis

### Data Flow

1. Camera Service
   - Manages HLS stream connection
   - Captures frames using FFmpeg
   - Temporary frame storage

2. Vision Service
   - YOLOv8 person detection
   - Crowd level calculation
   - Confidence scoring

3. API Service
   - RESTful endpoints
   - Redis caching
   - Rate limiting

4. Frontend
   - Real-time updates
   - Responsive design
   - Crowd visualization

## Database Schema

### Resorts Table
```sql
CREATE TABLE resorts (
    resort_id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    base_cam_url VARCHAR(255)
);
```

### Crowding Metrics Table
```sql
CREATE TABLE crowding_metrics (
    metric_id UUID PRIMARY KEY,
    resort_id UUID REFERENCES resorts(resort_id),
    timestamp TIMESTAMP NOT NULL,
    crowd_level VARCHAR(20),
    confidence_score DECIMAL(3,2)
);
```

## API Routes

```
GET /api/resorts          # List all resorts
GET /api/resorts/:id      # Get single resort
GET /api/metrics          # Get current crowding
GET /api/metrics/history  # Get 24h history
```

## Configuration

Required environment variables:
```bash
# Server
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Camera Processing
STREAM_URL=https://...
FRAME_CAPTURE_INTERVAL=300000
```

## Development Guidelines

1. Code Organization
   - Keep services modular
   - Share types between front/backend
   - Follow established directory structure

2. Best Practices
   - TypeScript for type safety
   - Consistent error handling
   - Comprehensive logging
   - Test critical paths

3. Performance
   - Redis caching for active data
   - 48-hour data retention
   - Optimize image processing
   - Monitor memory usage

## Deployment

Current deployment uses basic AWS setup:
- EC2 for application
- RDS for PostgreSQL
- ElastiCache for Redis
- S3 for static assets

## Future Considerations

1. Scaling
   - Multiple camera support
   - Additional resorts
   - Historical analysis

2. Features
   - User reporting
   - Weather integration
   - Predictive analytics

3. Infrastructure
   - Container orchestration
   - CDN integration
   - Backup strategy