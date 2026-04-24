require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const GUMROAD_LINK = process.env.GUMROAD_LINK || "https://mohammed47.gumroad.com/l/hfrii";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", {
    price: "$5",
    gumroadLink: GUMROAD_LINK
  });
});

app.listen(PORT, () => {
  console.log(`Website running on http://localhost:${PORT}`);
  console.log(`Gumroad link: ${GUMROAD_LINK}`);
});
