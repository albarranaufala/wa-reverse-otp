# WhatsApp Reverse OTP API

API for reverse OTP functionality using the official WhatsApp Business API. Instead of users receiving OTP codes via WhatsApp, users send OTP codes to WhatsApp for verification. Once verified, the backend responds with a login URL and Bearer token.

## Features

- **Reverse OTP Generation**: Generate OTP codes for users to send via WhatsApp
- **Official WhatsApp Business API Integration**: Use Meta's official API for reliable messaging
- **Webhook Processing**: Receive and process incoming messages automatically
- **Automatic Verification**: Validate OTP codes and provide login credentials
- **Bearer Token Authentication**: Generate secure tokens for authenticated sessions
- **Real-time Status Checking**: Check OTP verification status

## Tech Stack

- **Backend**: Express.js
- **WhatsApp Integration**: Official WhatsApp Business API
- **HTTP Client**: Axios
- **Security**: Helmet, CORS
- **Environment**: dotenv

## API Endpoints

### POST `/api/v1/reverse-otp`
Request a reverse OTP for user verification.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Please send this OTP code via WhatsApp to verify your login: 123456",
  "otpId": "abc123...",
  "expiresIn": "5 minutes",
  "instructions": "Send the OTP code to our WhatsApp number to complete verification"
}
```

### GET `/api/v1/otp-status/:otpId`
Check the verification status of an OTP.

**Response (Pending):**
```json
{
  "otpId": "abc123...",
  "verified": false,
  "expiresAt": "2025-08-26T10:30:00.000Z",
  "loginUrl": null,
  "bearerToken": null
}
```

**Response (Verified):**
```json
{
  "otpId": "abc123...",
  "verified": true,
  "expiresAt": "2025-08-26T10:30:00.000Z",
  "loginUrl": "https://yourapp.com/login?token=...",
  "bearerToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "WhatsApp Reverse OTP API is running",
  "whatsapp": {
    "ready": true,
    "hasCredentials": true
  }
}
```

### Webhook Endpoints

#### GET `/webhook`
Webhook verification endpoint for WhatsApp Business API setup.

#### POST `/webhook`
Receives incoming messages from WhatsApp Business API.

## Setup Instructions

### 1. WhatsApp Business API Setup

Before setting up the application, you need to configure the WhatsApp Business API:

1. **Create a Meta Business Account**
   - Go to [Meta Business](https://business.facebook.com/)
   - Create or use existing business account

2. **Set up WhatsApp Business API**
   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Create a new app or use existing one
   - Add WhatsApp product to your app

3. **Get Required Credentials**
   - **Access Token**: From your app's WhatsApp > Getting Started
   - **Phone Number ID**: From your WhatsApp Business account
   - **Verify Token**: Create a secure random string for webhook verification

4. **Configure Webhook**
   - Webhook URL: `https://your-domain.com/webhook`
   - Verify Token: Use the same token from step 3
   - Subscribe to `messages` field

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
LOGIN_BASE_URL=https://yourapp.com/login

# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token_here
```

### 4. Start the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 5. Webhook Setup
1. Your application will be available at `http://localhost:3000`
2. For production, deploy to a public URL (e.g., using ngrok for testing)
3. Configure the webhook URL in your WhatsApp Business API settings
4. Test the webhook verification

## How It Works

1. **OTP Request**: Client calls `POST /api/v1/reverse-otp` with user details
2. **OTP Generation**: Server generates a 6-digit OTP and returns it to the client
3. **User Action**: User sends the OTP code via WhatsApp to your business number
4. **Webhook Processing**: WhatsApp sends the message to your webhook endpoint
5. **Automatic Processing**: Server receives the webhook and extracts the OTP
6. **Verification**: Server validates the OTP and generates login credentials
7. **Response**: Server sends back a login URL and Bearer token via WhatsApp

## Project Structure

```
wa-reverse-otp/
├── src/
│   ├── routes/
│   │   ├── reverseOtp.js          # API routes for OTP management
│   │   └── webhook.js             # Webhook handling for WhatsApp
│   ├── services/
│   │   ├── otpService.js          # OTP generation and validation
│   │   └── whatsappService.js     # WhatsApp Business API integration
│   └── index.js                   # Main application entry point
├── package.json
├── .env
└── README.md
```

## Security Considerations

- OTP codes expire after 5 minutes
- Bearer tokens expire after 24 hours
- Input validation on all endpoints
- CORS and Helmet security middleware
- Automatic cleanup of expired OTPs
- Webhook signature verification (recommended for production)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `LOGIN_BASE_URL` | Base URL for login redirects | No (default: https://yourapp.com/login) |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Business API access token | Yes |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business phone number ID | Yes |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification token | Yes |

## Development

### Start Development Server
```bash
npm run dev
```

The server will restart automatically when you make changes to the code.

### Testing the API

1. **Request OTP:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/reverse-otp \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber": "+1234567890", "userId": "testuser"}'
   ```

2. **Send OTP via WhatsApp:**
   Send the received OTP code to your WhatsApp Business number

3. **Check Status:**
   ```bash
   curl http://localhost:3000/api/v1/otp-status/YOUR_OTP_ID
   ```

### Testing Webhooks Locally

For local development, you can use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the provided HTTPS URL for webhook configuration
```

## Deployment

### Production Deployment

1. **Environment Setup**
   ```env
   NODE_ENV=production
   WHATSAPP_ACCESS_TOKEN=your_production_token
   WHATSAPP_PHONE_NUMBER_ID=your_production_phone_id
   WHATSAPP_VERIFY_TOKEN=your_secure_verify_token
   LOGIN_BASE_URL=https://yourapp.com/login
   ```

2. **Webhook Security**
   - Implement webhook signature verification
   - Use HTTPS for all communications
   - Set up proper firewall rules

3. **Monitoring**
   - Set up logging and monitoring
   - Configure error alerting
   - Monitor webhook delivery status

### Recommended Hosting Platforms

- **Heroku**: Easy deployment with add-ons
- **AWS**: EC2 or Elastic Beanstalk
- **Google Cloud**: App Engine or Compute Engine
- **Digital Ocean**: Droplets with PM2

## Troubleshooting

### WhatsApp API Issues
- Verify your access token is valid and not expired
- Check that your phone number is verified
- Ensure webhook URL is accessible from the internet
- Verify webhook subscription includes the 'messages' field

### Webhook Not Receiving Messages
- Check that webhook URL is correctly configured
- Verify the webhook verification was successful
- Ensure your server is accessible from WhatsApp servers
- Check server logs for any errors

### OTP Not Being Recognized
- Ensure the OTP is exactly 6 digits
- Check that the message contains the OTP code
- Verify the OTP hasn't expired (5-minute limit)
- Check webhook payload in server logs

## API Rate Limits

WhatsApp Business API has rate limits:
- **Messaging**: 1000 messages per 24 hours (initially)
- **API Calls**: 4000 calls per hour per phone number

Monitor your usage and request rate limit increases from Meta as needed.

## License

ISC
