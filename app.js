// Plesk-compatible entry point
// This file serves as the main entry point for Plesk hosting

const app = require("./index");

// Plesk typically uses process.env.PORT for the port
const PORT = process.env.PORT || 3000;

// For production environments like Plesk, we need to handle the server startup here
if (require.main === module) {
  // Initialize WhatsApp service
  const WhatsAppService = require("./services/whatsappService");
  const whatsappService = new WhatsAppService();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

    // Initialize WhatsApp service
    whatsappService.initialize();
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received, shutting down gracefully");
    whatsappService.destroy();
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("🛑 SIGINT received, shutting down gracefully");
    whatsappService.destroy();
    process.exit(0);
  });
}

// Export the app instance for Plesk compatibility
module.exports = app;
