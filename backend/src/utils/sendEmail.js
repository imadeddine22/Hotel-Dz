import nodemailer from 'nodemailer';

/**
 * Send an email via SMTP. If SMTP is not configured, logs to console
 * instead of throwing so flows (e.g. payment webhook) don't break in dev.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_HOST) {
    console.log(`[email skipped — SMTP not configured] To: ${to} | ${subject}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'DzHotels <no-reply@dzhotels.dz>',
    to,
    subject,
    text,
    html,
  });
};

export default sendEmail;
