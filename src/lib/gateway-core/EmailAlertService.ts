import { ScanResult } from './ContentScanner';
import { ProfileType } from './SecurityProfile';

export interface AlertData {
  profileType: ProfileType;
  contentType: string;
  scanResult: ScanResult;
  campaignId?: string;
  recipientEmail?: string;
  timestamp: Date;
}

export class EmailAlertService {
  private adminEmail: string;
  private smtpEnabled: boolean;

  constructor() {
    this.adminEmail = process.env.ADMIN_ALERT_EMAIL || 'admin@example.com';
    this.smtpEnabled = process.env.SMTP_ENABLED === 'true';
  }

  async sendAdminAlert(auditData: AlertData): Promise<void> {
    if (!this.smtpEnabled) {
      console.log('📧 [ALERT] SMTP disabled - Alert would be sent:', {
        to: this.adminEmail,
        riskScore: auditData.scanResult.riskScore,
        findings: auditData.scanResult.findings.length
      });
      return;
    }

    try {
      const emailContent = this.buildAlertEmail(auditData);
      
      // For Next.js API route, we'll call an internal endpoint
      const response = await fetch('/api/security/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: this.adminEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send alert: ${response.status}`);
      }

      console.log('✅ [ALERT] Email sent to', this.adminEmail);
    } catch (error) {
      console.error('❌ [ALERT] Failed to send email:', error);
    }
  }

  private buildAlertEmail(auditData: AlertData): {
    subject: string;
    html: string;
    text: string;
  } {
    const { scanResult, profileType, contentType, campaignId, recipientEmail, timestamp } = auditData;

    // Identify Norwegian patterns
    const norwegianPatterns = scanResult.findings.filter(f => 
      f.pattern.includes('Norwegian') || 
      f.pattern.includes('Fødselsnummer') ||
      f.pattern.includes('Saksnummer') ||
      f.pattern.includes('NAV')
    );

    const subject = `🚨 CRITICAL Security Alert - Risk Score ${scanResult.riskScore}`;

    const text = `
CRITICAL SECURITY ALERT
========================

En email har blockerats på grund av för hög risk-score.

DETALJER:
---------
Tidpunkt: ${timestamp.toISOString()}
Risk Score: ${scanResult.riskScore} (CRITICAL)
Profil: ${profileType}
Innehållstyp: ${contentType}
Kampanj-ID: ${campaignId || 'N/A'}
Mottagare: ${recipientEmail || 'N/A'}

FYND (${scanResult.findings.length} st):
${scanResult.findings.map(f => `- ${f.pattern} (${f.severity}): ${f.matched}`).join('\n')}

${norwegianPatterns.length > 0 ? `
NORSKA MÖNSTER SOM TRIGGADES (${norwegianPatterns.length} st):
${norwegianPatterns.map(f => `- ${f.pattern}: ${f.matched}`).join('\n')}
` : ''}

ÅTGÄRD:
-------
Emailen har BLOCKERATS och skickades INTE till mottagaren.

Detta är en automatisk varning från Enterprise Research Shield.
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #fff; padding: 30px; border: 2px solid #DC2626; border-top: none; border-radius: 0 0 10px 10px; }
    .alert-box { background: #FEE2E2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .info-grid { display: grid; grid-template-columns: 140px 1fr; gap: 10px; margin: 20px 0; }
    .info-label { font-weight: bold; color: #666; }
    .findings { background: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .finding-item { padding: 10px; margin: 5px 0; background: white; border-left: 3px solid #DC2626; border-radius: 3px; }
    .norwegian-section { background: #DBEAFE; border-left: 4px solid #2563EB; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .norwegian-section h3 { margin-top: 0; color: #1E40AF; }
    .action-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
    .risk-badge { display: inline-block; background: #DC2626; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 18px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚨 CRITICAL SECURITY ALERT</h1>
    <p style="margin: 10px 0 0 0; font-size: 14px;">Enterprise Research Shield</p>
  </div>
  
  <div class="content">
    <div class="alert-box">
      <strong>En email har blockerats på grund av för hög risk-score.</strong>
    </div>

    <div class="info-grid">
      <div class="info-label">Tidpunkt:</div>
      <div>${timestamp.toLocaleString('sv-SE')}</div>
      
      <div class="info-label">Risk Score:</div>
      <div><span class="risk-badge">${scanResult.riskScore}</span> (CRITICAL)</div>
      
      <div class="info-label">Profil:</div>
      <div><strong>${profileType}</strong></div>
      
      <div class="info-label">Innehållstyp:</div>
      <div>${contentType}</div>
      
      <div class="info-label">Kampanj-ID:</div>
      <div>${campaignId || 'N/A'}</div>
      
      <div class="info-label">Mottagare:</div>
      <div>${recipientEmail || 'N/A'}</div>
    </div>

    <div class="findings">
      <h3 style="margin-top: 0;">📋 Fynd (${scanResult.findings.length} st)</h3>
      ${scanResult.findings.map(f => `
        <div class="finding-item">
          <strong>${f.pattern}</strong> (${f.severity})<br>
          <small style="color: #666;">Matchat: ${f.matched}</small>
        </div>
      `).join('')}
    </div>

    ${norwegianPatterns.length > 0 ? `
      <div class="norwegian-section">
        <h3>🇳🇴 Norska mönster som triggades (${norwegianPatterns.length} st)</h3>
        ${norwegianPatterns.map(f => `
          <div style="margin: 10px 0;">
            <strong>${f.pattern}</strong><br>
            <small style="color: #1E40AF;">Matchat: ${f.matched}</small>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <div class="action-box">
      <h3 style="margin-top: 0;">⚠️ Åtgärd vidtagen</h3>
      <p style="margin: 0;">Emailen har <strong>BLOCKERATS</strong> och skickades <strong>INTE</strong> till mottagaren.</p>
    </div>

    <div class="footer">
      <p>Detta är en automatisk varning från Enterprise Research Shield.</p>
      <p>Kontrollera dashboarden för mer information: <a href="${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000'}/security-dashboard">Security Dashboard</a></p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return { subject, html, text };
  }
}

export const emailAlertService = new EmailAlertService();
