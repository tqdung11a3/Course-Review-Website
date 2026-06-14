const nodemailer = require("nodemailer");
const env = require("../config/env");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

async function sendOtpEmail(toEmail, otpCode) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 28px;">
        <div style="display: inline-block; width: 52px; height: 52px; background: #2563eb; border-radius: 14px; color: #fff; font-size: 22px; font-weight: 700; line-height: 52px; text-align: center;">R</div>
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 12px 0 4px;">ReviewMon</h1>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">Xác thực tài khoản của bạn</p>
      </div>
      <div style="background: #f8fafc; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 24px;">
        <p style="font-size: 14px; color: #374151; margin: 0 0 16px;">Mã xác thực của bạn là:</p>
        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2563eb; font-family: 'Courier New', monospace; margin: 0 0 16px;">${otpCode}</div>
        <p style="font-size: 13px; color: #6b7280; margin: 0;">Mã có hiệu lực trong <strong>5 phút</strong></p>
      </div>
      <p style="font-size: 13px; color: #9ca3af; text-align: center; margin: 0;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
    </div>
  `;

  console.log(`[mailer] Đang gửi OTP tới: ${toEmail} từ: ${env.SMTP_USER}`);
  const info = await transporter.sendMail({
    from: `"ReviewMon" <${env.SMTP_FROM}>`,
    to: toEmail,
    subject: `[ReviewMon] Mã xác thực: ${otpCode}`,
    html,
  });
  console.log(`[mailer] Gửi thành công! MessageID: ${info.messageId}`);
  return info;
}

async function verifyConnection() {
  console.log(`[mailer] Kiểm tra kết nối SMTP với user: ${env.SMTP_USER}`);
  await transporter.verify();
  console.log("[mailer] Kết nối SMTP OK!");
}

module.exports = { sendOtpEmail, verifyConnection };
