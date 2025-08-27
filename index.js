const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const reverseOtpRoutes = require("./routes/reverseOtp");
const webhookRoutes = require("./routes/webhook");
const WhatsAppService = require("./services/whatsappService");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for webhook verification (raw body needed)
app.use("/webhook", express.raw({ type: "application/json" }));

// Standard middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", reverseOtpRoutes);
app.use("/webhook", webhookRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "WhatsApp Reverse OTP API is running",
    whatsapp: whatsappService.getStatus(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize WhatsApp service
const whatsappService = new WhatsAppService();

// Only start the server if this file is run directly (not required as a module)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Webhook URL: http://localhost:${PORT}/webhook`);

    // Initialize WhatsApp service
    whatsappService.initialize();
  });
}

module.exports = app;
