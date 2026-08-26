import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

export interface OrderEmailData {
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    address: string;
    apartment?: string;
    city: string;
    stateProvince: string;
    zipCode: string;
    country: string;
  };
  shippingOption: string;
  totalAmount: number;
  cryptoAmount: string;
  cryptoSymbol: string;
  cryptoNetwork: string;
  txHash: string;
  causeId: string;
  causeTitle: string;
  items: OrderItem[];
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST', 'smtp.hostinger.com');
    const port = Number(this.config.get<number>('SMTP_PORT', 465));
    const isSecure = this.config.get<string>('SMTP_SECURE') === 'true' || port === 465;
    const user = this.config.get<string>('SMTP_USER', 'Info@aderafoundation.com');
    const pass = this.config.get<string>('SMTP_PASS', 'Panda232323@');

    this.logger.log(`Configuring Hostinger SMTP: host=${host}, port=${port}, secure=${isSecure}, user=${user}`);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: user ? { user, pass } : undefined,
      tls: {
        rejectUnauthorized: false,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  private getFromAddress(): string {
    return this.config.get<string>(
      'FROM_EMAIL',
      'Adera Foundation <Info@aderafoundation.com>',
    );
  }

  private getStoreFromAddress(): string {
    return this.config.get<string>(
      'STORE_FROM_EMAIL',
      'Adera Store <Info@aderafoundation.com>',
    );
  }

  private getAdminNotificationEmail(): string {
    return this.config.get<string>(
      'ADMIN_NOTIFICATION_EMAIL',
      'Info@aderafoundation.com',
    );
  }

  private getAppUrl(): string {
    return this.config.get<string>('APP_URL', 'http://localhost:3005');
  }

  private getStoreUrl(): string {
    return this.config.get<string>('STORE_URL', 'http://localhost:3003');
  }

  private getLogoAttachments(): any[] {
    const candidatePaths = [
      path.join(__dirname, '../assets/logo.png'),
      path.join(__dirname, 'assets/logo.png'),
      path.resolve(process.cwd(), 'src/assets/logo.png'),
      path.resolve(process.cwd(), 'dist/assets/logo.png'),
      path.resolve(process.cwd(), '../frontend/public/logo.png'),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return [
          {
            filename: 'logo.png',
            path: p,
            cid: 'adera_logo',
          },
        ];
      }
    }
    return [];
  }

  private wrapEmailTemplate(contentHtml: string, previewText: string = ''): string {
    const appUrl = this.getAppUrl();
    const currentYear = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Adera Foundation</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header Banner with Logo -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%); text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <img src="cid:adera_logo" width="48" height="48" alt="Adera Foundation Logo" style="width: 48px; height: 48px; display: block; border-radius: 12px; background: #ffffff; padding: 2px;" />
                        </td>
                        <td style="vertical-align: middle; text-align: left;">
                          <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; line-height: 1;">
                            Adera <span style="color: #6ee7b7; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; display: inline-block; vertical-align: middle; margin-left: 4px; padding: 2px 8px; background: rgba(255,255,255,0.18); border-radius: 6px;">Foundation</span>
                          </div>
                          <div style="font-size: 12px; color: #a7f3d0; font-weight: 500; margin-top: 4px; letter-spacing: 0.2px;">
                            Blockchain-Powered Philanthropy
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 38px 40px 32px 40px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 26px 40px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #475569;">
                &copy; ${currentYear} Adera Foundation &bull; Global On-Chain Humanitarian Network
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #94a3b8;">
                Addis Ababa, Ethiopia & Global Regional Hubs &bull; Info@aderafoundation.com
              </p>
              <div style="font-size: 12px;">
                <a href="${appUrl}" style="color: #059669; text-decoration: none; font-weight: 700; margin: 0 8px;">Main Portal</a> &bull;
                <a href="${appUrl}/causes" style="color: #059669; text-decoration: none; font-weight: 700; margin: 0 8px;">Explore Causes</a> &bull;
                <a href="${appUrl}/contact" style="color: #059669; text-decoration: none; font-weight: 700; margin: 0 8px;">Support Center</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  async testSmtpConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      this.logger.log('Verifying SMTP connection to Hostinger...');
      await this.transporter.verify();
      this.logger.log('Hostinger SMTP connection is healthy and verified!');
      return { success: true, message: 'Hostinger SMTP connection verified successfully.' };
    } catch (error: any) {
      this.logger.error(`SMTP verification error: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Failed to connect to SMTP: ${error.message}`,
        details: error,
      };
    }
  }

  async sendVerificationEmail(to: string, name: string, code: string) {
    const appUrl = this.getAppUrl();
    const verifyUrl = `${appUrl}/auth/verify/${code}`;
    const displayName = name ? name.split(' ')[0] : 'there';
    const formattedCode = code.split('').join(' ');

    const contentHtml = `
      <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
        Welcome to Adera Foundation, ${displayName}! 👋
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #475569; line-height: 1.6;">
        Thank you for joining our community of changemakers. Use the 6-digit code below to verify your email address on the registration screen:
      </p>

      <!-- 6-DIGIT CODE BOX -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0 26px 0;">
        <tr>
          <td align="center">
            <div style="display: inline-block; padding: 18px 36px; background-color: #f0fdf4; border: 2px dashed #059669; border-radius: 16px; text-align: center;">
              <span style="font-family: 'Courier New', Courier, monospace, sans-serif; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #065f46; display: block;">
                ${formattedCode}
              </span>
              <span style="font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 6px; display: block;">
                6-Digit Verification Code (Expires in 24h)
              </span>
            </div>
          </td>
        </tr>
      </table>

      <!-- 1-CLICK VERIFICATION BUTTON -->
      <div style="text-align: center; margin: 20px 0 28px 0;">
        <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
          &mdash; OR VERIFY WITH 1 CLICK &mdash;
        </p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 14px 34px; background-color: #059669; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3); text-align: center;">
          Verify Email Address &rarr;
        </a>
      </div>

      <!-- SPAM FOLDER HELPER NOTICE -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
        <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
          📁 Did this message land in your Spam or Junk folder?
        </div>
        <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.6;">
          To ensure you receive future donation receipts and cause milestones, please mark this message as <strong>"Not Spam"</strong> (or move to Primary) and add <strong>Info@aderafoundation.com</strong> to your safe senders list.
        </p>
      </div>

      <p style="margin: 18px 0 0 0; font-size: 12px; color: #94a3b8; word-break: break-all;">
        If you didn't request this verification, you can safely disregard this email.
      </p>
    `;

    const html = this.wrapEmailTemplate(contentHtml, `Your Adera Foundation verification code is ${code}`);

    return this.transporter.sendMail({
      from: this.getFromAddress(),
      to,
      subject: `${code} is your Adera Foundation verification code`,
      html,
      attachments: this.getLogoAttachments(),
    });
  }

  async sendOrderReceiptEmail(order: OrderEmailData) {
    const storeUrl = this.getStoreUrl();
    const trackUrl = `${storeUrl}/track?id=${encodeURIComponent(order.trackingNumber || order.orderNumber)}`;
    const displayName = order.customerName ? order.customerName.split(' ')[0] : 'Customer';
    const shippingFee = order.shippingOption === 'express' ? 12.00 : 0.00;
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const itemsHtml = order.items.map((item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #1e293b;">
          <strong>x${item.quantity}</strong> &nbsp; ${item.name}
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.category || 'Impact Goods'}</div>
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 700; font-family: monospace; color: #0f172a;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const formattedAddress = [
      order.shippingAddress.address,
      order.shippingAddress.apartment,
      `${order.shippingAddress.city}, ${order.shippingAddress.stateProvince} ${order.shippingAddress.zipCode}`,
      order.shippingAddress.country,
    ].filter(Boolean).join('<br>');

    const contentHtml = `
      <!-- Order Header Status -->
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; padding: 4px 14px; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 700; border-radius: 9999px; border: 1px solid #a7f3d0; text-transform: uppercase; letter-spacing: 1px;">
          ✓ Payment & Impact Escrowed
        </span>
        <h2 style="margin: 12px 0 6px 0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
          Order Confirmed, ${displayName}!
        </h2>
        <p style="margin: 0; font-size: 14px; color: #64748b;">
          Thank you for purchasing with purpose. Order <strong>#${order.orderNumber}</strong> has been registered.
        </p>
      </div>

      <!-- COURIER TRACKING NUMBER CARD -->
      <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 18px; padding: 22px; margin-bottom: 26px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
          <span style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px;">
            📦 Package Tracking Information
          </span>
          <span style="font-size: 11px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 2px 8px; border-radius: 6px;">
            ${order.carrier}
          </span>
        </div>

        <div style="margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
            Courier Tracking Number:
          </div>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: 1px;">
            ${order.trackingNumber}
          </div>
        </div>

        <div style="font-size: 12px; color: #64748b; margin-bottom: 18px;">
          <strong>Estimated Delivery:</strong> ${order.estimatedDelivery} (${order.shippingOption === 'express' ? 'Priority Express' : 'Standard Insured'})
        </div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center">
              <a href="${trackUrl}" style="display: block; width: 100%; box-sizing: border-box; text-align: center; padding: 12px 24px; background-color: #059669; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">
                Track Shipment Live &rarr;
              </a>
            </td>
          </tr>
        </table>
      </div>

      <!-- ON-CHAIN IMPACT & RECEIPT PROOF -->
      <div style="background-color: #0f172a; color: #ffffff; border-radius: 18px; padding: 20px 22px; margin-bottom: 26px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 12px;">
          <span style="font-size: 12px; font-weight: 800; color: #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            ⛓ Immutable On-Chain Receipt
          </span>
          <span style="font-size: 10px; font-weight: 700; color: #6ee7b7; background: rgba(110,231,183,0.15); padding: 2px 8px; border-radius: 4px; font-family: monospace;">
            100% Escrowed
          </span>
        </div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 12px; font-family: monospace;">
          <tr>
            <td style="color: #94a3b8; padding: 4px 0;">Settled Asset:</td>
            <td align="right" style="color: #6ee7b7; font-weight: 700; padding: 4px 0;">${order.cryptoAmount} ${order.cryptoSymbol} (${order.cryptoNetwork})</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 0;">Designated Cause:</td>
            <td align="right" style="color: #ffffff; font-weight: 700; padding: 4px 0;">${order.causeTitle}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 0;">Tx Hash:</td>
            <td align="right" style="color: #cbd5e1; padding: 4px 0; word-break: break-all;">${order.txHash ? order.txHash.slice(0, 18) + '...' : '0xConfirmedOnChain'}</td>
          </tr>
        </table>
        
        <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #1e293b; padding-top: 8px; margin-top: 8px;">
          💡 100% of profit proceeds from this purchase are locked into milestone-gated humanitarian escrow.
        </div>
      </div>

      <!-- PURCHASED ITEMS SUMMARY -->
      <div style="margin-bottom: 26px;">
        <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
          Order Summary (${order.items.length} item${order.items.length > 1 ? 's' : ''})
        </h4>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          ${itemsHtml}
          <tr>
            <td style="padding: 10px 0 4px 0; font-size: 12px; color: #64748b;">Subtotal</td>
            <td align="right" style="padding: 10px 0 4px 0; font-size: 12px; font-weight: 600; font-family: monospace; color: #334155;">$${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 12px; color: #64748b;">Shipping (${order.shippingOption === 'express' ? 'Priority Express' : 'Standard Insured'})</td>
            <td align="right" style="padding: 4px 0; font-size: 12px; font-weight: 600; font-family: monospace; color: #334155;">${shippingFee === 0 ? 'FREE' : '$' + shippingFee.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 14px; font-weight: 800; color: #0f172a; border-top: 2px solid #e2e8f0;">Total Paid (USD)</td>
            <td align="right" style="padding: 10px 0; font-size: 16px; font-weight: 900; font-family: monospace; color: #059669; border-top: 2px solid #e2e8f0;">$${order.totalAmount.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- SHIPPING ADDRESS -->
      <div style="background-color: #f8fafc; border-radius: 14px; padding: 16px 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
        <h5 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
          Delivery Destination:
        </h5>
        <div style="font-size: 13px; color: #475569; line-height: 1.5;">
          <strong>${order.customerName}</strong><br>
          ${formattedAddress}
        </div>
      </div>

      <!-- SPAM FOLDER HELPER NOTICE -->
      <div style="background-color: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-bottom: 16px;">
        <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
          <strong>Delivery Updates:</strong> To ensure you receive tracking milestone alerts and courier dispatch notices, please add <strong>Info@aderafoundation.com</strong> to your contacts or mark this email as "Not Spam".
        </p>
      </div>
    `;

    const html = this.wrapEmailTemplate(contentHtml, `Order Confirmation #${order.orderNumber} - Tracking: ${order.trackingNumber}`);

    // Send customer confirmation
    await this.transporter.sendMail({
      from: this.getStoreFromAddress(),
      to: order.customerEmail,
      subject: `✅ Order #${order.orderNumber} Confirmed (Tracking: ${order.trackingNumber}) - Adera Store`,
      html,
      attachments: this.getLogoAttachments(),
    });

    // Send admin notification
    const adminEmail = this.getAdminNotificationEmail();
    if (adminEmail && adminEmail !== order.customerEmail) {
      this.transporter.sendMail({
        from: this.getStoreFromAddress(),
        to: adminEmail,
        subject: `🛒 New Store Order #${order.orderNumber} ($${order.totalAmount.toFixed(2)}) - ${order.customerName}`,
        html,
        attachments: this.getLogoAttachments(),
      }).catch((err) => this.logger.warn(`Failed to dispatch admin order copy: ${err.message}`));
    }
  }

  async sendNewsletterWelcomeEmail(to: string) {
    const appUrl = this.getAppUrl();

    const contentHtml = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 16px; background-color: #ecfdf5; color: #059669; font-size: 28px; text-align: center; border: 1px solid #a7f3d0; margin-bottom: 12px;">
          ✨
        </div>
        <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
          You're Officially Connected!
        </h2>
        <p style="margin: 0; font-size: 15px; color: #64748b;">
          Welcome to the Adera Foundation global impact community.
        </p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 20px 0; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #0f172a;">
          What to expect in your inbox:
        </h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
          <li><strong>Direct Impact Reports:</strong> Milestone updates and verifiable on-chain disbursement proofs.</li>
          <li><strong>Featured Causes:</strong> Urgent campaigns for clean water, education, and disaster relief.</li>
          <li><strong>Philanthropy Innovations:</strong> Educational insights into multi-sig smart contracts & DAO giving.</li>
        </ul>
      </div>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
        <tr>
          <td align="center">
            <a href="${appUrl}/causes" style="display: inline-block; padding: 14px 32px; background-color: #059669; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);">
              Explore Active Campaigns &rarr;
            </a>
          </td>
        </tr>
      </table>

      <!-- Spam Helper -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-top: 24px;">
        <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
          <strong>Tip:</strong> Add <strong>Info@aderafoundation.com</strong> to your contacts or drag this email to your Primary tab so you never miss cause milestone proofs.
        </p>
      </div>
    `;

    const html = this.wrapEmailTemplate(contentHtml, 'Welcome to Adera Foundation Impact Updates');

    return this.transporter.sendMail({
      from: this.getFromAddress(),
      to,
      subject: 'Welcome to Adera Foundation Updates',
      html,
      attachments: this.getLogoAttachments(),
    });
  }

  async sendContactInquiryNotification(inquiry: {
    name: string;
    email: string;
    topic: string;
    message: string;
  }) {
    const adminEmail = this.getAdminNotificationEmail();

    const contentHtml = `
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 10px; background-color: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 700; border-radius: 6px; border: 1px solid #bfdbfe; text-transform: uppercase; letter-spacing: 0.5px;">
          Topic: ${inquiry.topic}
        </span>
        <h2 style="margin: 12px 0 6px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
          New Contact Inquiry Received
        </h2>
        <p style="margin: 0; font-size: 14px; color: #64748b;">
          A user has submitted a message via the website contact form.
        </p>
      </div>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px; padding: 20px;">
        <tr>
          <td>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;"><strong>Sender Name:</strong> ${inquiry.name}</div>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;"><strong>Sender Email:</strong> <a href="mailto:${inquiry.email}" style="color: #059669;">${inquiry.email}</a></div>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;"><strong>Date/Time:</strong> ${new Date().toLocaleString()}</div>
          </td>
        </tr>
      </table>

      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #0f172a;">Message Content:</h4>
        <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; font-size: 14px; color: #334155; white-space: pre-wrap; line-height: 1.6;">
${inquiry.message}
        </div>
      </div>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td>
            <a href="mailto:${inquiry.email}?subject=Re: [Adera Inquiry - ${inquiry.topic}]" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px;">
              Reply Directly to ${inquiry.name} &rarr;
            </a>
          </td>
        </tr>
      </table>
    `;

    const html = this.wrapEmailTemplate(contentHtml, `New inquiry from ${inquiry.name}: ${inquiry.topic}`);

    return this.transporter.sendMail({
      from: this.getFromAddress(),
      to: adminEmail,
      replyTo: inquiry.email,
      subject: `[Contact Form] ${inquiry.topic} - from ${inquiry.name}`,
      html,
      attachments: this.getLogoAttachments(),
    });
  }

  async sendContactAutoReply(to: string, name: string, topic: string) {
    const displayName = name ? name.split(' ')[0] : 'there';

    const contentHtml = `
      <h2 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 800; color: #0f172a;">
        We Received Your Message, ${displayName}!
      </h2>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #475569; line-height: 1.6;">
        Thank you for getting in touch with Adera Foundation regarding <strong>${topic}</strong>.
      </p>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
        Our philanthropy operations and partner relations team is reviewing your inquiry. An authorized representative will respond to this email address promptly (typically within 4 to 12 business hours).
      </p>

      <div style="background-color: #ecfdf5; border-radius: 12px; border: 1px solid #a7f3d0; padding: 18px; margin: 24px 0;">
        <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #065f46;">
          Did you know?
        </h4>
        <p style="margin: 0; font-size: 13px; color: #047857; line-height: 1.5;">
          All grants, milestone approvals, and treasury operations across Adera Foundation are tracked on transparent multi-signature vaults.
        </p>
      </div>

      <!-- Spam Helper -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-top: 20px;">
        <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
          <strong>Tip:</strong> If this confirmation landed in your Spam/Junk folder, please click <strong>"Not Spam"</strong> to ensure you receive our team's response.
        </p>
      </div>

      <p style="margin: 20px 0 0 0; font-size: 14px; color: #64748b;">
        Warm regards,<br>
        <strong>Adera Foundation Operations Team</strong>
      </p>
    `;

    const html = this.wrapEmailTemplate(contentHtml, 'We have received your message - Adera Foundation');

    return this.transporter.sendMail({
      from: this.getFromAddress(),
      to,
      subject: 'Message Received - Adera Foundation Support',
      html,
      attachments: this.getLogoAttachments(),
    });
  }
}
