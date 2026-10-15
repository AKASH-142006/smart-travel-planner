const nodemailer = require('nodemailer');
const { getPool } = require('./db');

// Create reusable transporter (fallback to test/mock if SMTP environment variables not provided)
let transporter;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  // Graceful fallback for local development: logs email and records in DB
  transporter = {
    sendMail: async (mailOptions) => {
      console.log(`\n======================================================`);
      console.log(`📨 [EMAIL DISPATCHED] To: ${mailOptions.to}`);
      console.log(`📌 Subject: ${mailOptions.subject}`);
      console.log(`======================================================\n`);
      return { messageId: 'simulated-' + Date.now() };
    }
  };
}

/**
 * Log email to database
 */
async function logEmailToDB(bookingId, recipientEmail, subject, htmlBody, type) {
  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO email_notifications (booking_id, recipient_email, subject, body, type, status)
       VALUES (?, ?, ?, ?, ?, 'Sent')`,
      [bookingId || null, recipientEmail, subject, htmlBody, type]
    );
  } catch (err) {
    console.error('[Email Log Error]', err.message);
  }
}

/**
 * Send Trip Planned Confirmation Email to Customer
 */
async function sendTripPlannedEmail(booking) {
  const recipient = booking.customer_email;
  const subject = `✈️ Trip Plan Received: ${booking.destination_name} (Receipt #${booking.receipt_no})`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #0a2540 0%, #1e3a8a 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; }
        .header p { margin: 0; font-size: 14px; opacity: 0.85; }
        .content { padding: 28px 24px; }
        .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; background: #fef3c7; color: #b45309; margin-bottom: 20px; }
        .trip-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; }
        .row:last-child { border-bottom: none; font-weight: 800; font-size: 16px; color: #0f172a; padding-top: 12px; }
        .label { color: #64748b; }
        .value { font-weight: 600; text-align: right; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧭 Smart Travel Planner</h1>
          <p>Your Trip Plan is Received & Under Review</p>
        </div>
        <div class="content">
          <p>Dear <strong>${booking.customer_name}</strong>,</p>
          <div class="badge">⏳ Status: Submitted for Admin Review</div>
          <p>Thank you for planning your travel itinerary with us! Your trip package for <strong>${booking.destination_name}</strong> has been received and forwarded to our travel administration team for approval.</p>
          
          <div class="trip-box">
            <h3 style="margin: 0 0 14px; color: #0a2540; font-size: 16px;">📋 Booking Summary</h3>
            <div class="row"><span class="label">Receipt Number:</span><span class="value">${booking.receipt_no}</span></div>
            <div class="row"><span class="label">Destination:</span><span class="value">${booking.destination_name}</span></div>
            <div class="row"><span class="label">Hotel / Stay:</span><span class="value">${booking.hotel_name || 'Selected Stay'}</span></div>
            <div class="row"><span class="label">Transport:</span><span class="value">${booking.transport_name || 'Selected Mode'}</span></div>
            <div class="row"><span class="label">Total Amount:</span><span class="value" style="color: #10b981;">₹${Number(booking.total_price).toLocaleString()}</span></div>
          </div>
          
          <p style="font-size: 13.5px; line-height: 1.6; color: #475569;">
            Our travel administrators will review your accommodation & transit slots. You will receive an official approval email once confirmed!
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0 0 6px;">Need assistance? Contact our team at support@smarttravelplanner.in</p>
          <p style="margin: 0;">Smart Travel Planner © 2026. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: '"Smart Travel Planner" <no-reply@smarttravelplanner.in>',
    to: recipient,
    subject: subject,
    html: html
  });

  await logEmailToDB(booking.id, recipient, subject, html, 'Trip_Planned');
  return { success: true, recipient, subject };
}

/**
 * Send Trip Approved Email to Customer
 */
async function sendTripApprovedEmail(booking) {
  const recipient = booking.customer_email;
  const subject = `🎉 TRIP APPROVED: Your Trip to ${booking.destination_name} is Confirmed! (Receipt #${booking.receipt_no})`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #bbf7d0; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.1); }
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; }
        .header p { margin: 0; font-size: 15px; font-weight: 600; opacity: 0.95; }
        .content { padding: 28px 24px; }
        .approved-card { background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px; }
        .approved-card h2 { color: #15803d; margin: 0 0 4px; font-size: 20px; }
        .trip-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; }
        .row:last-child { border-bottom: none; font-weight: 800; font-size: 16px; color: #0f172a; padding-top: 12px; }
        .label { color: #64748b; }
        .value { font-weight: 600; text-align: right; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Smart Travel Planner</h1>
          <p>Official Trip Approval Certificate</p>
        </div>
        <div class="content">
          <p>Dear <strong>${booking.customer_name}</strong>,</p>
          
          <div class="approved-card">
            <h2>✅ TRIP OFFICIALLY APPROVED!</h2>
            <p style="margin: 0; color: #166534; font-size: 13.5px;">Your bookings, hotel accommodation, and transit vouchers are verified.</p>
          </div>

          <p>We are delighted to confirm that your trip to <strong>${booking.destination_name}</strong> has been reviewed and approved by the administrator!</p>

          <div class="trip-box">
            <h3 style="margin: 0 0 14px; color: #0a2540; font-size: 16px;">🎟️ Approved Itinerary Details</h3>
            <div class="row"><span class="label">Receipt Number:</span><span class="value">${booking.receipt_no}</span></div>
            <div class="row"><span class="label">Destination:</span><span class="value">${booking.destination_name}</span></div>
            <div class="row"><span class="label">Hotel / Resort:</span><span class="value">${booking.hotel_name || 'Confirmed Stay'}</span></div>
            <div class="row"><span class="label">Transit Mode:</span><span class="value">${booking.transport_name || 'Confirmed Transport'}</span></div>
            <div class="row"><span class="label">Total Paid:</span><span class="value" style="color: #10b981;">₹${Number(booking.total_price).toLocaleString()}</span></div>
          </div>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px; margin-top: 16px;">
            <p style="margin: 0; font-size: 13px; color: #1e40af;">
              💡 <strong>Travel Tips:</strong> Please carry a valid government photo ID (Aadhaar/Passport/Driving License) when checking into ${booking.hotel_name || 'the hotel'} and boarding ${booking.transport_name || 'your transport'}.
            </p>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 6px;">We wish you a wonderful and safe journey! 🌟</p>
          <p style="margin: 0;">Smart Travel Planner © 2026. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: '"Smart Travel Planner" <no-reply@smarttravelplanner.in>',
    to: recipient,
    subject: subject,
    html: html
  });

  await logEmailToDB(booking.id, recipient, subject, html, 'Trip_Approved');
  return { success: true, recipient, subject };
}

/**
 * Send Custom Notification Email to Customer
 */
async function sendCustomNotificationEmail(recipientEmail, customerName, subject, message, bookingId = null) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #0a2540; padding: 24px; text-align: center; color: white; }
        .content { padding: 28px 24px; }
        .message-box { background: #f1f5f9; border-left: 4px solid #e05638; padding: 18px; border-radius: 8px; margin: 20px 0; font-size: 14.5px; line-height: 1.6; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">🧭 Smart Travel Planner Notification</h2>
        </div>
        <div class="content">
          <p>Hello <strong>${customerName || 'Valued Customer'}</strong>,</p>
          <div class="message-box">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="font-size: 13px; color: #64748b;">If you have any questions, please reply directly to this notification or check your dashboard.</p>
        </div>
        <div class="footer">
          <p style="margin: 0;">Smart Travel Planner © 2026. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: '"Smart Travel Planner Admin" <admin@smarttravelplanner.in>',
    to: recipientEmail,
    subject: subject,
    html: html
  });

  await logEmailToDB(bookingId, recipientEmail, subject, html, 'Custom_Notification');
  return { success: true, recipient: recipientEmail, subject };
}

module.exports = {
  sendTripPlannedEmail,
  sendTripApprovedEmail,
  sendCustomNotificationEmail
};
