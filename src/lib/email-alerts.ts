// lib/email-alerts.ts

interface CriticalAlertData {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  timestamp: Date;
  details?: string;
  recipientEmail?: string;
  contentPreview?: string;
}

export async function sendCriticalAlert(data: CriticalAlertData): Promise<boolean> {
  const smtpEnabled = process.env.SMTP_ENABLED === 'true';
  const adminEmail = process.env.ADMIN_ALERT_EMAIL;
  const fromEmail = process.env.ALERT_FROM_EMAIL || 'alerts@ers.com';

  if (!smtpEnabled || !adminEmail) {
    console.log('📧 Email alerts disabled or not configured');
    return false;
  }

  try {
    // Om Resend API används
    if (process.env.RESEND_API_KEY) {
      return await sendViaResend(data, adminEmail, fromEmail);
    }

    // Fallback: Logga till console (kan ersättas med annan SMTP-tjänst)
    console.log('📧 Would send email alert:', {
      to: adminEmail,
      from: fromEmail,
      subject: `🚨 ERS CRITICAL ALERT: ${data.type}`,
      data
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to send critical alert:', error);
    return false;
  }
}

async function sendViaResend(
  data: CriticalAlertData,
  adminEmail: string,
  fromEmail: string
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const emailHtml = generateAlertEmailHTML(data);
  const emailText = generateAlertEmailText(data);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [adminEmail],
      subject: `🚨 ERS ${data.severity} ALERT: ${data.type}`,
      html: emailHtml,
      text: emailText,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  const result = await response.json();
  console.log('✅ Critical alert email sent:', result.id);
  return true;
}

function generateAlertEmailHTML(data: CriticalAlertData): string {
  const severityColor = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    CRITICAL: '#ef4444'
  }[data.severity];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🛡️ Enterprise Research Shield</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Säkerhetsvarning</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <div style="background: ${severityColor}; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <h2 style="margin: 0; font-size: 24px;">${data.severity} SEVERITY</h2>
      <p style="margin: 5px 0 0 0; font-size: 16px;">${data.type}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Tidpunkt:</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.timestamp.toLocaleString('sv-SE')}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Källa:</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.source}</td>
      </tr>
      ${data.recipientEmail ? `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Mottagare:</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.recipientEmail}</td>
      </tr>
      ` : ''}
      ${data.details ? `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Detaljer:</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.details}</td>
      </tr>
      ` : ''}
    </table>

    ${data.contentPreview ? `
    <div style="background: #f9fafb; border-left: 4px solid ${severityColor}; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Innehållsförhandsvisning:</h3>
      <p style="margin: 0; font-family: monospace; font-size: 13px; white-space: pre-wrap;">${data.contentPreview.substring(0, 200)}${data.contentPreview.length > 200 ? '...' : ''}</p>
    </div>
    ` : ''}

    <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        ⚠️ <strong>Åtgärd krävs:</strong> Detta innehåll har blockerats automatiskt. Granska incidenten i dashboarden.
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000'}/security-dashboard"
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Visa Dashboard
      </a>
    </div>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">Enterprise Research Shield - AI-Driven Security</p>
    <p style="margin: 5px 0 0 0;">Powered by Qwen 2.5 • GDPR Compliant • Norge-optimerad</p>
  </div>
</body>
</html>
  `.trim();
}

function generateAlertEmailText(data: CriticalAlertData): string {
  return `
🛡️ ENTERPRISE RESEARCH SHIELD - SÄKERHETSVARNING

SEVERITY: ${data.severity}
TYP: ${data.type}
TIDPUNKT: ${data.timestamp.toLocaleString('sv-SE')}
KÄLLA: ${data.source}

${data.recipientEmail ? `MOTTAGARE: ${data.recipientEmail}\n` : ''}
${data.details ? `DETALJER: ${data.details}\n` : ''}
${data.contentPreview ? `\nINNEHÅLL:\n${data.contentPreview.substring(0, 200)}${data.contentPreview.length > 200 ? '...' : ''}\n` : ''}

⚠️ ÅTGÄRD KRÄVS: Detta innehåll har blockerats automatiskt.

Visa dashboard: ${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000'}/security-dashboard

---
Enterprise Research Shield
AI-Driven Security • GDPR Compliant • Norge-optimerad
  `.trim();
}
