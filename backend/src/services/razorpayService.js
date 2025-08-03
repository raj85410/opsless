import Razorpay from 'razorpay';
import { query } from '../database/connection.js';
import { logSubscription } from '../utils/logger.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  'free-trial': {
    id: 'free-trial',
    name: 'Free Trial',
    description: '3-day access to explore Opsless features',
    price: 0,
    duration_days: 3,
    currency: 'INR',
    features: ['Basic features', '1 project', '3 deployments'],
    is_recurring: false
  },
  'weekly': {
    id: 'weekly',
    name: 'Weekly',
    description: 'Perfect for short-term projects',
    price: 100,
    duration_days: 7,
    currency: 'USD',
    features: ['5 projects', '20 deployments', 'Priority support'],
    is_recurring: false
  },
  'monthly': {
    id: 'monthly',
    name: 'Monthly',
    description: 'Ideal for monthly projects',
    price: 180,
    duration_days: 30,
    currency: 'USD',
    features: ['10 projects', '50 deployments', 'Auto-scaling'],
    is_recurring: false
  },
  'two-months': {
    id: 'two-months',
    name: 'Two Months',
    description: 'Extended project support',
    price: 340,
    duration_days: 60,
    currency: 'USD',
    features: ['15 projects', '100 deployments', 'Team collaboration'],
    is_recurring: false
  },
  'six-months': {
    id: 'six-months',
    name: 'Six Months',
    description: 'Long-term project management',
    price: 1000,
    duration_days: 180,
    currency: 'USD',
    features: ['25 projects', '300 deployments', 'Enterprise integrations'],
    is_recurring: true
  },
  'yearly': {
    id: 'yearly',
    name: 'Yearly',
    description: 'Annual subscription with maximum benefits',
    price: 1400,
    duration_days: 365,
    currency: 'USD',
    features: ['50 projects', '1000 deployments', 'Dedicated support'],
    is_recurring: true
  }
};

class RazorpayService {
  // Get all subscription plans
  async getSubscriptionPlans() {
    try {
      const plans = Object.values(SUBSCRIPTION_PLANS);
      logSubscription('get_plans', { plans_count: plans.length });
      return { success: true, plans };
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      return { success: false, error: error.message };
    }
  }

  // Get plan by ID
  async getPlanById(planId) {
    try {
      const plan = SUBSCRIPTION_PLANS[planId];
      if (!plan) {
        return { success: false, error: 'Plan not found' };
      }
      return { success: true, plan };
    } catch (error) {
      console.error('Error getting plan by ID:', error);
      return { success: false, error: error.message };
    }
  }

