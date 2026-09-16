import { Resend } from 'resend';

export const sendInvoiceEmail = async (order) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Make sure this points to your hosted logo image URL so email clients render it cleanly
  const logoUrl = "https://your-live-website.vercel.app/assets/logo2.png"; 

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #fed7aa; color: #451a03; font-size: 14px;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #fed7aa; color: #451a03; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #fed7aa; color: #ea580c; font-size: 14px; text-align: right; font-weight: bold;">₦${(item.price * item.quantity).toLocaleString()}</td>
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcf9f7; color: #451a03; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #fed7aa; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(120, 53, 15, 0.05); }
        .header { background-color: #ffffff; text-align: center; padding: 30px 20px 20px 20px; border-bottom: 3px solid #ea580c; }
        .logo { max-height: 65px; width: auto; margin-bottom: 12px; }
        .header h1 { margin: 0; color: #ea580c; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .body-content { padding: 30px; }
        p { line-height: 1.6; color: #582f0e; font-size: 14px; margin-top: 0; }
        .section-title { color: #ea580c; font-size: 18px; margin-top: 25px; margin-bottom: 12px; font-weight: 800; border-bottom: 1px solid #ffedd5; padding-bottom: 4px; }
        .bank-box { background-color: #fff7ed; border: 1.5px dashed #ea580c; border-radius: 10px; padding: 18px; margin: 15px 0 20px 0; }
        .bank-box strong { color: #451a03; font-size: 15px; }
        .bank-box ul { margin: 8px 0 0 0; padding-left: 20px; color: #78350f; font-size: 14px; }
        .bank-box li { margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #78350f; color: #ffffff; padding: 12px; text-align: left; font-size: 13px; font-weight: bold; text-transform: uppercase; }
        .summary-table td { padding: 10px 12px; border-bottom: 1px solid #ffedd5; font-size: 14px; }
        .address-box { background-color: #fff7ed; border: 1px solid #fed7aa; padding: 16px; margin-top: 15px; border-radius: 8px; line-height: 1.8; color: #78350f; font-size: 14px; }
        a { color: #ea580c; text-decoration: none; font-weight: bold; }
        .footer { text-align: center; font-size: 12px; color: #a8a29e; margin-top: 30px; border-top: 1px solid #fed7aa; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Logo Header -->
        <div class="header">
          <img src="${logoUrl}" alt="Hoodnas Nigeria Limited Logo" class="logo" />
          <h1>Order Invoice</h1>
        </div>

        <div class="body-content">
          <p>Hi <strong>${order.customer.fullName}</strong>,</p>
          <p>Thanks for your order! It is currently on-hold until payment confirmation.</p>
          <p>Please make your bank transfer directly into our account below and send a payment screenshot via WhatsApp for instant processing.</p>

          <p style="background-color: #fff7ed; padding: 12px; border-left: 4px solid #ea580c; font-size: 13px;">
            <strong>WhatsApp Payment Verification:</strong> +234 901 841 7341<br>
            <strong>Instagram:</strong> @hoodnas
          </p>

          <div class="section-title">Our Bank Details</div>

          <div class="bank-box">
            <strong>Hoodnas Nigeria Limited</strong>
            <ul>
              <li><strong>Bank:</strong> Guaranty Trust Bank (GTBank)</li>
              <li><strong>Account Number:</strong> <span style="color: #ea580c; font-size: 16px; font-weight: bold;">0123456789</span></li>
            </ul>
          </div>

          <div class="section-title">Order #${order.orderId} (${formattedDate})</div>

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

          <table class="summary-table" style="margin-top: 15px;">
            <tbody>
              <tr>
                <td style="color: #78350f; font-weight: bold;">Subtotal:</td>
                <td style="text-align: right; color: #451a03; font-weight: bold;">₦${order.totalAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="color: #78350f; font-weight: bold;">Shipping:</td>
                <td style="text-align: right; color: #78350f;">Shop Pickup / Local Delivery</td>
              </tr>
              <tr>
                <td style="color: #78350f; font-weight: bold;">Payment Method:</td>
                <td style="text-align: right; color: #78350f;">Direct Bank Transfer</td>
              </tr>
              <tr style="background-color: #fff7ed;">
                <td style="color: #ea580c; font-weight: 900; font-size: 16px;">Total:</td>
                <td style="text-align: right; color: #ea580c; font-weight: 900; font-size: 16px;">₦${order.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">Delivery & Contact Details</div>
          <div class="address-box">
            <strong style="color: #451a03;">${order.customer.fullName}</strong><br>
            ${order.customer.address}<br>
            Nigeria<br>
            <a href="tel:${order.customer.phone}">${order.customer.phone}</a><br>
            <a href="mailto:${order.customer.email}">${order.customer.email}</a>
          </div>

          <div class="footer">
            Thank you for buying from <strong>Hoodnas Nigeria Limited</strong>.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const data = await resend.emails.send({
    from: 'Hoodnas <onboarding@resend.dev>',
    to: [order.customer.email],
    subject: `[Hoodnas] Order #${order.orderId} Confirmation`,
    html: htmlContent,
  });

  if (data.error) {
    throw new Error(data.error.message);
  }
};