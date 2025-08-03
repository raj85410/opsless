import Stripe from 'stripe';
import pool from '../database/connection.js';
import { sendEmail } from './emailService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class SubscriptionService {
  // Initialize subscription plans
  static async initializePlans() {
    const plans = [
      {
        name: 'Free Trial',
        description: '3-day access to explore Opsless features',
        price: 0,
        duration_days: 3,
        is_recurring: false,
        features: {
          max_projects: 1,
          max_deployments: 3,
          ai_assistant: true,
          basic_monitoring: true,
          community_support: true
        }
      },
      {
        name: 'One Week',
        description: 'Perfect for short-term projects',
        price: 100,
        duration_days: 7,
        is_recurring: false,
        features: {
          max_projects: 5,
          max_deployments: 20,
          ai_assistant: true,
          advanced_monitoring: true,
          priority_support: true,
          custom_domains: true
        }
      },
      {
        name: 'One Month',
        description: 'Ideal for monthly projects',
        price: 180,
        duration_days: 30,
        is_recurring: false,
        features: {
          max_projects: 10,
          max_deployments: 50,
          ai_assistant: true,
          advanced_monitoring: true,
          priority_support: true,
          custom_domains: true,
          auto_scaling: true
        }
      },
      {
        name: 'Two Months',
        description: 'Extended project support',
        price: 340,
        duration_days: 60,
        is_recurring: false,
        features: {
          max_projects: 15,
          max_deployments: 100,
          ai_assistant: true,
          advanced_monitoring: true,
          priority_support: true,
          custom_domains: true,
          auto_scaling: true,
          team_collaboration: true
        }
      },
      {
        name: 'Six Months',
        description: 'Semi-annual subscription with savings',
        price: 1000,
        duration_days: 180,
        is_recurring: true,
        features: {
          max_projects: 25,
          max_deployments: 300,
          ai_assistant: true,
          advanced_monitoring: true,
          priority_support: true,
          custom_domains: true,
          auto_scaling: true,
          team_collaboration: true,
          enterprise_integrations: true
        }
      },
      {
        name: 'One Year',
        description: 'Annual subscription with maximum savings',
        price: 1400,
        duration_days: 365,
        is_recurring: true,
        features: {
          max_projects: 50,
          max_deployments: 1000,
          ai_assistant: true,
          advanced_monitoring: true,
          priority_support: true,
          custom_domains: true,
          auto_scaling: true,
          team_collaboration: true,
          enterprise_integrations: true,
          dedicated_support: true
        }
      }
    ];

    try {
      const client = await pool.connect();
      
      for (const plan of plans) {
        // Create Stripe product and price
        const stripeProduct = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: {
            duration_days: plan.duration_days.toString(),
            is_recurring: plan.is_recurring.toString()
          }
        });

        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: plan.price * 100, // Convert to cents
          currency: 'usd',
          recurring: plan.is_recurring ? { interval: 'month' } : null
        });

        // Insert plan into database
        await client.query(`
          INSERT INTO subscription_plans 
          (name, description, price, duration_days, is_recurring, features, stripe_product_id, stripe_price_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          duration_days = EXCLUDED.duration_days,
          is_recurring = EXCLUDED.is_recurring,
          features = EXCLUDED.features,
          stripe_product_id = EXCLUDED.stripe_product_id,
          stripe_price_id = EXCLUDED.stripe_price_id
        `, [
          plan.name,
          plan.description,
          plan.price,
          plan.duration_days,
          plan.is_recurring,
          JSON.stringify(plan.features),
          stripeProduct.id,
          stripePrice.id
        ]);
      }

      client.release();
      console.log('Subscription plans initialized successfully');
    } catch (error) {
      console.error('Error initializing subscription plans:', error);
      throw error;
    }
  }

  // Get all active plans
  static async getPlans() {
    try {
      const client = await pool.connect();
      const result = await client.query(`
        SELECT * FROM subscription_plans 
        WHERE is_active = true 
        ORDER BY price ASC
      `);
      client.release();
      return result.rows;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  // Create checkout session
  static async createCheckoutSession(userId, planId, successUrl, cancelUrl) {
    try {
      const client = await pool.connect();
      
      // Get plan details
      const planResult = await client.query(`
        SELECT * FROM subscription_plans WHERE id = $1
      `, [planId]);
      
      if (planResult.rows.length === 0) {
        throw new Error('Plan not found');
      }
      
      const plan = planResult.rows[0];
      
      // Get user details
      const userResult = await client.query(`
        SELECT * FROM users WHERE id = $1
      `, [userId]);
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const user = userResult.rows[0];
      
      // Create or get Stripe customer
      let stripeCustomerId = null;
      const customerResult = await client.query(`
        SELECT stripe_customer_id FROM user_subscriptions 
        WHERE user_id = $1 AND stripe_customer_id IS NOT NULL 
        LIMIT 1
      `, [userId]);
      
      if (customerResult.rows.length > 0) {
        stripeCustomerId = customerResult.rows[0].stripe_customer_id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            user_id: userId.toString()
          }
        });
        stripeCustomerId = customer.id;
      }
      
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{
          price: plan.stripe_price_id,
          quantity: 1,
        }],
        mode: plan.is_recurring ? 'subscription' : 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId.toString(),
          plan_id: planId.toString()
        },
        subscription_data: plan.is_recurring ? {
          metadata: {
            user_id: userId.toString(),
            plan_id: planId.toString()
          }
        } : undefined
      });
      
      client.release();
      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Handle successful payment
  static async handlePaymentSuccess(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const client = await pool.connect();
      
      const userId = parseInt(session.metadata.user_id);
      const planId = parseInt(session.metadata.plan_id);
      
      // Get plan details
      const planResult = await client.query(`
        SELECT * FROM subscription_plans WHERE id = $1
      `, [planId]);
      
      const plan = planResult.rows[0];
      
      // Calculate subscription dates
      const now = new Date();
      const endDate = new Date(now.getTime() + (plan.duration_days * 24 * 60 * 60 * 1000));
      
      // Create or update subscription
      let subscriptionId;
      if (plan.is_recurring && session.subscription) {
        // Recurring subscription
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        const result = await client.query(`
          INSERT INTO user_subscriptions 
          (user_id, plan_id, stripe_subscription_id, stripe_customer_id, status, 
           current_period_start, current_period_end, trial_start, trial_end)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [
          userId,
          planId,
          subscription.id,
          session.customer,
          subscription.status,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000),
          subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
        ]);
        
        subscriptionId = result.rows[0].id;
      } else {
        // One-time payment
        const result = await client.query(`
          INSERT INTO user_subscriptions 
          (user_id, plan_id, stripe_customer_id, status, current_period_start, current_period_end)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [
          userId,
          planId,
          session.customer,
          'active',
          now,
          endDate
        ]);
        
        subscriptionId = result.rows[0].id;
      }
      
      // Record payment
      await client.query(`
        INSERT INTO payment_history 
        (user_id, subscription_id, stripe_payment_intent_id, amount, status, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        userId,
        subscriptionId,
        session.payment_intent,
        plan.price,
        'succeeded',
        'card'
      ]);
      
      // Send welcome email
      const userResult = await client.query(`
        SELECT * FROM users WHERE id = $1
      `, [userId]);
      
      const user = userResult.rows[0];
      
      await sendEmail({
        to: user.email,
        subject: `Welcome to Opsless ${plan.name} Plan!`,
        template: 'subscription-welcome',
        data: {
          name: user.name,
          planName: plan.name,
          planFeatures: plan.features,
          endDate: endDate.toLocaleDateString()
        }
      });
      
      client.release();
      return { success: true, subscriptionId };
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  // Get user's current subscription
  static async getUserSubscription(userId) {
    try {
      const client = await pool.connect();
      const result = await client.query(`
        SELECT us.*, sp.name as plan_name, sp.description, sp.features, sp.price
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = $1 AND us.status = 'active'
        ORDER BY us.created_at DESC
        LIMIT 1
      `, [userId]);
      
      client.release();
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  static async cancelSubscription(userId, cancelAtPeriodEnd = true) {
    try {
      const client = await pool.connect();
      
      // Get current subscription
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        throw new Error('No active subscription found');
      }
      
      if (subscription.stripe_subscription_id) {
        // Cancel Stripe subscription
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: cancelAtPeriodEnd
        });
      }
      
      // Update database
      await client.query(`
        UPDATE user_subscriptions 
        SET cancel_at_period_end = $1, updated_at = NOW()
        WHERE id = $2
      `, [cancelAtPeriodEnd, subscription.id]);
      
      // Send cancellation email
      const userResult = await client.query(`
        SELECT * FROM users WHERE id = $1
      `, [userId]);
      
      const user = userResult.rows[0];
      
      await sendEmail({
        to: user.email,
        subject: 'Subscription Cancellation Confirmed',
        template: 'subscription-cancelled',
        data: {
          name: user.name,
          planName: subscription.plan_name,
          cancelAtPeriodEnd,
          endDate: subscription.current_period_end
        }
      });
      
      client.release();
      return { success: true };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Check subscription status and send reminders
  static async checkSubscriptionStatus() {
    try {
      const client = await pool.connect();
      
      // Get subscriptions expiring in 3 days
      const expiringSubscriptions = await client.query(`
        SELECT us.*, u.email, u.name, sp.name as plan_name
        FROM user_subscriptions us
        JOIN users u ON us.user_id = u.id
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.status = 'active' 
        AND us.current_period_end BETWEEN NOW() AND NOW() + INTERVAL '3 days'
        AND us.cancel_at_period_end = false
      `);
      
      for (const subscription of expiringSubscriptions.rows) {
        await sendEmail({
          to: subscription.email,
          subject: 'Your Opsless subscription is expiring soon',
          template: 'subscription-expiring',
          data: {
            name: subscription.name,
            planName: subscription.plan_name,
            endDate: subscription.current_period_end,
            daysLeft: Math.ceil((new Date(subscription.current_period_end) - new Date()) / (1000 * 60 * 60 * 24))
          }
        });
      }
      
      // Get expired subscriptions
      const expiredSubscriptions = await client.query(`
        SELECT us.*, u.email, u.name, sp.name as plan_name
        FROM user_subscriptions us
        JOIN users u ON us.user_id = u.id
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.status = 'active' 
        AND us.current_period_end < NOW()
      `);
      
      for (const subscription of expiredSubscriptions.rows) {
        // Update status to expired
        await client.query(`
          UPDATE user_subscriptions 
          SET status = 'expired', updated_at = NOW()
          WHERE id = $1
        `, [subscription.id]);
        
        // Send expiration email
        await sendEmail({
          to: subscription.email,
          subject: 'Your Opsless subscription has expired',
          template: 'subscription-expired',
          data: {
            name: subscription.name,
            planName: subscription.plan_name,
            endDate: subscription.current_period_end
          }
        });
      }
      
      client.release();
      console.log(`Processed ${expiringSubscriptions.rows.length} expiring and ${expiredSubscriptions.rows.length} expired subscriptions`);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      throw error;
    }
  }

  // Upgrade/downgrade subscription
  static async changeSubscription(userId, newPlanId) {
    try {
      const client = await pool.connect();
      
      // Get current subscription
      const currentSubscription = await this.getUserSubscription(userId);
      if (!currentSubscription) {
        throw new Error('No active subscription found');
      }
      
      // Get new plan
      const newPlanResult = await client.query(`
        SELECT * FROM subscription_plans WHERE id = $1
      `, [newPlanId]);
      
      if (newPlanResult.rows.length === 0) {
        throw new Error('New plan not found');
      }
      
      const newPlan = newPlanResult.rows[0];
      
      // Handle Stripe subscription change
      if (currentSubscription.stripe_subscription_id) {
        await stripe.subscriptions.update(currentSubscription.stripe_subscription_id, {
          items: [{
            id: currentSubscription.stripe_subscription_id,
            price: newPlan.stripe_price_id,
          }],
          proration_behavior: 'create_prorations',
        });
      }
      
      // Update database
      await client.query(`
        UPDATE user_subscriptions 
        SET plan_id = $1, updated_at = NOW()
        WHERE id = $2
      `, [newPlanId, currentSubscription.id]);
      
      // Send upgrade email
      const userResult = await client.query(`
        SELECT * FROM users WHERE id = $1
      `, [userId]);
      
      const user = userResult.rows[0];
      
      await sendEmail({
        to: user.email,
        subject: 'Subscription Plan Changed',
        template: 'subscription-changed',
        data: {
          name: user.name,
          oldPlanName: currentSubscription.plan_name,
          newPlanName: newPlan.name,
          newFeatures: newPlan.features
        }
      });
      
      client.release();
      return { success: true };
    } catch (error) {
      console.error('Error changing subscription:', error);
      throw error;
    }
  }
}

export default SubscriptionService; 