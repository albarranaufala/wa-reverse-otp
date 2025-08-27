const express = require("express");
const router = express.Router();
const WhatsAppService = require("../services/whatsappService");

// Initialize WhatsApp service
const whatsappService = new WhatsAppService();

/**
 * GET /webhook - Webhook verification
 * Required for WhatsApp Business API setup
 */
router.get("/", (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("Webhook verification request received");

    const verificationResult = whatsappService.verifyWebhook(
      mode,
      token,
      challenge
    );

    if (verificationResult) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send("Forbidden");
    }
  } catch (error) {
    console.error("Error in webhook verification:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * POST /webhook - Receive messages from WhatsApp
 * Handles incoming messages and processes OTP codes
 */
router.post("/", async (req, res) => {
  try {
    // Parse the raw body
    let body;
    if (Buffer.isBuffer(req.body)) {
      body = JSON.parse(req.body.toString());
    } else {
      body = req.body;
    }

    console.log("Webhook payload received:", JSON.stringify(body, null, 2));

    // Process the webhook
    await whatsappService.handleWebhook(body);

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Still return 200 to prevent WhatsApp from retrying
    res.status(200).send("OK");
  }
});

module.exports = router;
