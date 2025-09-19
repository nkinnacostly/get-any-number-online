// Example usage of the updated SMS Pool API service
import { SMSPoolService } from "../services/sms-pool-api";

// Initialize the service with your API key
const smsPool = new SMSPoolService("your-api-key-here");

// Example: Get available services
async function getServices() {
  const result = await smsPool.getAvailableServices();

  if (result.success) {
    console.log("Available services:", result.data);
  } else {
    console.error("Error getting services:", result.error);
  }
}

// Example: Purchase a number
async function purchaseNumber() {
  const result = await smsPool.purchaseNumber("1", "US", {
    pricing_option: 0, // 0 for cheapest, 1 for highest success rate
    max_price: 0.5, // Maximum price per number
    quantity: 1, // Number of numbers to order
  });

  if (result.success) {
    console.log("Number purchased:", result.data);
    // Store the orderid for later use
    const orderId = result.data.orderid;
    return orderId;
  } else {
    console.error("Error purchasing number:", result.error);
  }
}

// Example: Check for messages
async function checkMessages(orderId: string) {
  const result = await smsPool.checkMessages(orderId);

  if (result.success) {
    console.log("Messages:", result.data);
    if (result.data.message) {
      console.log("Received message:", result.data.message);
    }
  } else {
    console.error("Error checking messages:", result.error);
  }
}

// Example: Cancel a number
async function cancelNumber(orderId: string) {
  const result = await smsPool.cancelNumber(orderId);

  if (result.success) {
    console.log("Number cancelled:", result.data);
  } else {
    console.error("Error cancelling number:", result.error);
  }
}

// Example: Get account balance
async function getBalance() {
  const result = await smsPool.getBalance();

  if (result.success) {
    console.log("Account balance:", result.data);
  } else {
    console.error("Error getting balance:", result.error);
  }
}

// Example: Get order history
async function getOrderHistory() {
  const result = await smsPool.getOrderHistory();

  if (result.success) {
    console.log("Order history:", result.data);
  } else {
    console.error("Error getting order history:", result.error);
  }
}

// Complete workflow example
async function completeWorkflow() {
  try {
    // 1. Check balance
    await getBalance();

    // 2. Get available services
    await getServices();

    // 3. Purchase a number
    const orderId = await purchaseNumber();

    if (orderId) {
      // 4. Wait a bit for messages (in real app, you'd poll periodically)
      setTimeout(async () => {
        await checkMessages(orderId);
      }, 30000); // Wait 30 seconds

      // 5. Cancel the number when done
      setTimeout(async () => {
        await cancelNumber(orderId);
      }, 300000); // Cancel after 5 minutes
    }
  } catch (error) {
    console.error("Workflow error:", error);
  }
}

export {
  getServices,
  purchaseNumber,
  checkMessages,
  cancelNumber,
  getBalance,
  getOrderHistory,
  completeWorkflow,
};
