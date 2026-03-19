# MikroTik Hotspot Captive Portal

## Overview
A custom captive portal (hotspot login page) designed for MikroTik RouterOS. Provides a user-friendly, multi-lingual, and themed interface for WiFi authentication ("WiFi De Tsararano").

## Features
- Multi-language support: French, Malagasy, and English
- Dynamic theming based on time of day (Morning, Noon, Afternoon, Night) or manual selection
- QR Code scanning for login via `html5-qrcode`
- Tariff display (30m, 1h30m, 24h, 1 month plans)
- Responsive/mobile-first design with glassmorphism aesthetic

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **Libraries**: `html5-qrcode.min.js`, `md5.js` (for MikroTik CHAP auth)
- **Dev Server**: Python `http.server` via `serve.py`

## Project Structure
```
/
├── login.html        # Main hotspot login page
├── status.html       # Session info page (post-login)
├── logout.html       # Logout page
├── error.html        # Error page
├── redirect.html     # Redirect page
├── alogin.html       # Alternate login
├── rlogin.html       # Redirect login
├── radvert.html      # Advertisement page
├── serve.py          # Local dev server (port 5000)
├── theme.js          # Time-of-day and manual theme logic
├── md5.js            # MD5 hashing for MikroTik CHAP auth
├── html5-qrcode.min.js # QR code scanner library
├── css/
│   └── style.css     # All styling (CSS variables, themes)
├── img/              # Theme background images and icons
├── xml/              # XML versions of login pages
├── old/              # Legacy/basic version for older devices
└── tutorial*.mp4     # Tutorial videos (FR, EN, MG)
```

## Running Locally
The dev server is configured as a workflow running `python serve.py` on port 5000.

## Deployment
Configured as a static site deployment (publicDir: ".").

## Notes
- HTML files contain MikroTik RouterOS template variables (e.g., `$(username)`, `$(link-login-only)`) which are only populated when served by the router.
- When previewing in Replit, these variables will appear as literal strings.
