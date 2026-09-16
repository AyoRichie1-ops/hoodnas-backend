import { Resend } from 'resend';

export const sendInvoiceEmail = async (order) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const logoUrl = "https://hoodnasnigerialimited.vercel.app/logo.png"; 

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #000000; color: #000000; font-size: 13px; font-family: 'Courier New', Courier, monospace;">${item.name}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #000000; color: #000000; font-size: 13px; text-align: center; font-family: 'Courier New', Courier, monospace;">${item.quantity}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #000000; color: #000000; font-size: 13px; text-align: right; font-weight: bold; font-family: 'Courier New', Courier, monospace;">₦${(item.price * item.quantity).toLocaleString()}</td>
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
        body { background-color: #ffffff; color: #000000; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #ffffff; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #000000; }
        
        /* Header Block */
        .header { background-color: #000000; color: #ffffff; padding: 25px 30px; border-bottom: 4px solid #ff6600; }
        .logo { max-height: 50px; width: auto; display: block; margin-bottom: 10px; }
        .invoice-title { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #ff6600; margin: 0; }
        .invoice-meta { font-size: 12px; color: #ffffff; text-transform: uppercase; margin-top: 5px; font-family: 'Courier New', Courier, monospace; }

        /* Body Sections */
        .content { padding: 30px; }
        .section-heading { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #ff6600; border-bottom: 2px solid #000000; padding-bottom: 4px; margin-top: 25px; margin-bottom: 12px; }
        
        p { font-size: 13px; line-height: 1.5; color: #000000; margin: 0 0 10px 0; }
        
        /* Tables */
        table { width: 100%; border-collapse: collapse; margin-top: 5px; }
        th { background-color: #000000; color: #ffffff; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 900; text-transform: uppercase; border: 1px solid #000000; }
        td { border: 1px solid #000000; }

        /* Bank Details Box */
        .bank-panel { border: 2px solid #000000; background-color: #ffffff; padding: 15px; margin-bottom: 20px; }
        .bank-panel table td { border: none; padding: 4px 0; font-size: 13px; }

        /* Summary Total Table */
        .summary-table td { padding: 8px 14px; font-size: 13px; border: 1px solid #000000; }
        .total-row { background-color: #000000; color: #ff6600; font-weight: 900; }

        /* Footer */
        .footer { background-color: #000000; color: #ffffff; text-align: center; padding: 15px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-top: 30px; }
        
        a { color: #000000; text-decoration: underline; font-weight: bold; }
      </style>
    </head>
    <body>
      <table class="wrapper" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table class="container" width="600" cellpadding="0" cellspacing="0">
              
              <!-- Header -->
              <tr>
                <td class="header">
                  <img src="${'https://i.ibb.co/G3n8pk3v/logo2.png'}" alt="Hoodnas Logo" class="logo" />
                  <div class="invoice-title">Official Invoice</div>
                  <div class="invoice-meta">Ref: #${order.orderId} | Date: ${formattedDate}</div>
                </td>
              </tr>

              <!-- Content Area -->
              <tr>
                <td class="content">
                  
                  <p>Dear <strong>${order.customer.fullName}</strong>,</p>
                  <p>Your order has been logged and is currently on-hold pending direct bank transfer verification. Please submit your payment reference as indicated below.</p>

                  <!-- Bank Details -->
                  <div class="section-heading">Payment Destination</div>
                  <div class="bank-panel">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="130"><strong>Beneficiary:</strong></td>
                        <td>Hoodnas Nigeria Limited</td>
                      </tr>
                      <tr>
                        <td><strong>Bank:</strong></td>
                        <td>Guaranty Trust Bank (GTBank)</td>
                      </tr>
                      <tr>
                        <td><strong>Account No:</strong></td>
                        <td><span style="font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: bold; background-color: #ff6600; padding: 0 4px; color: #000000;">0123456789</span></td>
                      </tr>
                    </table>
                  </div>

                  <!-- Order Items Table -->
                  <div class="section-heading">Line Items</div>
                  <table cellpadding="0" cellspacing="0">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th style="text-align: center;" width="60">Qty</th>
                        <th style="text-align: right;" width="110">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemRows}
                    </tbody>
                  </table>

                  <!-- Cost Breakdown Table -->
                  <table class="summary-table" cellpadding="0" cellspacing="0" style="margin-top: -1px;">
                    <tr>
                      <td><strong>Subtotal</strong></td>
                      <td width="110" style="text-align: right; font-weight: bold;">₦${order.totalAmount.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td><strong>Fulfillment</strong></td>
                      <td style="text-align: right; font-weight: bold;">Pickup / Direct Dispatch</td>
                    </tr>
                    <tr class="total-row">
                      <td style="color: #ff6600; font-size: 14px;">TOTAL PAYABLE</td>
                      <td style="text-align: right; color: #ff6600; font-size: 14px;">₦${order.totalAmount.toLocaleString()}</td>
                    </tr>
                  </table>

                  <!-- Customer Billing Data -->
                  <div class="section-heading">Customer / Delivery Data</div>
                  <p style="font-family: 'Courier New', Courier, monospace; background: #f4f4f4; padding: 12px; border: 1px solid #000000; margin: 0;">
                    <strong>Name:</strong> ${order.customer.fullName}<br/>
                    <strong>Address:</strong> ${order.customer.address}<br/>
                    <strong>Phone:</strong> ${order.customer.phone}<br/>
                    <strong>Email:</strong> ${order.customer.email}
                  </p>

                  <p style="margin-top: 20px; font-size: 11px; color: #444444;">
                    * Send payment confirmation screenshot to WhatsApp: <strong>+234 901 841 7341</strong> to trigger immediate dispatch.
                  </p>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td class="footer">
                  Hoodnas Nigeria Limited &mdash; All Rights Reserved
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const data = await resend.emails.send({
    from: 'Hoodnas <onboarding@resend.dev>',
    to: [order.customer.email],
    subject: `[Hoodnas] Invoice #${order.orderId}`,
    html: htmlContent,
  });

  if (data.error) {
    throw new Error(data.error.message);
  }
};