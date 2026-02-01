// Email templates for ApplyBetter

export interface OrderConfirmationData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  orderUrl: string; // Magic link to order page
}

export interface CVDeliveryData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  downloadUrl: string;
  orderUrl: string; // Magic link to order page
}

export function getOrderConfirmationEmail(data: OrderConfirmationData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Thanks ${data.customerName.split(" ")[0]}! Your CV revamp is underway`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FFFBF5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #FF6B6B; font-size: 24px; margin: 0;">ApplyBetter</h1>
    </div>
    
    <!-- Main Content -->
    <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h2 style="color: #2D3748; font-size: 20px; margin: 0 0 16px 0;">
        Thanks ${data.customerName.split(" ")[0]}! 🎉
      </h2>
      
      <p style="color: #4A5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        I've received your CV and all the details you shared. I'm excited to help make your experience shine through.
      </p>
      
      <div style="background-color: #F7FAFC; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="color: #718096; font-size: 14px; margin: 0 0 8px 0;">Order Reference</p>
        <p style="color: #2D3748; font-size: 16px; font-weight: 600; margin: 0;">#${data.orderId.slice(0, 8).toUpperCase()}</p>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${data.orderUrl}" style="display: inline-block; background-color: #FF6B6B; color: white; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 50px;">
          View Order Status
        </a>
      </div>
      
      <h3 style="color: #2D3748; font-size: 16px; margin: 0 0 16px 0;">Here's what happens next:</h3>
      
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
          <span style="background-color: #FF6B6B; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0;">1</span>
          <p style="color: #4A5568; font-size: 14px; margin: 0; line-height: 24px;">I review your CV and the context you provided</p>
        </div>
        <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
          <span style="background-color: #FF6B6B; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0;">2</span>
          <p style="color: #4A5568; font-size: 14px; margin: 0; line-height: 24px;">I rewrite it to be clear, scannable, and impact-first</p>
        </div>
        <div style="display: flex; align-items: flex-start;">
          <span style="background-color: #FF6B6B; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0;">3</span>
          <p style="color: #4A5568; font-size: 14px; margin: 0; line-height: 24px;">You'll receive your rewritten CV within <strong>48-96 hours</strong></p>
        </div>
      </div>
      
      <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin: 0;">
        If you have any questions in the meantime, just reply to this email.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #A0AEC0; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} ApplyBetter. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Thanks ${data.customerName.split(" ")[0]}!

I've received your CV and all the details you shared. I'm excited to help make your experience shine through.

Order Reference: #${data.orderId.slice(0, 8).toUpperCase()}

View your order status: ${data.orderUrl}

Here's what happens next:

1. I review your CV and the context you provided
2. I rewrite it to be clear, scannable, and impact-first
3. You'll receive your rewritten CV within 48-96 hours

If you have any questions in the meantime, just reply to this email.

- ApplyBetter
  `.trim();

  return { subject, html, text };
}

export function getCVDeliveryEmail(data: CVDeliveryData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Your rewritten CV is ready! 🎉`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your CV is Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FFFBF5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #FF6B6B; font-size: 24px; margin: 0;">ApplyBetter</h1>
    </div>
    
    <!-- Main Content -->
    <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h2 style="color: #2D3748; font-size: 20px; margin: 0 0 16px 0;">
        Great news, ${data.customerName.split(" ")[0]}! 🎉
      </h2>
      
      <p style="color: #4A5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Your rewritten CV is ready for download. I've restructured it to highlight your impact and make it easy for recruiters to see your value in seconds.
      </p>
      
      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${data.orderUrl}" style="display: inline-block; background-color: #FF6B6B; color: white; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 50px;">
          View Order & Download
        </a>
      </div>

      <p style="color: #718096; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
        Or download directly: <a href="${data.downloadUrl}" style="color: #FF6B6B;">Download CV</a>
      </p>
      
      <div style="background-color: #F7FAFC; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h3 style="color: #2D3748; font-size: 14px; margin: 0 0 12px 0;">Quick tips for your job search:</h3>
        <ul style="color: #4A5568; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Tailor the summary for each application</li>
          <li>Match keywords from job descriptions</li>
          <li>Keep it to 1-2 pages maximum</li>
        </ul>
      </div>

      <div style="background-color: #EBF8FF; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="color: #2B6CB0; font-size: 14px; margin: 0;">
          <strong>Need changes?</strong> You can request a revision directly from your <a href="${data.orderUrl}" style="color: #2B6CB0;">order page</a>.
        </p>
      </div>
      
      <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin: 0;">
        If you have any questions, just reply to this email. I'm here to help!
      </p>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #A0AEC0; font-size: 12px; margin: 0 0 8px 0;">
        Order Reference: #${data.orderId.slice(0, 8).toUpperCase()}
      </p>
      <p style="color: #A0AEC0; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} ApplyBetter. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Great news, ${data.customerName.split(" ")[0]}!

Your rewritten CV is ready for download. I've restructured it to highlight your impact and make it easy for recruiters to see your value in seconds.

View your order and download: ${data.orderUrl}

Or download directly: ${data.downloadUrl}

Quick tips for your job search:
- Tailor the summary for each application
- Match keywords from job descriptions
- Keep it to 1-2 pages maximum

Need changes? You can request a revision from your order page: ${data.orderUrl}

If you have any questions, just reply to this email. I'm here to help!

Order Reference: #${data.orderId.slice(0, 8).toUpperCase()}

- ApplyBetter
  `.trim();

  return { subject, html, text };
}
