// Mock payment service for testing
// In production, this would be replaced with actual backend API calls

interface CreateOrderRequest {
  amount: number;
  currency: string;
  planId: string;
  planName: string;
}

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
}

interface VerifyPaymentRequest {
  paymentId: string;
  orderId: string;
  signature: string;
  planId: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}

// Mock order storage (in production, this would be a database)
let mockOrders: { [key: string]: CreateOrderResponse } = {};

export const paymentService = {
  // Create a mock order
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const order: CreateOrderResponse = {
      orderId,
      amount: request.amount,
      currency: request.currency
    };
    
    // Store the order (in production, this would be in a database)
    mockOrders[orderId] = order;
    
    console.log('Created mock order:', order);
    
    return order;
  },

  // Verify a mock payment
  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if order exists
    if (!mockOrders[request.orderId]) {
      return {
        success: false,
        message: 'Order not found'
      };
    }
    
    // In a real implementation, you would verify the signature here
    // For now, we'll just simulate a successful verification
    
    console.log('Verifying payment:', request);
    
    // Simulate 95% success rate for testing
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      // Clean up the order
      delete mockOrders[request.orderId];
      
      return {
        success: true,
        message: 'Payment verified successfully'
      };
    } else {
      return {
        success: false,
        message: 'Payment verification failed'
      };
    }
  },

  // Get all mock orders (for debugging)
  getMockOrders() {
    return mockOrders;
  },

  // Clear mock orders (for testing)
  clearMockOrders() {
    mockOrders = {};
  }
}; 