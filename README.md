# Gumroad Book Landing Page

This version uses your Gumroad product link for payment and automatic book delivery.

## Your Gumroad link

```text
https://mohammed47.gumroad.com/l/hfrii
```

## Setup

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## How it works

- The website is a landing page.
- All buy buttons open your Gumroad product.
- Gumroad handles:
  - payment
  - customer email
  - PDF delivery
  - download link

## Change the Gumroad link

Open `.env` and set:

```env
GUMROAD_LINK=https://mohammed47.gumroad.com/l/hfrii
DOMAIN=http://localhost:3000
```

Or edit `server.js` directly.
