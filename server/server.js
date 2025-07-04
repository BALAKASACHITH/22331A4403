const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const Log = require("./logger");

const app = express();
const PORT = 5000;
app.use(express.json());

// In-memory storage
const urlDB = {}; // { shortcode: { url, expiry, clickCount } }

// Generate a random shortcode
const generateShortcode = () => uuidv4().slice(0, 6);

// Create Short URL
app.post("/shorturls", async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;

    if (!url || typeof url !== "string") {
      await Log("ShortenURL", "ERROR", "API", "Invalid URL input");
      return res.status(400).json({ error: "Invalid URL" });
    }

    let code = shortcode || generateShortcode();

    if (urlDB[code]) {
      await Log("ShortenURL", "ERROR", "API", `Shortcode already in use: ${code}`);
      return res.status(400).json({ error: "Shortcode already in use" });
    }

    const expiry = new Date(Date.now() + validity * 60 * 1000).toISOString();

    urlDB[code] = {
      url,
      expiry,
      clickCount: 0
    };

    const shortLink = `${req.protocol}://${req.get("host")}/${code}`;
    await Log("ShortenURL", "INFO", "API", `Created shortLink ${shortLink}`);

    res.status(201).json({ shortLink, expiry });

  } catch (err) {
    await Log("ShortenURL", "ERROR", "Server", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Redirect Short URL
app.get("/:shortcode", async (req, res) => {
  const { shortcode } = req.params;
  const entry = urlDB[shortcode];

  if (!entry) {
    await Log("Redirect", "ERROR", "API", `Shortcode not found: ${shortcode}`);
    return res.status(404).json({ error: "Shortcode not found" });
  }

  if (new Date() > new Date(entry.expiry)) {
    await Log("Redirect", "ERROR", "API", `Shortcode expired: ${shortcode}`);
    return res.status(410).json({ error: "Shortcode expired" });
  }

  entry.clickCount += 1;
  await Log("Redirect", "INFO", "API", `Redirecting ${shortcode} to ${entry.url}`);
  res.redirect(entry.url);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
