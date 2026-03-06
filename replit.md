# WiFi Ticket Generator

A web application for generating stylized WiFi hotspot access tickets. Users can import MikroTik hotspot user CSV exports and generate printable tickets with QR codes.

## Architecture

- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui components
- **Backend**: Express.js + TypeScript server
- **Database**: PostgreSQL via Drizzle ORM
- **Build**: Vite (frontend), esbuild (backend)

## Project Structure

```
client/           React frontend
  src/
    App.tsx       Root app with routing
    pages/        Page components (Home, not-found)
    components/   UI components (ConfigPanel, CsvUploader, TicketCard)
    hooks/        Custom hooks (use-config, use-toast, use-mobile)
    lib/          Utilities (queryClient, utils)
    types/        TypeScript types (ticket)
    index.css     Tailwind + custom CSS with print styles
  index.html      Entry HTML
server/           Express backend
  index.ts        Server entry point (port 5000, host 0.0.0.0)
  routes.ts       API routes (/api/config GET/PUT)
  storage.ts      Database storage layer
  db.ts           Drizzle ORM connection
  vite.ts         Vite dev middleware
  static.ts       Static file serving (production)
shared/           Shared types between client and server
  schema.ts       Drizzle schema (configurations table)
  routes.ts       API route definitions
script/
  build.ts        Build script (frontend + backend)
```

## Key Features

- CSV import for MikroTik hotspot user data
- Multiple ticket templates: Modern, Minimalist, Horizontal
- QR code generation (via qrserver.com API)
- Configurable colors, fonts, dimensions
- Logo upload support
- Print-optimized CSS for A4 paper output
- Persistent configuration stored in PostgreSQL

## Configuration Schema

The `configurations` table stores:
- WiFi name, subtitle, support/footer text
- Template type, QR style
- Colors (primary, background, text)
- Dimensions (ticket width/height, border radius, font size)
- Logo URL (base64), router base host for QR generation
- Tickets per page

## Development

- Run with `npm run dev` - starts Express server (port 5000) which serves the Vite frontend in dev mode
- Database migrations: `npm run db:push`
- Production build: `npm run build`
