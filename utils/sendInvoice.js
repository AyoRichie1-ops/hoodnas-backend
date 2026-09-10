import nodemailer from 'nodemailer';

export const sendInvoiceEmail = async (order) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Let Nodemailer handle the host resolution directly
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Format date: September 10, 2026
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border: 1px solid #333333; color: #e0e0e0;">${item.name}</td>
        <td style="padding: 12px; border: 1px solid #333333; color: #e0e0e0; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border: 1px solid #333333; color: #e0e0e0; text-align: right;">₦${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #121212; color: #e0e0e0; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1e1e1e; border-radius: 6px; overflow: hidden; }
        .header { background-color: #a8629b; color: #ffffff; padding: 40px 30px; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 300; line-height: 1.2; }
        .body-content { padding: 30px; }
        p { line-height: 1.6; color: #cccccc; font-size: 14px; }
        .section-title { color: #d680c1; font-size: 20px; margin-top: 25px; margin-bottom: 15px; font-weight: 600; }
        .bank-details { margin-bottom: 20px; }
        .bank-details strong { color: #ffffff; font-size: 16px; }
        .bank-details ul { margin: 5px 0 15px 0; padding-left: 20px; color: #cccccc; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
        th { border: 1px solid #333333; padding: 12px; text-align: left; color: #a8629b; }
        .summary-table td { border: 1px solid #333333; padding: 12px; }
        .address-box { border: 1px solid #333333; padding: 15px; margin-top: 15px; border-radius: 4px; line-height: 1.8; color: #aaaaaa; }
        a { color: #d680c1; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank you for your order</h1>
        </div>

        <div class="body-content">
          <p>Hi ${order.customer.fullName},</p>
          <p>Thanks for your order. It's on-hold until we confirm that payment has been received.</p>
          <p>Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.</p>

          <p>Kindly Send screenshot of payment to:<br>
          Instagram: @hoodnas<br>
          WhatsApp: +234 901 841 7341</p>

          <div class="section-title">Our bank details</div>

          <div class="bank-details">
            <strong>Hoodnas Nigeria Limited:</strong>
            <ul>
              <li>Bank: GTBank</li>
              <li>Account number: 0123456789</li>
            </ul>
          </div>

          <div class="section-title">[Order #${order.orderId}] (${formattedDate})</div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <table class="summary-table" style="margin-top: 20px;">
            <tbody>
              <tr>
                <td style="color: #ffffff; font-weight: bold;">Subtotal:</td>
                <td style="text-align: right; color: #ffffff;">₦${order.totalAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="color: #ffffff; font-weight: bold;">Shipping:</td>
                <td style="text-align: right; color: #cccccc;">Shop Pickup</td>
              </tr>
              <tr>
                <td style="color: #ffffff; font-weight: bold;">Payment method:</td>
                <td style="text-align: right; color: #cccccc;">Direct bank transfer</td>
              </tr>
              <tr>
                <td style="color: #ffffff; font-weight: bold;">Total:</td>
                <td style="text-align: right; color: #ffffff; font-weight: bold;">₦${order.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">Billing address</div>
          <div class="address-box">
            <strong style="color: #ffffff;">${order.customer.fullName}</strong><br>
            ${order.customer.address}<br>
            Nigeria<br>
            <a href="tel:${order.customer.phone}">${order.customer.phone}</a><br>
            <a href="mailto:${order.customer.email}">${order.customer.email}</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Hoodnas" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `[Hoodnas] Order #${order.orderId} Confirmation`,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};