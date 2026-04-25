const paymentMessage = document.getElementById("payment-message");

function showMessage(message) {
  if (paymentMessage) paymentMessage.textContent = message;
}

paypal.Buttons({
  style: {
    layout: "vertical",
    color: "gold",
    shape: "pill",
    label: "pay",
    height: 45
  },

  async createOrder() {
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const order = await response.json();

      if (!response.ok) {
        throw new Error(order.error || "Could not create order");
      }

      return order.id;
    } catch (error) {
      console.error(error);
      showMessage("Could not start PayPal payment. Please try again.");
    }
  },

  async onApprove(data) {
    try {
      showMessage("Processing your payment...");

      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not capture payment");
      }

      if (result.status === "COMPLETED" && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        showMessage("Payment was not completed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      showMessage("Payment failed or was not completed.");
    }
  },

  onCancel() {
    window.location.href = "/cancel";
  },

  onError(error) {
    console.error(error);
    showMessage("PayPal error. Please refresh and try again.");
  }
}).render("#paypal-button-container");
