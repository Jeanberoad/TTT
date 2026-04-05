# WiFi De Tsararano - Captive Portal

## Overview
A custom captive portal for MikroTik hotspots, designed for a WiFi service called "WiFi De Tsararano" (Madagascar). It provides a multilingual (French, Malagasy, English) login interface with time-based theming.

## Tech Stack
- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript
- **Server (dev):** Python `http.server` via `serve.py`
- **Libraries:** html5-qrcode.min.js (QR scanning), md5.js (CHAP auth)

## Project Layout
- `login.html` — Main login page
- `status.html` — Session info after login
- `logout.html` — Logout confirmation
- `radvert.html` — Advertisement/landing page
- `alogin.html`, `redirect.html`, `rlogin.html` — Login flow pages
- `GameOverSoon.html` — Session expiry warning
- `css/style.css` — Main stylesheet
- `js/theme.js` — Time-based theme switching
- `img/` — Background images for each time-of-day theme
- `old/` — Legacy browser-compatible versions
- `xml/` — WISP XML compatibility files
- `serve.py` — Local development server (port 5000)

## Development
The app is served with Python's built-in HTTP server:
```
python serve.py
```
Runs on `0.0.0.0:5000`.

## Deployment
Configured as a **static** deployment — files are served directly with no backend processing needed.

## MVola Payment Integration
When a user clicks a price card, a payment modal appears instead of directly filling the username field. The modal flow:
1. Shows the selected plan (name + price)
2. User selects MVola as payment method
3. User enters their MVola phone number (032/033/034/038 format)
4. A POST request is sent to `https://wdt-api.onrender.com/api/hotspot/purchase` with `{ phone, plan }`
5. On success, the API returns `{ username, password }` which are injected into `document.login` and `doLogin()` is called to authenticate via MikroTik CHAP
6. Full error handling for network failures, invalid phone numbers, and API errors
7. Clear loading state ("Traitement MVola en cours…") to prevent double-clicks

**MikroTik Walled Garden required** — add these entries so the API is reachable before login:
```
/ip hotspot walled-garden
add dst-host=wdt-api.onrender.com
add dst-host=*.mvola.mg
```

## Notes
- MikroTik RouterOS variables (`$(chap-id)`, `$(link-login-only)`, etc.) are used in HTML templates and only work when deployed to a MikroTik router's flash/hotspot directory.
- The `old/` directory contains simplified versions for legacy device compatibility.
