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
        <td style="padding: 12px; border-bottom: 1px solid #000000; color: #000000; font-size: 14px;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #000000; color: #000000; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #000000; color: #ff6600; font-size: 14px; text-align: right; font-weight: bold;">₦${(item.price * item.quantity).toLocaleString()}</td>
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
        /* STRICT PALETTE: #000000 (Black), #ff6600 (Orange), #ffffff (White) */
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #ffffff; color: #000000; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 4px solid #000000; overflow: hidden; }
        
        .header { background-color: #000000; text-align: center; padding: 30px 20px; border-bottom: 6px solid #ff6600; }
        .logo { max-height: 65px; width: auto; margin-bottom: 15px; }
        .header h1 { margin: 0; color: #ff6600; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
        
        .body-content { padding: 30px; }
        p { line-height: 1.6; color: #000000; font-size: 14px; margin-top: 0; font-weight: bold; }
        
        .section-title { color: #ff6600; font-size: 18px; margin-top: 25px; margin-bottom: 12px; font-weight: 900; border-bottom: 3px solid #000000; padding-bottom: 6px; text-transform: uppercase; }
        
        /* Inverted Bank Box */
        .bank-box { background-color: #000000; color: #ffffff; border: 3px solid #ff6600; padding: 18px; margin: 15px 0 20px 0; }
        .bank-box strong { color: #ff6600; font-size: 15px; text-transform: uppercase;}
        .bank-box ul { margin: 8px 0 0 0; padding-left: 20px; color: #ffffff; font-size: 14px; font-weight: bold; }
        .bank-box li { margin-bottom: 4px; }
        .bank-box .account-number { font-size: 20px; font-weight: 900; color: #ffffff; background-color: #ff6600; padding: 2px 8px; color: #000000;}
        
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #ff6600; color: #ffffff; padding: 12px; text-align: left; font-size: 13px; font-weight: 900; text-transform: uppercase; border-bottom: 3px solid #000000; border-top: 3px solid #000000; }
        
        .summary-table td { padding: 10px 12px; border-bottom: 1px solid #000000; font-size: 14px; color: #000000; }
        .total-row { background-color: #000000; color: #ff6600; }
        .total-row td { border: none; }
        
        .address-box { background-color: #ffffff; border: 3px solid #000000; padding: 16px; margin-top: 15px; line-height: 1.8; color: #000000; font-size: 14px; font-weight: bold; }
        a { color: #ff6600; text-decoration: none; font-weight: 900; text-transform: uppercase; }
        
        .footer { text-align: center; font-size: 13px; color: #000000; margin-top: 30px; border-top: 3px solid #000000; padding-top: 15px; font-weight: 900; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${'https://i.ibb.co/G3n8pk3v/logo2.png'}" alt="Hoodnas Nigeria Limited Logo" class="logo" />
          <h1>Order Invoice</h1>
        </div>

        <div class="body-content">
          <p>Hi <strong style="color: #ff6600; text-transform: uppercase;">${order.customer.fullName}</strong>,</p>
          <p>Thanks for your order! It is currently on-hold until payment confirmation.</p>
          <p>Please make your bank transfer directly into our account below and send a payment screenshot via WhatsApp for instant processing.</p>

          <p style="background-color: #000000; color: #ffffff; padding: 12px; font-size: 13px; font-weight: bold; border-left: 5px solid #ff6600;">
            <strong style="color: #ff6600;">WHATSAPP VERIFICATION:</strong> +234 803 328 4246<br>
          </p>

          <div class="section-title">Our Bank Details</div>

          <div class="bank-box">
            <strong>Hoodnas Nigeria Limited</strong>
            <ul>
              <li>BANK: Guaranty Trust Bank (GTBank)</li>
              <li>ACCOUNT NUMBER: <span class="account-number">0123456789</span></li>
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
                <td style="font-weight: 900; text-transform: uppercase;">Subtotal:</td>
                <td style="text-align: right; font-weight: bold;">₦${order.totalAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="font-weight: 900; text-transform: uppercase;">Shipping:</td>
                <td style="text-align: right; font-weight: bold;">Shop Pickup / Local Delivery</td>
              </tr>
              <tr>
                <td style="font-weight: 900; text-transform: uppercase;">Payment Method:</td>
                <td style="text-align: right; font-weight: bold;">Direct Bank Transfer</td>
              </tr>
              <tr class="total-row">
                <td style="font-weight: 900; font-size: 16px; text-transform: uppercase;">Total:</td>
                <td style="text-align: right; font-weight: 900; font-size: 16px;">₦${order.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">Delivery & Contact</div>
          <div class="address-box">
            <strong style="color: #ff6600; text-transform: uppercase; font-size: 16px;">${order.customer.fullName}</strong><br>
            ${order.customer.address}<br>
            NIGERIA<br>
            <a href="tel:${order.customer.phone}">${order.customer.phone}</a><br>
            <a href="mailto:${order.customer.email}">${order.customer.email}</a>
          </div>

          <div class="footer">
            Thank you for buying from <span style="color: #ff6600;">Hoodnas Nigeria Limited</span>.
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