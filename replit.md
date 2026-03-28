# WiFi De Tsararano

## Overview
A WiFi hotspot captive portal and management interface for "WiFi De Tsararano" service. The site provides login pages, advertisements, and status pages for WiFi ticket-based access.

## Architecture
- **Type**: Static HTML site served by a Python HTTP server
- **Language**: Python (server), HTML/CSS/JavaScript (frontend)
- **Server**: Python's built-in `http.server` via `serve.py`
- **Port**: 5000

## Project Structure
- `serve.py` — Python HTTP server, serves on 0.0.0.0:5000, routes `/` to `login.html`
- `login.html` — Main login/portal page
- `alogin.html` / `rlogin.html` — Alternate login variants
- `logout.html` — Logout page
- `status.html` — Connection status page
- `error.html` — Error page
- `redirect.html` — Redirect page
- `radvert.html` — Advertisement page
- `GameOverSoon.html` — Session expiry warning
- `css/` — Stylesheets
- `img/` — Images
- `xml/` — XML configuration files
- `html5-qrcode.min.js` — QR code scanner library
- `md5.js` — MD5 hashing utility
- `theme.js` — Theme/UI script
- `tutorial*.mp4` — Tutorial videos (English, Malagasy, general)

## Running
```
python serve.py
```
Serves on http://0.0.0.0:5000

## Deployment
Configured as autoscale deployment running `python serve.py`.
