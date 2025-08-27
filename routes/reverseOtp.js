const express = require("express");
const router = express.Router();
const OTPService = require("../services/otpService");
const WhatsAppService = require("../services/whatsappService");

// Store for pending OTP requests
const pendingOTPs = new Map();

/**
 * POST /api/v1/reverse-otp
 * Request reverse OTP
 */
router.post("/reverse-otp", async (req, res) => {
  try {
    const { phoneNumber, userId } = req.body;

    // Validate input
    if (!phoneNumber || !userId) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "phoneNumber and userId are required",
      });
    }

    // Generate OTP
    const otp = OTPService.generateOTP();
    const otpId = OTPService.generateOTPId();

    // Store OTP with expiration (5 minutes)
    const expirationTime = Date.now() + 5 * 60 * 1000;
    pendingOTPs.set(otpId, {
      otp,
      phoneNumber,
      userId,
      expirationTime,
      verified: false,
    });

    // Clean up expired OTPs
    OTPService.cleanupExpiredOTPs(pendingOTPs);

    // Return message for user to send
    const message = `Please send this OTP code via WhatsApp to verify your login: ${otp}`;

    res.json({
      success: true,
      message,
      otpId,
      expiresIn: "5 minutes",
      instructions:
        "Send the OTP code to our WhatsApp number to complete verification",
    });
  } catch (error) {
    console.error("Error in reverse-otp endpoint:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to generate OTP",
    });
  }
});

/**
 * GET /api/v1/otp-status/:otpId
 * Check OTP verification status
 */
router.get("/otp-status/:otpId", (req, res) => {
  try {
    const { otpId } = req.params;

    const otpData = pendingOTPs.get(otpId);

    if (!otpData) {
      return res.status(404).json({
        error: "OTP not found",
        message: "Invalid or expired OTP ID",
      });
    }

    // Check if expired
    if (Date.now() > otpData.expirationTime) {
      pendingOTPs.delete(otpId);
      return res.status(410).json({
        error: "OTP expired",
        message: "Please request a new OTP",
      });
    }

    res.json({
      otpId,
      verified: otpData.verified,
      expiresAt: new Date(otpData.expirationTime).toISOString(),
      loginUrl: otpData.verified ? otpData.loginUrl : null,
      bearerToken: otpData.verified ? otpData.bearerToken : null,
    });
  } catch (error) {
    console.error("Error checking OTP status:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to check OTP status",
    });
  }
});

/**
 * POST /api/v1/test-whatsapp
 * Test WhatsApp template message (for testing purposes)
 */
router.post("/test-whatsapp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validate input
    if (!phoneNumber) {
      return res.status(400).json({
        error: "Missing required field",
        message: "phoneNumber is required",
      });
    }

    const whatsappService = new WhatsAppService();

    // Send hello_world template
    const result = await whatsappService.sendHelloWorld(phoneNumber);

    res.json({
      success: true,
      message: "Test template message sent successfully",
      whatsappResponse: result,
    });
  } catch (error) {
    console.error("Error sending test message:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to send test message",
      details: error.response?.data || error.message,
    });
  }
});

// Export the pendingOTPs for use in WhatsApp service
router.pendingOTPs = pendingOTPs;

module.exports = router;
