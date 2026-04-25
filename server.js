require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";
const BOOK_ACCESS_PASSWORD = process.env.BOOK_ACCESS_PASSWORD || "change-this-secret";
const PRICE_USD = process.env.PRICE_USD || "5.00";

const PAYPAL_BASE_URL =
  PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("Missing PayPal credentials in .env or Render environment variables");
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    throw new Error("Could not get PayPal access token");
  }

  return data.access_token;
}

app.get("/", (req, res) => {
  res.render("index", {
    price: "$5",
    paypalClientId: PAYPAL_CLIENT_ID || ""
  });
});

app.post("/api/paypal/create-order", async (req, res) => {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: "How to Build a $1M Digital Product Roadmap ebook",
            amount: {
              currency_code: "USD",
              value: PRICE_USD
            }
          }
        ]
      })
    });

    const order = await response.json();

    if (!response.ok) {
      console.error(order);
      return res.status(500).json({ error: "Could not create PayPal order" });
    }

    res.json({ id: order.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment setup failed" });
  }
});

app.post("/api/paypal/capture-order", async (req, res) => {
  try {
    const { orderID } = req.body;

    if (!orderID) {
      return res.status(400).json({ error: "Missing orderID" });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    const capture = await response.json();

    if (!response.ok) {
      console.error(capture);
      return res.status(500).json({ error: "Could not capture PayPal order" });
    }

    const status = capture.status;
    const paidAmount = capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
    const paidCurrency = capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code;

    if (status === "COMPLETED" && paidAmount === PRICE_USD && paidCurrency === "USD") {
      return res.json({
        status: "COMPLETED",
        redirectUrl: `/success?key=${encodeURIComponent(BOOK_ACCESS_PASSWORD)}`
      });
    }

    res.status(400).json({ error: "Payment was not completed correctly" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment capture failed" });
  }
});

app.get("/success", (req, res) => {
  if (req.query.key !== BOOK_ACCESS_PASSWORD) {
    return res.status(403).render("locked");
  }

  res.render("success", {
    downloadLink: `/book?key=${encodeURIComponent(BOOK_ACCESS_PASSWORD)}`
  });
});

app.get("/book", (req, res) => {
  if (req.query.key !== BOOK_ACCESS_PASSWORD) {
    return res.status(403).render("locked");
  }

  res.render("book");
});

app.get("/cancel", (req, res) => {
  res.render("cancel");
});

app.listen(PORT, () => {
  console.log(`Website running on http://localhost:${PORT}`);
  console.log(`PayPal mode: ${PAYPAL_ENV}`);
});
