# Fixed PayPal Checkout Flow

This version removes PayPal.me and uses real PayPal Checkout.

## How it works

1. Buyer clicks PayPal button.
2. Server creates a PayPal order.
3. Buyer approves payment.
4. Server captures the order.
5. Server verifies:
   - status = COMPLETED
   - amount = 5.00
   - currency = USD
6. Buyer is redirected to the success page and can open the book.

## Local setup

```bash
npm install
copy .env.example .env
npm start
```

## Render environment variables

In Render, add these:

```text
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_ENV
DOMAIN
BOOK_ACCESS_PASSWORD
PRICE_USD
```

For testing:

```text
PAYPAL_ENV=sandbox
DOMAIN=https://million-book.onrender.com
PRICE_USD=5.00
```

For real payments:

```text
PAYPAL_ENV=live
DOMAIN=https://million-book.onrender.com
PRICE_USD=5.00
```
