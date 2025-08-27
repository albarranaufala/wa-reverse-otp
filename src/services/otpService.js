const crypto = require("crypto");

class OTPService {
  /**
   * Generate a 6-digit OTP
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate a unique OTP ID
   */
  static generateOTPId() {
    return crypto.randomBytes(16).toString("hex");
  }

  /**
   * Generate bearer token for authenticated session
   */
  static generateBearerToken(userId, otpId) {
    const payload = {
      userId,
      otpId,
      timestamp: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    // In production, use JWT with proper secret
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }

  /**
   * Generate login URL with bearer token
   */
  static generateLoginUrl(bearerToken) {
    const baseUrl = process.env.LOGIN_BASE_URL || "https://yourapp.com/login";
    return `${baseUrl}?token=${bearerToken}`;
  }

  /**
   * Validate OTP format
   */
  static validateOTPFormat(otp) {
    return /^\d{6}$/.test(otp);
  }

  /**
   * Extract OTP from message text
   */
  static extractOTPFromMessage(messageText) {
    // Look for 6-digit numbers in the message
    const otpRegex = /\b\d{6}\b/g;
    const matches = messageText.match(otpRegex);
    return matches ? matches[0] : null;
  }

  /**
   * Clean up expired OTPs from the store
   */
  static cleanupExpiredOTPs(otpStore) {
    const now = Date.now();
    for (const [key, value] of otpStore.entries()) {
      if (now > value.expirationTime) {
        otpStore.delete(key);
      }
    }
  }

  /**
   * Find OTP by code in the store
   */
  static findOTPByCode(otpCode, otpStore) {
    for (const [otpId, otpData] of otpStore.entries()) {
      if (otpData.otp === otpCode && Date.now() <= otpData.expirationTime) {
        return { otpId, otpData };
      }
    }
    return null;
  }
}

module.exports = OTPService;
