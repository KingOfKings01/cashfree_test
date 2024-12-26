const { Cashfree } = require("cashfree-pg"); 

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

const createOrder = async (orderId="devstudio_46857403", orderAmount=201.00, orderCurrency="INR", customerName="Harshith", customerID="1", customerEmail="test@cashfree.com", customerPhone="8474090589") => {
    try {
        const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        const formattedExpiryDate = expiryDate.toISOString();

        const request = {
            "order_amount": orderAmount,
            "order_currency": orderCurrency,
            "order_id": orderId,
            "customer_details": {
                "customer_id": customerID,
                "customer_phone": customerPhone,
                "customer_name": customerName,
                "customer_email": customerEmail
            },
            
            "order_meta": {
                // "return_url": "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}",
                "return_url": `http://localhost:3000/payment-status/${orderId}`, // calling getPaymentStatus
                "notify_url": "https://www.cashfree.com/devstudio/preview/pg/webhooks/67343668",
                "payment_methods": "cc,dc,upi"
            },

            "order_expiry_time": formattedExpiryDate, // Set the valid expiry date
            "order_note": "Order for premium subscription service",
            "order_tags": {
                "name": "Developer",
                "company": "Cashfree"
            }
        };
        
        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        console.log('Order created successfully:', response.data);
        
        return response.data.payment_session_id;
    } catch (error) {
        console.error('Error creating order:', error.message);
        console.error('Error response data:', error.response?.data);
        throw new Error('Error creating order');
    }
};

const getPaymentStatus = async (orderId) => {
    try {
        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
        console.log("Order fetched successfully:", response.data);

        let getOrderResponse = response.data;
        let orderStatus;

        if (
            getOrderResponse.filter(
                (transaction) => transaction.payment_status === "SUCCESS"
            ).length > 0
        ) {
            orderStatus = "Success";
        } else if (
            getOrderResponse.filter(
                (transaction) => transaction.payment_status === "PENDING"
            ).length > 0
        ) {
            orderStatus = "Pending";
        } else {
            orderStatus = "Failure";
        }

        console.log("Order status:", orderStatus);

        return orderStatus;
    } catch (error) {
        console.error('Error fetching order status:', error.message);
        console.error('Error response data:', error.response?.data);
        throw new Error('Error fetching order status');
    }
};

module.exports = {
    createOrder,
    getPaymentStatus
};
