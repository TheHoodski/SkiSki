/**
 * SkiCrowd Project Structure
 *
 * /
 * ├── client/                 # Frontend application
 * │   ├── src/
 * │   │   ├── components/     # React components specific to client
 * │   │   │   ├── resort/     # Resort-specific components
 * │   │   │   └── Loading.tsx # Loading component
 * │   │   ├── pages/          # Page components
 * │   │   ├── utils/          # Client utilities
 * │   │   │   └── api.ts      # API client
 * │   │   └── App.tsx         # Main app component
 * │   └── public/             # Static assets
 * │
 * ├── server/                 # Backend services
 * │   ├── src/
 * │   │   ├── routes/         # API routes
 * │   │   ├── services/       # Business logic
 * │   │   ├── utils/          # Server utilities
 * │   │   └── index.ts        # Server entry point
 * │   └── frames/             # Captured camera frames
 * │
 * ├── shared/                 # Shared components/types
 * │   ├── Header.tsx          # App header
 * │   ├── Footer.tsx          # App footer
 * │   └── types.ts            # Shared TypeScript types
 * │
 * └── package.json            # Project dependencies
 */