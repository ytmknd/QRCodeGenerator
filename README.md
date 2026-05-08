# QRCode Generator

A simple web app that generates QR code images in the browser.

## Features

- Generate a QR code from text or a URL
- Download the generated QR code as a PNG image
- Copy the generated QR code image to the clipboard
- Browser-side QR generation (no external QR API requests)

## Tech Stack

- HTML, CSS, JavaScript
- Local dependency: `qrcodejs`

## Project Structure

- `index.html` - App layout and script includes
- `styles.css` - UI styles
- `app.js` - QR generation and actions (preview, download, copy)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Open the app:

- Option A: Open `index.html` directly in your browser.
- Option B (recommended): Serve the folder with a local server and open it via `http://localhost`.

## Usage

1. Enter text or a URL in the input field.
2. Click **Generate**.
3. Use **Download Image** to save the PNG file.
4. Use **Copy Image** to copy the QR image to your clipboard.

## Clipboard Notes

Copying image data to the clipboard depends on browser capabilities and permissions.

- In most browsers, clipboard image write requires a secure context:
  - `https://...` or
  - `http://localhost`
- If copy fails, try running the app from localhost and check browser permission prompts.

## Dependency Note

This project currently loads `qrcodejs` from `node_modules` in `index.html`.
If you plan to deploy this as static files, consider vendoring `qrcode.min.js` into a local `vendor/` folder and updating the script path.

## License

ISC (same as `package.json`)
