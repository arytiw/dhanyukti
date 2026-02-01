# Razorpay Integration Setup Guide

## Problem
The application is showing Razorpay 401 Unauthorized errors because it's using a placeholder key instead of a real Razorpay API key.

## Solution: Get Your Razorpay API Key

### Step 1: Create Razorpay Account
1. Go to [https://razorpay.com/](https://razorpay.com/)
2. Click "Sign Up" and create an account
3. Complete the verification process

### Step 2: Get API Keys
1. Log in to your Razorpay Dashboard
2. Go to **Settings** → **API Keys** or visit: [https://dashboard.razorpay.com/app/website-app-settings/api-keys](https://dashboard.razorpay.com/app/website-app-settings/api-keys)
3. Click **"Generate Test Key"** (for development)
4. Copy the **Key ID** (starts with `rzp_test_`)

### Step 3: Update Environment File
1. Open `dhanayukti-spark-main/.env`
2. Replace the placeholder with your actual key:

```env
# Before (placeholder)
VITE_RAZORPAY_KEY_ID=rzp_test_1234567890123456

# After (your actual key)
VITE_RAZORPAY_KEY_ID=rzp_test_your_actual_key_from_dashboard
```

### Step 4: Restart Development Server
```bash
cd dhanayukti-spark-main
npm run dev
```

## Key Formats

### Test Keys (Development)
- Format: `rzp_test_xxxxxxxxxxxxxxxxxx`
- Use for development and testing
- No real money transactions

### Live Keys (Production)
- Format: `rzp_live_xxxxxxxxxxxxxxxxxx`
- Use only in production
- Real money transactions
- Requires business verification

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit API keys to Git**
   - The `.env` file is already in `.gitignore`
   - Use environment variables in production

2. **Use Test Keys for Development**
   - Always use `rzp_test_` keys during development
   - Switch to `rzp_live_` only in production

3. **Environment Variables in Production**
   ```bash
   # Set in your production environment
   export VITE_RAZORPAY_KEY_ID=rzp_live_your_production_key
   ```

## Troubleshooting

### Error: "Razorpay key required"
- Check if your `.env` file exists
- Verify the key starts with `rzp_test_` or `rzp_live_`
- Restart the development server after changing `.env`

### Error: 401 Unauthorized
- Key is invalid or expired
- Generate a new key from Razorpay dashboard
- Check if you're using the correct key (test vs live)

### Error: "Failed to load Razorpay"
- Network connectivity issue
- Check if `https://checkout.razorpay.com` is accessible
- Try refreshing the page

## Testing Payments

### Test Card Numbers (Razorpay Test Mode)
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test UPI IDs
- **Success**: success@razorpay
- **Failure**: failure@razorpay

## Backend Configuration

Make sure your Razorpay microservice (port 8126) is also configured with:
1. Razorpay Key ID
2. Razorpay Key Secret (for server-side operations)
3. Webhook secret (for payment verification)

## Next Steps

1. ✅ Get Razorpay API key
2. ✅ Update `.env` file
3. ✅ Restart development server
4. ✅ Test payment flow
5. 🔄 Configure webhook endpoints (for production)
6. 🔄 Set up live keys (for production deployment)

## Support

- **Razorpay Documentation**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **API Reference**: [https://razorpay.com/docs/api/](https://razorpay.com/docs/api/)
- **Support**: [https://razorpay.com/support/](https://razorpay.com/support/)