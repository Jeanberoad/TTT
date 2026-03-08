# WiFi De Tsararano - MikroTik Hotspot Login Page

## Project Overview

A branded captive portal / hotspot login page designed for MikroTik routers. It provides a modern "glassmorphism" styled authentication interface for the "WiFi De Tsararano" public WiFi network.

## Tech Stack

- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (no build system)
- **Libraries (bundled locally):**
  - `html5-qrcode.min.js` — QR code scanning
  - `md5.js` — MD5 password hashing for MikroTik CHAP authentication
- **Templating:** MikroTik Hotspot proprietary template syntax (`$(username)`, `$(if chap-id)`, etc.)

## Project Structure

```
.
├── login.html          # Main captive portal login page
├── alogin.html         # Authorized login page (success redirect)
├── logout.html         # Disconnect/status page
├── status.html         # Active session status
├── error.html          # Generic error page
├── rlogin.html         # Redirect login page
├── redirect.html       # Generic redirect page
├── radvert.html        # Advertisement page
├── errors.txt          # Error message definitions
├── theme.js            # Time-based and manual theming logic
├── md5.js              # MD5 implementation
├── html5-qrcode.min.js # QR code scanner library
├── favicon.ico
├── css/
│   └── style.css       # Main stylesheet with CSS variables for themes
├── img/                # Background images and icons
│   ├── bg-morning.jpg
│   ├── bg-noon.jpg
│   ├── bg-afternoon.jpg
│   ├── bg-night.jpg
│   ├── user.svg
│   └── password.svg
└── xml/                # WISPr protocol support files
    ├── login.html
    ├── logout.html
    └── WISPAccessGatewayParam.xsd
```

## Running the Project

The project is served as static files using Python's built-in HTTP server:

```
python3 -m http.server 5000 --bind 0.0.0.0
```

## Deployment

Configured as a **static** deployment. The public directory is `.` (root).

## Notes

- The MikroTik template tags (e.g., `$(username)`, `$(if error)`) will appear as literal text when previewed in a standard browser — they are processed server-side by the MikroTik router's hotspot engine.
- The theme changes automatically based on time of day (morning, noon, afternoon, night).
