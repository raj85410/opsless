# Opsless Subscription System Setup Guide

This guide will help you set up the complete subscription system for Opsless, including Stripe integration, email notifications, and subscription management.

## 🚀 Quick Start

### 1. Stripe Setup

1. **Create a Stripe Account**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Sign up for a new account
   - Complete the verification process

2. **Get API Keys**
   - In the Stripe Dashboard, go to Developers → API Keys
   - Copy your **Publishable Key** and **Secret Key**
   - For testing, use the test keys (start with `pk_test_` and `sk_test_`)

3. **Set Environment Variables**
   ```bash
   # Backend .env file
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   
   # Frontend .env file
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   VITE_API_URL=http://localhost:3001
   ```

### 2. Database Setup

The subscription system requires these new tables:

```sql
-- Subscription plans table
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  duration_days INTEGER NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  features JSONB,
  stripe_price_id VARCHAR(255),
  stripe_product_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions table
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment history table
CREATE TABLE payment_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Initialize Subscription Plans

Run this command to create all subscription plans in Stripe and your database:

```bash
curl -X POST http://localhost:3001/api/subscription/init-plans \
  -H "Content-Type: application/json" \
  -H "x-admin-key: your-admin-secret-key"
```

## 📋 Subscription Plans

| Plan | Price | Duration | Type | Features |
|------|-------|----------|------|----------|
| Free Trial | $0 | 3 days | One-time | Basic features, 1 project, 3 deployments |
| One Week | $100 | 7 days | One-time | 5 projects, 20 deployments, priority support |
| One Month | $180 | 30 days | One-time | 10 projects, 50 deployments, auto-scaling |
| Two Months | $340 | 60 days | One-time | 15 projects, 100 deployments, team collaboration |
| Six Months | $1000 | 6 months | Recurring | 25 projects, 300 deployments, enterprise integrations |
| One Year | $1400 | 12 months | Recurring | 50 projects, 1000 deployments, dedicated support |

## 🔧 Configuration

### Email Setup

For production, configure SMTP settings:

```bash
# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@opsless.com

# For development, use Ethereal Email
ETHEREAL_USER=test@example.com
ETHEREAL_PASS=testpass
```

### Webhook Setup

1. **Create Webhook Endpoint**
   - In Stripe Dashboard, go to Developers → Webhooks
   - Click "Add endpoint"
   - Set URL to: `https://your-domain.com/api/subscription/webhook`
   - Select these events:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`

2. **Get Webhook Secret**
   - After creating the webhook, click on it
   - Copy the "Signing secret" (starts with `whsec_`)
   - Add it to your environment variables

## 🧪 Testing

### Test Cards

Use these test card numbers in Stripe test mode:

- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`
- **Expired**: `4000000000000069`

### Test Flow

1. Start the application
2. Create a test user account
3. Go to `/pricing` page
4. Select a plan and proceed to checkout
5. Use a test card number
6. Verify subscription is created in database
7. Check email notifications

## 📱 Frontend Integration

### Pricing Page

The pricing page (`/pricing`) includes:
- Mobile-first responsive design
- Plan comparison table
- Stripe checkout integration
- Success/error handling
- FAQ section

### Subscription Management

Users can manage their subscription from:
- Dashboard subscription widget
- Dedicated subscription management page
- Email notifications and reminders

## 🔄 Cron Jobs

The system includes automated cron jobs:

- **Daily**: Check subscription status and send reminders
- **Every 6 hours**: Check for expiring trials
- **Weekly**: Generate subscription analytics

## 📊 Analytics

The system tracks:
- Subscription metrics
- Revenue analytics
- Churn rate
- Conversion rate (trial to paid)
- Plan distribution

## 🛡️ Security

### Payment Security
- No payment details stored locally
- All payments processed by Stripe
- PCI DSS compliant
- Webhook signature verification

### Data Protection
- Encrypted database connections
- JWT token authentication
- Rate limiting on API endpoints
- Input validation and sanitization

## 🚨 Monitoring

### Health Checks
- Database connectivity
- Stripe API status
- Email service status
- Webhook delivery status

### Alerts
- Failed payments
- Webhook failures
- Database connection issues
- High churn rate warnings

## 🔧 Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**
   - Check webhook URL is accessible
   - Verify webhook secret is correct
   - Check server logs for errors

2. **Payment Failures**
   - Verify Stripe keys are correct
   - Check card details in test mode
   - Review Stripe Dashboard for errors

3. **Email Not Sending**
   - Check SMTP configuration
   - Verify email credentials
   - Check spam folder

4. **Subscription Not Created**
   - Check database connection
   - Verify user authentication
   - Review API logs

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug
```

## 📈 Going Live

1. **Switch to Live Mode**
   - Update Stripe keys to live keys
   - Update webhook URL to production domain
   - Test with real payment methods

2. **Monitor Performance**
   - Set up monitoring dashboards
   - Configure alerts
   - Track key metrics

3. **Scale Infrastructure**
   - Increase database capacity
   - Set up load balancing
   - Configure CDN for static assets

## 📚 API Documentation

### Subscription Endpoints

- `GET /api/subscription/plans` - Get all plans
- `GET /api/subscription/current` - Get user's subscription
- `POST /api/subscription/checkout` - Create checkout session
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/change` - Change plan
- `GET /api/subscription/usage` - Get usage statistics
- `GET /api/subscription/payments` - Get payment history

### Webhook Events

- `checkout.session.completed` - Payment successful
- `invoice.payment_succeeded` - Recurring payment successful
- `invoice.payment_failed` - Payment failed
- `customer.subscription.deleted` - Subscription cancelled
- `customer.subscription.updated` - Subscription updated

## 🆘 Support

For issues with the subscription system:

1. Check the logs for error messages
2. Verify all environment variables are set
3. Test with Stripe's test mode first
4. Contact support with detailed error information

## 📝 License

This subscription system is part of the Opsless platform and follows the same license terms. 