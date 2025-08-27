# Plesk Deployment Guide for WhatsApp Reverse OTP API

This guide will help you deploy the WhatsApp Reverse OTP API on Plesk hosting.

## Prerequisites

- Plesk Panel access
- Node.js extension installed on Plesk
- WhatsApp Business API credentials from Meta
- Domain or subdomain configured

## Step 1: Prepare Your Files

1. **Upload Files**: Upload all project files to your domain's directory in Plesk
2. **Environment Configuration**: Copy `.env.production` to `.env` and configure:
   ```bash
   PORT=3000
   NODE_ENV=production
   LOGIN_BASE_URL=https://yourdomain.com/login
   WHATSAPP_ACCESS_TOKEN=your_access_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_id
   WHATSAPP_VERIFY_TOKEN=your_verify_token
   ```

## Step 2: Configure Node.js in Plesk

1. **Navigate to Node.js**: Go to Websites & Domains → Your Domain → Node.js
2. **Enable Node.js**: Turn on Node.js support
3. **Set Configuration**:
   - **Node.js version**: Latest stable (16.x or higher)
   - **Document root**: `/httpdocs` (or your configured path)
   - **Application root**: Same as document root
   - **Application startup file**: `app.js`
   - **Application mode**: Production

## Step 3: Install Dependencies

1. **NPM Install**: In Plesk Node.js section, click "NPM Install" or use SSH:
   ```bash
   cd /var/www/vhosts/yourdomain.com/httpdocs
   npm install --production
   ```

## Step 4: Configure Environment Variables

In Plesk Node.js section, add environment variables:
- `NODE_ENV`: `production`
- `PORT`: `3000` (or as required by Plesk)
- `WHATSAPP_ACCESS_TOKEN`: Your WhatsApp token
- `WHATSAPP_PHONE_NUMBER_ID`: Your phone number ID
- `WHATSAPP_VERIFY_TOKEN`: Your webhook verify token
- `LOGIN_BASE_URL`: Your domain login URL

## Step 5: Configure Webhook

1. **Public URL**: Your webhook will be available at:
   ```
   https://yourdomain.com/webhook
   ```

2. **Meta Configuration**: In Meta Business Manager:
   - Set webhook URL: `https://yourdomain.com/webhook`
   - Set verify token: Same as `WHATSAPP_VERIFY_TOKEN`
   - Subscribe to `messages` events

## Step 6: Start the Application

1. **Enable Application**: In Plesk Node.js section, click "Enable Node.js"
2. **Restart**: Click "Restart App" if needed
3. **Monitor Logs**: Check application logs for any errors

## Step 7: Test the Deployment

1. **Health Check**: Visit `https://yourdomain.com/health`
   Should return:
   ```json
   {
     "status": "OK",
     "message": "WhatsApp Reverse OTP API is running",
     "whatsapp": {"ready": true, "hasCredentials": true}
   }
   ```

2. **Test OTP Request**:
   ```bash
   curl -X POST https://yourdomain.com/api/v1/reverse-otp \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber": "+1234567890", "userId": "testuser"}'
   ```

3. **Test Template Message** (optional):
   ```bash
   curl -i -X POST \
     https://graph.facebook.com/v22.0/YOUR_PHONE_NUMBER_ID/messages \
     -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
     -H 'Content-Type: application/json' \
     -d '{ "messaging_product": "whatsapp", "to": "RECIPIENT_PHONE", "type": "template", "template": { "name": "hello_world", "language": { "code": "en_US" } } }'
   ```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Plesk may assign a different port automatically
2. **Permission Issues**: Ensure files have correct permissions (644 for files, 755 for directories)
3. **Node.js Version**: Ensure compatible Node.js version (16+)
4. **Webhook Verification**: Check webhook verify token matches exactly

### Log Locations

- **Plesk Logs**: Websites & Domains → Your Domain → Logs
- **Node.js Logs**: Available in Plesk Node.js section
- **Application Logs**: Check `/var/www/vhosts/yourdomain.com/logs/`

### Performance Optimization

1. **Process Management**: Consider using PM2 if available:
   ```bash
   npm run pm2:start
   ```

2. **Memory Limits**: Monitor and adjust in Plesk if needed

3. **SSL Certificate**: Ensure HTTPS is enabled for webhook security

## Security Considerations

1. **Environment Variables**: Never commit `.env` to version control
2. **Firewall**: Ensure only necessary ports are open
3. **HTTPS**: Always use HTTPS in production
4. **Access Control**: Restrict access to sensitive endpoints if needed

## Maintenance

1. **Updates**: Regularly update dependencies
2. **Monitoring**: Set up monitoring for uptime and errors
3. **Backups**: Regular backups of configuration and code
4. **Logs**: Regular log rotation and cleanup

## Support

If you encounter issues:
1. Check Plesk documentation for Node.js applications
2. Verify WhatsApp Business API configuration
3. Check application logs for specific error messages
4. Test webhook connectivity from Meta's tools
