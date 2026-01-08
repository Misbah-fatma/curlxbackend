import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOrderEmail = async ({
  user,
  items,
  amount,
  paymentMethod,
  paymentId,
  address,
}) => {
  // Products rows
  const productRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">${item.name}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.qty}</td>
        <td style="padding:8px;border:1px solid #ddd;">$${item.price}</td>
        <td style="padding:8px;border:1px solid #ddd;">
          $${(item.price * item.qty).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "🛒 New Order Payment Submitted",
    text: `
New Order Received

User: ${user.name} (${user.email})
Phone: ${address.phone || "N/A"}

Address:
${address.addressLine1}
${address.addressLine2 || ""}
${address.city}, ${address.state}
${address.country} - ${address.zipCode}

Payment Method: ${paymentMethod}
Payment ID: ${paymentId}
Total: $${amount}
    `,
    html: `
      <div style="font-family:Arial,sans-serif;">
        <h2>🛒 New Order Received</h2>

        <h3>User Details</h3>
        <table style="border-collapse:collapse;width:100%;">
          <tr>
            <td style="padding:8px;border:1px solid #ddd;"><strong>Name</strong></td>
            <td style="padding:8px;border:1px solid #ddd;">${user.name}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;"><strong>Email</strong></td>
            <td style="padding:8px;border:1px solid #ddd;">${user.email}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;"><strong>Phone</strong></td>
            <td style="padding:8px;border:1px solid #ddd;">${address.phone || "N/A"}</td>
          </tr>
        </table>

        <h3>Shipping Address</h3>
        <table style="border-collapse:collapse;width:100%;">
          <tr>
            <td style="padding:8px;border:1px solid #ddd;">
              ${address.addressLine1}<br/>
              ${address.addressLine2 || ""}<br/>
              ${address.city}, ${address.state}<br/>
              ${address.country} - ${address.zipCode}
            </td>
          </tr>
        </table>

        <h3>Products</h3>
        <table style="border-collapse:collapse;width:100%;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ddd;">Product</th>
              <th style="padding:8px;border:1px solid #ddd;">Qty</th>
              <th style="padding:8px;border:1px solid #ddd;">Price</th>
              <th style="padding:8px;border:1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>

        <h3>Payment Info</h3>
        <table style="border-collapse:collapse;width:100%;">
          <tr>
            <td style="padding:8px;border:1px solid #ddd;"><strong>Payment Method</strong></td>
            <td style="padding:8px;border:1px solid #ddd;">${paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;"><strong>Payment ID</strong></td>
            <td style="padding:8px;border:1px solid #ddd;">${paymentId}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;"><strong>Total Amount</strong></td>
            <td style="padding:8px;border:1px solid #ddd;"><strong>$${amount}</strong></td>
          </tr>
        </table>

        <p style="margin-top:20px;color:#777;">
          Status: <strong>PENDING_VERIFICATION</strong>
        </p>
      </div>
    `,
  };

  await sgMail.send(msg);
};
