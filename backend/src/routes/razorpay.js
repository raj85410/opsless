import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import razorpayService from '../services/razorpayService.js';
import { logSubscription } from '../utils/logger.js';

const router = express.Router();

// Get all subscription plans
router.get('/plans', async (req, res) => {
  try {
    const result = await razorpayService.getSubscriptionPlans();
    
    if (result.success) {
      res.json({
        success: true,
        plans: result.plans
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get plan by ID
router.get('/plans/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const result = await razorpayService.getPlanById(planId);
    
    if (result.success) {
      res.json({
        success: true,
        plan: result.plan
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting plan by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create payment order
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.name;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
    }

    const result = await razorpayService.createPaymentOrder(userId, planId, userEmail, userName);
    
    if (result.success) {
      logSubscription('order_created', { 
        userId, 
        planId, 
        orderId: result.order?.id 
      });

      res.json({
        success: true,
        order: result.order,
        subscription: result.subscription
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Verify payment
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentId, orderId, signature, planId } = req.body;
    const userId = req.user.id;

    if (!paymentId || !orderId || !signature || !planId) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID, Order ID, Signature, and Plan ID are required'
      });
    }

    // Verify payment signature
    const isValidSignature = await razorpayService.verifyPaymentSignature(paymentId, orderId, signature);
    
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Process successful payment
    const result = await razorpayService.processSuccessfulPayment(paymentId, orderId, userId, planId);
    
    if (result.success) {
      logSubscription('payment_verified', { 
        userId, 
        planId, 
        paymentId 
      });

      res.json({
        success: true,
        subscription: result.subscription,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's current subscription
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await razorpayService.getUserSubscription(userId);
    
    if (result.success) {
      res.json({
        success: true,
        subscription: result.subscription
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting user subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.user.id;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Subscription ID is required'
      });
    }

    const result = await razorpayService.cancelSubscription(userId, subscriptionId);
    
    if (result.success) {
      logSubscription('subscription_cancelled', { 
        userId, 
        subscriptionId 
      });

      res.json({
        success: true,
        subscription: result.subscription,
        message: 'Subscription cancelled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get payment history
router.get('/payment-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await razorpayService.getPaymentHistory(userId);
    
    if (result.success) {
      res.json({
        success: true,
        payments: result.payments
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Check subscription status
router.get('/subscription-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const hasActive = await razorpayService.hasActiveSubscription(userId);
    const limits = await razorpayService.getSubscriptionLimits(userId);
    
    res.json({
      success: true,
      hasActiveSubscription: hasActive,
      limits: limits
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Razorpay webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing signature'
      });
    }

    const result = await razorpayService.handleWebhook(req.body, signature);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get Razorpay configuration for frontend
router.get('/config', (req, res) => {
  res.json({
    success: true,
    config: {
      keyId: process.env.RAZORPAY_KEY_ID,
      currency: 'INR',
      name: 'Opsless',
      description: 'DevOps Automation Platform',
      image: 'https://opsless.com/logo.png',
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#3B82F6'
      }
    }
  });
});

export default router; 