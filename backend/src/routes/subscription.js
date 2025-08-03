import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateSubscriptionData } from '../middleware/validation.js';
import SubscriptionService from '../services/subscriptionService.js';
import Stripe from 'stripe';
import pool from '../database/connection.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get all subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await SubscriptionService.getPlans();
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription plans'
    });
  }
});

// Get user's current subscription
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const subscription = await SubscriptionService.getUserSubscription(req.user.id);
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription'
    });
  }
});

// Create checkout session
router.post('/checkout', authenticateToken, validateSubscriptionData, async (req, res) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body;
    
    const session = await SubscriptionService.createCheckoutSession(
      req.user.id,
      planId,
      successUrl || `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancelUrl || `${process.env.FRONTEND_URL}/pricing?cancelled=true`
    );
    
    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        if (session.mode === 'payment') {
          // One-time payment
          await SubscriptionService.handlePaymentSuccess(session.id);
        }
        break;
        
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        if (invoice.subscription) {
          // Recurring subscription payment
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          // Handle recurring payment success
          console.log('Recurring payment succeeded:', subscription.id);
        }
        break;
        
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('Payment failed:', failedInvoice.id);
        // Handle payment failure
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription cancelled:', deletedSubscription.id);
        // Handle subscription cancellation
        break;
        
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        // Handle subscription updates
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const { cancelAtPeriodEnd = true } = req.body;
    
    await SubscriptionService.cancelSubscription(req.user.id, cancelAtPeriodEnd);
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

// Change subscription plan
router.post('/change', authenticateToken, validateSubscriptionData, async (req, res) => {
  try {
    const { newPlanId } = req.body;
    
    await SubscriptionService.changeSubscription(req.user.id, newPlanId);
    
    res.json({
      success: true,
      message: 'Subscription plan changed successfully'
    });
  } catch (error) {
    console.error('Error changing subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change subscription plan'
    });
  }
});

// Get payment history
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT ph.*, sp.name as plan_name
      FROM payment_history ph
      LEFT JOIN user_subscriptions us ON ph.subscription_id = us.id
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE ph.user_id = $1
      ORDER BY ph.created_at DESC
    `, [req.user.id]);
    
    client.release();
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment history'
    });
  }
});

// Reactivate subscription (for expired subscriptions)
router.post('/reactivate', authenticateToken, validateSubscriptionData, async (req, res) => {
  try {
    const { planId } = req.body;
    
    // Create new subscription
    const session = await SubscriptionService.createCheckoutSession(
      req.user.id,
      planId,
      `${process.env.FRONTEND_URL}/dashboard?reactivated=true`,
      `${process.env.FRONTEND_URL}/pricing?reactivation_cancelled=true`
    );
    
    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reactivate subscription'
    });
  }
});

// Get subscription usage (for feature limits)
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Get current subscription
    const subscription = await SubscriptionService.getUserSubscription(req.user.id);
    
    if (!subscription) {
      return res.json({
        success: true,
        data: {
          hasSubscription: false,
          limits: {
            max_projects: 0,
            max_deployments: 0
          },
          usage: {
            projects: 0,
            deployments: 0
          }
        }
      });
    }
    
    // Get current usage
    const projectsResult = await client.query(`
      SELECT COUNT(*) as count FROM projects WHERE user_id = $1
    `, [req.user.id]);
    
    const deploymentsResult = await client.query(`
      SELECT COUNT(*) as count FROM deployments d
      JOIN projects p ON d.project_id = p.id
      WHERE p.user_id = $1
    `, [req.user.id]);
    
    client.release();
    
    const features = subscription.features;
    const usage = {
      projects: parseInt(projectsResult.rows[0].count),
      deployments: parseInt(deploymentsResult.rows[0].count)
    };
    
    res.json({
      success: true,
      data: {
        hasSubscription: true,
        subscription: subscription,
        limits: {
          max_projects: features.max_projects || 0,
          max_deployments: features.max_deployments || 0
        },
        usage: usage,
        remaining: {
          projects: Math.max(0, (features.max_projects || 0) - usage.projects),
          deployments: Math.max(0, (features.max_deployments || 0) - usage.deployments)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscription usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription usage'
    });
  }
});

// Initialize subscription plans (admin only)
router.post('/init-plans', async (req, res) => {
  try {
    // Check if it's an admin request (you might want to add proper admin authentication)
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    await SubscriptionService.initializePlans();
    
    res.json({
      success: true,
      message: 'Subscription plans initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize subscription plans'
    });
  }
});

export default router; 