  // Create payment order
  async createPaymentOrder(userId, planId, userEmail, userName) {
    try {
      const plan = SUBSCRIPTION_PLANS[planId];
      if (!plan) {
        return { success: false, error: 'Invalid plan' };
      }

      // For free trial, create subscription directly
      if (planId === 'free-trial') {
        return await this.createFreeTrialSubscription(userId, plan);
      }

      // Create Razorpay order
      const orderData = {
        amount: plan.price * 100, // Convert to paise
        currency: plan.currency,
        receipt: `order_${Date.now()}_${userId}`,
        notes: {
          userId: userId.toString(),
          planId: planId,
          userEmail: userEmail,
          userName: userName
        }
      };

      const order = await razorpay.orders.create(orderData);
      
      logSubscription('create_order', { 
        userId, 
        planId, 
        orderId: order.id,
        amount: order.amount 
      });

      return {
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          plan: plan
        }
      };
    } catch (error) {
      console.error('Error creating payment order:', error);
      return { success: false, error: error.message };
    }
  }

  // Create free trial subscription
  async createFreeTrialSubscription(userId, plan) {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + plan.duration_days);

      // Save subscription to database
      const result = await query(
        `INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end, trial_start, trial_end)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          userId,
          plan.id,
          'active',
          new Date(),
          trialEndDate,
          new Date(),
          trialEndDate
        ]
      );

      logSubscription('create_free_trial', { 
        userId, 
        planId: plan.id,
        subscriptionId: result.rows[0].id 
      });

      return {
        success: true,
        subscription: {
          id: result.rows[0].id,
          status: 'active',
          trialEnd: trialEndDate,
          plan: plan
        }
      };
    } catch (error) {
      console.error('Error creating free trial subscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Verify payment signature
  async verifyPaymentSignature(paymentId, orderId, signature) {
    try {
      const text = `${orderId}|${paymentId}`;
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  // Process successful payment
  async processSuccessfulPayment(paymentId, orderId, userId, planId) {
    try {
      // Get payment details from Razorpay
      const payment = await razorpay.payments.fetch(paymentId);
      
      if (payment.status !== 'captured') {
        return { success: false, error: 'Payment not captured' };
      }

      const plan = SUBSCRIPTION_PLANS[planId];
      if (!plan) {
        return { success: false, error: 'Invalid plan' };
      }

      // Calculate subscription period
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);

      // Save subscription to database
      const subscriptionResult = await query(
        `INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end, stripe_subscription_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          userId,
          plan.id,
          'active',
          startDate,
          endDate,
          paymentId // Using payment ID as subscription ID for non-recurring plans
        ]
      );

      // Save payment history
      await query(
        `INSERT INTO payment_history (user_id, subscription_id, stripe_payment_intent_id, amount, currency, status, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          subscriptionResult.rows[0].id,
          paymentId,
          payment.amount / 100, // Convert from paise
          payment.currency,
          'succeeded',
          payment.method
        ]
      );

      logSubscription('payment_success', { 
        userId, 
        planId, 
        paymentId,
        subscriptionId: subscriptionResult.rows[0].id,
        amount: payment.amount 
      });

      return {
        success: true,
        subscription: {
          id: subscriptionResult.rows[0].id,
          status: 'active',
          startDate,
          endDate,
          plan: plan
        }
      };
    } catch (error) {
      console.error('Error processing successful payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's current subscription
  async getUserSubscription(userId) {
    try {
      const result = await query(
        `SELECT us.*, sp.name as plan_name, sp.description, sp.features
         FROM user_subscriptions us
         JOIN subscription_plans sp ON us.plan_id = sp.id
         WHERE us.user_id = $1 AND us.status = 'active'
         ORDER BY us.created_at DESC
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return { success: true, subscription: null };
      }

      const subscription = result.rows[0];
      
      // Check if subscription has expired
      if (new Date() > new Date(subscription.current_period_end)) {
        // Update subscription status to expired
        await query(
          `UPDATE user_subscriptions SET status = 'expired' WHERE id = $1`,
          [subscription.id]
        );
        
        return { success: true, subscription: null };
      }

      return { success: true, subscription };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Cancel subscription
  async cancelSubscription(userId, subscriptionId) {
    try {
      const result = await query(
        `UPDATE user_subscriptions 
         SET status = 'cancelled', cancel_at_period_end = true
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [subscriptionId, userId]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Subscription not found' };
      }

      logSubscription('cancel_subscription', { 
        userId, 
        subscriptionId 
      });

      return { success: true, subscription: result.rows[0] };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Get payment history
  async getPaymentHistory(userId) {
    try {
      const result = await query(
        `SELECT ph.*, sp.name as plan_name
         FROM payment_history ph
         JOIN user_subscriptions us ON ph.subscription_id = us.id
         JOIN subscription_plans sp ON us.plan_id = sp.id
         WHERE us.user_id = $1
         ORDER BY ph.created_at DESC`,
        [userId]
      );

      return { success: true, payments: result.rows };
    } catch (error) {
      console.error('Error getting payment history:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle webhook events
  async handleWebhook(event, signature) {
    try {
      // Verify webhook signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(event))
        .digest('hex');

      if (expectedSignature !== signature) {
        return { success: false, error: 'Invalid webhook signature' };
      }

      const { event: eventType, payload } = event;

      switch (eventType) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payload.payment.entity);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payload.payment.entity);
          break;
        case 'subscription.activated':
          await this.handleSubscriptionActivated(payload.subscription.entity);
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(payload.subscription.entity);
          break;
        default:
          console.log(`Unhandled webhook event: ${eventType}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error handling webhook:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle payment captured webhook
  async handlePaymentCaptured(payment) {
    try {
      const { id: paymentId, order_id: orderId, notes } = payment;
      const { userId, planId } = notes;

      await this.processSuccessfulPayment(paymentId, orderId, userId, planId);
    } catch (error) {
      console.error('Error handling payment captured:', error);
    }
  }

  // Handle payment failed webhook
  async handlePaymentFailed(payment) {
    try {
      const { id: paymentId, order_id: orderId, notes } = payment;
      const { userId, planId } = notes;

      // Update subscription status to failed
      await query(
        `UPDATE user_subscriptions 
         SET status = 'failed'
         WHERE user_id = $1 AND plan_id = $2`,
        [userId, planId]
      );

      logSubscription('payment_failed', { 
        userId, 
        planId, 
        paymentId 
      });
    } catch (error) {
      console.error('Error handling payment failed:', error);
    }
  }

  // Handle subscription activated webhook
  async handleSubscriptionActivated(subscription) {
    try {
      logSubscription('subscription_activated', { 
        subscriptionId: subscription.id 
      });
    } catch (error) {
      console.error('Error handling subscription activated:', error);
    }
  }

  // Handle subscription cancelled webhook
  async handleSubscriptionCancelled(subscription) {
    try {
      await query(
        `UPDATE user_subscriptions 
         SET status = 'cancelled'
         WHERE stripe_subscription_id = $1`,
        [subscription.id]
      );

      logSubscription('subscription_cancelled', { 
        subscriptionId: subscription.id 
      });
    } catch (error) {
      console.error('Error handling subscription cancelled:', error);
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId) {
    try {
      const result = await query(
        `SELECT COUNT(*) as count
         FROM user_subscriptions
         WHERE user_id = $1 AND status = 'active' AND current_period_end > NOW()`,
        [userId]
      );

      return result.rows[0].count > 0;
    } catch (error) {
      console.error('Error checking active subscription:', error);
      return false;
    }
  }

  // Get subscription usage limits
  async getSubscriptionLimits(userId) {
    try {
      const result = await query(
        `SELECT sp.features, us.current_period_end
         FROM user_subscriptions us
         JOIN subscription_plans sp ON us.plan_id = sp.id
         WHERE us.user_id = $1 AND us.status = 'active' AND us.current_period_end > NOW()
         ORDER BY us.created_at DESC
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        // Return free trial limits
        return {
          projects: 1,
          deployments: 3,
          features: ['Basic features'],
          expiresAt: null
        };
      }

      const subscription = result.rows[0];
      const features = subscription.features || [];

      // Parse limits from features
      const limits = {
        projects: 1,
        deployments: 3,
        features: features,
        expiresAt: subscription.current_period_end
      };

      // Extract numeric limits from features
      features.forEach(feature => {
        if (feature.includes('projects')) {
          const match = feature.match(/(\d+)\s*projects/);
          if (match) limits.projects = parseInt(match[1]);
        }
        if (feature.includes('deployments')) {
          const match = feature.match(/(\d+)\s*deployments/);
          if (match) limits.deployments = parseInt(match[1]);
        }
      });

      return limits;
    } catch (error) {
      console.error('Error getting subscription limits:', error);
      return {
        projects: 1,
        deployments: 3,
        features: ['Basic features'],
        expiresAt: null
      };
    }
  }
}

export default new RazorpayService(); 