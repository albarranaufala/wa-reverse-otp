const axios = require("axios");
const OTPService = require("./otpService");

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    this.isReady = true; // API is always ready once configured

    if (!this.accessToken || !this.phoneNumberId) {
      console.error(
        "❌ WhatsApp API credentials missing. Please check environment variables."
      );
      this.isReady = false;
    } else {
      console.log("✅ WhatsApp Business API configured successfully");
    }
  }

  /**
   * Webhook verification for WhatsApp API
   */
  verifyWebhook(mode, token, challenge) {
    if (mode === "subscribe" && token === this.verifyToken) {
      console.log("✅ WhatsApp webhook verified");
      return challenge;
    }
    console.log("❌ WhatsApp webhook verification failed");
    return null;
  }

  /**
   * Handle incoming webhook messages
   */
  async handleWebhook(body) {
    try {
      // Check if this is a WhatsApp message
      if (body.object !== "whatsapp_business_account") {
        return;
      }

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value?.messages) {
        return; // No messages to process
      }

      const message = value.messages[0];
      const from = message.from;
      const messageBody = message.text?.body;

      if (!messageBody) {
        return; // No text message
      }

      console.log(`📨 Received message from ${from}: ${messageBody}`);

      await this.handleIncomingMessage(from, messageBody);
    } catch (error) {
      console.error("Error handling webhook:", error);
    }
  }

  async handleIncomingMessage(from, messageBody) {
    try {
      // Extract OTP from message
      const otpCode = OTPService.extractOTPFromMessage(messageBody);

      if (!otpCode) {
        console.log("No OTP found in message");
        return;
      }

      console.log(`🔑 OTP found: ${otpCode}`);

      // Get pending OTPs from the routes module
      const pendingOTPs = this.getPendingOTPs();

      // Find matching OTP
      const otpMatch = OTPService.findOTPByCode(otpCode, pendingOTPs);

      if (!otpMatch) {
        console.log("❌ No matching OTP found or OTP expired");
        await this.sendMessage(
          from,
          "❌ Invalid or expired OTP code. Please request a new OTP."
        );
        return;
      }

      const { otpId, otpData } = otpMatch;

      // Mark as verified and generate login credentials
      const bearerToken = OTPService.generateBearerToken(otpData.userId, otpId);
      const loginUrl = OTPService.generateLoginUrl(bearerToken);

      // Update OTP data
      otpData.verified = true;
      otpData.bearerToken = bearerToken;
      otpData.loginUrl = loginUrl;
      otpData.verifiedAt = new Date().toISOString();

      console.log(`✅ OTP verified for user: ${otpData.userId}`);

      // Send success message with login link
      const successMessage =
        `✅ OTP verified successfully!\n\n` +
        `🔗 Login URL: ${loginUrl}\n\n` +
        `🎫 Bearer Token: ${bearerToken}\n\n` +
        `⏰ Token expires in 24 hours`;

      await this.sendMessage(from, successMessage);

      console.log(`📤 Sent login credentials to ${from}`);
    } catch (error) {
      console.error("Error handling incoming message:", error);
      try {
        await this.sendMessage(
          from,
          "❌ An error occurred while processing your OTP. Please try again."
        );
      } catch (sendError) {
        console.error("Error sending error message:", sendError);
      }
    }
  }

  /**
   * Send message via WhatsApp Business API
   */
  async sendMessage(to, message) {
    try {
      if (!this.isReady) {
        throw new Error("WhatsApp API is not properly configured");
      }

      const payload = {
        messaging_product: "whatsapp",
        to: to,
        text: {
          body: message,
        },
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`📤 Message sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error sending message to ${to}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Send template message (for initial OTP notification)
   */
  async sendTemplateMessage(
    to,
    templateName,
    languageCode = "en",
    components = []
  ) {
    try {
      if (!this.isReady) {
        throw new Error("WhatsApp API is not properly configured");
      }

      const payload = {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: components,
        },
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`� Template message sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error sending template message to ${to}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  getPendingOTPs() {
    // This will be set by the routes module
    const reverseOtpRoutes = require("../routes/reverseOtp");
    return reverseOtpRoutes.pendingOTPs;
  }

  async initialize() {
    // No initialization needed for API-based approach
    console.log("✅ WhatsApp Business API service ready");
  }

  async destroy() {
    // No cleanup needed for API-based approach
    console.log("WhatsApp Business API service stopped");
  }

  getStatus() {
    return {
      ready: this.isReady,
      hasCredentials: !!(this.accessToken && this.phoneNumberId),
    };
  }
}

module.exports = WhatsAppService;
