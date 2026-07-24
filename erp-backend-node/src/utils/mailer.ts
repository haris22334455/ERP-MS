import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendApprovalEmail = async (toEmail: string, fullname: string, businessname: string, tempPass: string) => {
  const mailOptions = {
    from: `"ERP-MS Admin" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Your ERP-MS Account has been Approved! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          }
          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
            padding: 30px 20px;
            text-align: center;
            color: #ffffff;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .content {
            padding: 40px 30px;
            color: #334155;
            line-height: 1.6;
          }
          .content h2 {
            color: #1e293b;
            margin-top: 0;
          }
          .credentials-box {
            background-color: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .credentials-box p {
            margin: 5px 0;
            font-size: 15px;
          }
          .btn-container {
            text-align: center;
            margin-top: 35px;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);
            transition: transform 0.2s;
          }
          .footer {
            background-color: #f1f5f9;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ERP-MS! 🚀</h1>
          </div>
          <div class="content">
            <h2>Hello ${fullname},</h2>
            <p>Great news! Your registration request for <strong>${businessname}</strong> has been successfully approved by the Admin.</p>
            <p>You can now log in to the ERP Management System and start managing your inventory and ledgers effortlessly.</p>
            
            <div class="credentials-box">
              <p><strong>Your Login Credentials:</strong></p>
              <p><strong>Username/Email:</strong> ${toEmail}</p>
              <p><strong>Password:</strong> (The password you entered during signup)</p>
            </div>
            
            <p>Please keep your credentials secure. If you ever forget your password, you can use the "Forgot Password" feature on the login page.</p>
            
            <div class="btn-container">
              <!-- Using generic login link, user can replace this with actual deployed frontend URL later if needed -->
              <a href="https://erp-frontend.vercel.app/" class="btn">Login to Your Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from the ERP-MS system. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} ERP-MS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Approval email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
