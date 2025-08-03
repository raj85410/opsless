import cron from 'cron';
import SubscriptionService from './subscriptionService.js';
import { logger } from '../utils/logger.js';
import pool from '../database/connection.js';

export class CronService {
  static initializeCronJobs() {
    // Check subscription status daily at 9 AM
    const subscriptionCheckJob = new cron.CronJob(
      '0 9 * * *', // Every day at 9:00 AM
      async () => {
        try {
          logger.info('Running daily subscription status check');
          await SubscriptionService.checkSubscriptionStatus();
          logger.info('Daily subscription status check completed');
        } catch (error) {
          logger.error('Error in daily subscription status check:', error);
        }
      },
      null,
      false,
      'UTC'
    );

    // Check for expiring trials every 6 hours
    const trialCheckJob = new cron.CronJob(
      '0 */6 * * *', // Every 6 hours
      async () => {
        try {
          logger.info('Running trial expiration check');
          await SubscriptionService.checkSubscriptionStatus();
          logger.info('Trial expiration check completed');
        } catch (error) {
          logger.error('Error in trial expiration check:', error);
        }
      },
      null,
      false,
      'UTC'
    );

    // Weekly subscription analytics (every Monday at 8 AM)
    const analyticsJob = new cron.CronJob(
      '0 8 * * 1', // Every Monday at 8:00 AM
      async () => {
        try {
          logger.info('Running weekly subscription analytics');
          await this.generateWeeklyAnalytics();
          logger.info('Weekly subscription analytics completed');
        } catch (error) {
          logger.error('Error in weekly subscription analytics:', error);
        }
      },
      null,
      false,
      'UTC'
    );

    // Start all jobs
    subscriptionCheckJob.start();
    trialCheckJob.start();
    analyticsJob.start();

    logger.info('Cron jobs initialized successfully');

    return {
      subscriptionCheckJob,
      trialCheckJob,
      analyticsJob
    };
  }

  static async generateWeeklyAnalytics() {
    try {
      const client = await pool.connect();
      
      // Get subscription statistics
      const stats = await client.query(`
        SELECT 
          COUNT(*) as total_subscriptions,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_subscriptions,
          COUNT(CASE WHEN cancel_at_period_end = true THEN 1 END) as cancelling_subscriptions,
          SUM(CASE WHEN status = 'active' THEN sp.price ELSE 0 END) as total_revenue
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.created_at >= NOW() - INTERVAL '7 days'
      `);

      // Get plan distribution
      const planDistribution = await client.query(`
        SELECT 
          sp.name as plan_name,
          COUNT(*) as count,
          SUM(sp.price) as revenue
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.status = 'active'
        GROUP BY sp.id, sp.name
        ORDER BY count DESC
      `);

      // Get new subscriptions this week
      const newSubscriptions = await client.query(`
        SELECT 
          DATE(us.created_at) as date,
          COUNT(*) as count
        FROM user_subscriptions us
        WHERE us.created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(us.created_at)
        ORDER BY date
      `);

      client.release();

      const analytics = {
        period: 'weekly',
        date: new Date().toISOString(),
        summary: stats.rows[0],
        planDistribution: planDistribution.rows,
        newSubscriptions: newSubscriptions.rows
      };

      logger.info('Weekly analytics generated:', analytics);
      
      // You could send this to a dashboard, store in database, or send via email
      return analytics;
    } catch (error) {
      logger.error('Error generating weekly analytics:', error);
      throw error;
    }
  }

  static async generateMonthlyAnalytics() {
    try {
      const client = await pool.connect();
      
      // Get monthly subscription statistics
      const stats = await client.query(`
        SELECT 
          COUNT(*) as total_subscriptions,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_subscriptions,
          COUNT(CASE WHEN cancel_at_period_end = true THEN 1 END) as cancelling_subscriptions,
          SUM(CASE WHEN status = 'active' THEN sp.price ELSE 0 END) as total_revenue,
          AVG(CASE WHEN status = 'active' THEN sp.price ELSE NULL END) as average_revenue_per_subscription
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.created_at >= NOW() - INTERVAL '30 days'
      `);

      // Get churn rate
      const churnRate = await client.query(`
        SELECT 
          COUNT(CASE WHEN status = 'expired' THEN 1 END) * 100.0 / 
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as churn_rate
        FROM user_subscriptions
        WHERE created_at >= NOW() - INTERVAL '60 days'
      `);

      // Get conversion rate (trial to paid)
      const conversionRate = await client.query(`
        SELECT 
          COUNT(CASE WHEN us.status = 'active' AND sp.price > 0 THEN 1 END) * 100.0 /
          COUNT(CASE WHEN sp.price = 0 THEN 1 END) as conversion_rate
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.created_at >= NOW() - INTERVAL '30 days'
      `);

      client.release();

      const analytics = {
        period: 'monthly',
        date: new Date().toISOString(),
        summary: stats.rows[0],
        churnRate: churnRate.rows[0]?.churn_rate || 0,
        conversionRate: conversionRate.rows[0]?.conversion_rate || 0
      };

      logger.info('Monthly analytics generated:', analytics);
      
      return analytics;
    } catch (error) {
      logger.error('Error generating monthly analytics:', error);
      throw error;
    }
  }

  static async sendAnalyticsReport(analytics, recipients = []) {
    try {
      // You could implement email sending here
      logger.info('Analytics report generated:', {
        period: analytics.period,
        totalSubscriptions: analytics.summary?.total_subscriptions,
        activeSubscriptions: analytics.summary?.active_subscriptions,
        totalRevenue: analytics.summary?.total_revenue
      });
    } catch (error) {
      logger.error('Error sending analytics report:', error);
    }
  }
}

export default CronService; 