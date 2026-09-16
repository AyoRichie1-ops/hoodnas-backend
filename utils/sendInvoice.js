import { Resend } from 'resend';

export const sendInvoiceEmail = async (order) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // PASTE YOUR PUBLIC IMAGE LINK HERE
  const logoUrl = "https://hoodnasnigerialimited.vercel.app/logo.png"; 

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 14px;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 14px; text-align: right; font-weight: bold;">₦${(item.price * item.quantity).toLocaleString()}</td>
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f9f9f9; color: #000000; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #000000; overflow: hidden; }
        .header { background-color: #000000; text-align: center; padding: 30px 20px; border-bottom: 5px solid #FFC107; }
        .logo { max-height: 65px; width: auto; margin-bottom: 15px; }
        .header h1 { margin: 0; color: #FFC107; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
        .body-content { padding: 30px; }
        p { line-height: 1.6; color: #000000; font-size: 14px; margin-top: 0; }
        .section-title { color: #000000; font-size: 18px; margin-top: 25px; margin-bottom: 12px; font-weight: 900; border-bottom: 2px solid #FFC107; padding-bottom: 6px; text-transform: uppercase; }
        .bank-box { background-color: #ffffff; border: 2px dashed #000000; padding: 18px; margin: 15px 0 20px 0; }
        .bank-box strong { color: #000000; font-size: 15px; }
        .bank-box ul { margin: 8px 0 0 0; padding-left: 20px; color: #000000; font-size: 14px; }
        .bank-box li { margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #FFC107; color: #000000; padding: 12px; text-align: left; font-size: 13px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000000; }
        .summary-table td { padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #000000; }
        .address-box { background-color: #f9f9f9; border: 1px solid #000000; padding: 16px; margin-top: 15px; line-height: 1.8; color: #000000; font-size: 14px; }
        a { color: #000000; text-decoration: underline; font-weight: bold; }
        .footer { text-align: center; font-size: 12px; color: #666666; margin-top: 30px; border-top: 1px solid #e5e5e5; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${'https://i.ibb.co/G3n8pk3v/logo2.png'}" alt="Hoodnas Nigeria Limited Logo" class="logo" />
          <h1>Order Invoice</h1>
        </div>

        <div class="body-content">
          <p>Hi <strong>${order.customer.fullName}</strong>,</p>
          <p>Thanks for your order! It is currently on-hold until payment confirmation.</p>
          <p>Please make your bank transfer directly into our account below and send a payment screenshot via WhatsApp for instant processing.</p>

          <p style="background-color: #FFC107; padding: 12px; font-size: 13px; color: #000000; font-weight: bold; border: 1px solid #000000;">
            WhatsApp Verification: +234 901 841 7341<br>
            Instagram: @hoodnas
          </p>

          <div class="section-title">Our Bank Details</div>

          <div class="bank-box">
            <strong>Hoodnas Nigeria Limited</strong>
            <ul>
              <li><strong>Bank:</strong> Guaranty Trust Bank (GTBank)</li>
              <li><strong>Account Number:</strong> <span style="font-size: 18px; font-weight: 900; background-color: #FFC107; padding: 0 5px;">0123456789</span></li>
            </ul>
          </div>

          <div class="section-title">Order #${order.orderId} (${formattedDate})</div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
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
                <td style="font-weight: bold;">Subtotal:</td>
                <td style="text-align: right; font-weight: bold;">₦${order.totalAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Shipping:</td>
                <td style="text-align: right;">Shop Pickup / Local Delivery</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Payment Method:</td>
                <td style="text-align: right;">Direct Bank Transfer</td>
              </tr>
              <tr style="background-color: #FFC107; border-top: 2px solid #000000; border-bottom: 2px solid #000000;">
                <td style="font-weight: 900; font-size: 16px;">Total:</td>
                <td style="text-align: right; font-weight: 900; font-size: 16px;">₦${order.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">Delivery & Contact</div>
          <div class="address-box">
            <strong>${order.customer.fullName}</strong><br>
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