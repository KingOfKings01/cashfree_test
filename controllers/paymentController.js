const path = require("path");
const {
  createOrder,
  getPaymentStatus,
} = require("../services/cashfreeService");
const Payment = require("../models/paymentModel");
const TemplateGenerator = require("../Template/htmltemp");

exports.getPaymentPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
};

exports.processPayment = async (req, res) => {
  // aasifkhan9605@gmail.com
  const email =  req.body.email                                                                                                                             || process.env.EMAIL
  const phone = req.body.phone                                                                                                                              || process.env.PHONE
  
   const orderId = "ORDER-" + Date.now();
  const orderAmount = 2000;
  const orderCurrency = "INR";
  const customerEmail = email;
  const customerPhone = phone;

  try {
    console.log("Running payment test...");

    const paymentSessionId = await createOrder(
      orderId,
      orderAmount,
      orderCurrency
    );

    // Save payment details to the database
    await Payment.create({
      orderId,
      paymentSessionId,
      orderAmount,
      orderCurrency,
      customerEmail,
      customerPhone,
      paymentStatus: "Pending",
    });

    res.json({ paymentSessionId });
  } catch (error) {
    console.error("Error processing payment:", error.message);
    console.error("Stack Trace:", error.stack);
    res.status(500).json({ message: "Error processing payment" });
  }
};

exports.getPaymentStatus = async (req, res) => {
  const paymentSessionId = req.params.paymentSessionId; 

  try {
    const orderStatus = await getPaymentStatus(paymentSessionId);

    // Update payment status in the database
    const order = await Payment.findOne({ paymentSessionId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order's status
    order.status = orderStatus;
    await order.save();
    
    const htmlTemp = TemplateGenerator(order.orderId, orderStatus, order.orderAmount)
    
    res.send(htmlTemp)

  } catch (error) {
    console.error("Error fetching payment status:", error.message);
    res.status(500).json({ message: "Error fetching payment status" });
  }
};  