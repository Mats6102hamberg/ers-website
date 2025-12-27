import { ContentScanner, ScanResult } from './ContentScanner';
import { SecurityProfile, ProfileType, getProfile } from './SecurityProfile';
import { SecurityAuditor, AuditEntry } from './SecurityAuditor';
import { emailAlertService } from './EmailAlertService';

export interface ERSConfig {
  profileType: ProfileType;
  ollamaUrl?: string;
  blockThreshold?: number;
  enableDeepScan?: boolean;
}

export interface ERSResult {
  allowed: boolean;
  sanitizedContent: string;
  scanResult: ScanResult;
  auditId?: string;
}

export class EnterpriseResearchShield {
  private scanner: ContentScanner;
  private auditor: SecurityAuditor;
  private config: ERSConfig;
  private profile: SecurityProfile;

  constructor(config: ERSConfig) {
    this.config = {
      blockThreshold: 200,
      enableDeepScan: false,
      ...config
    };
    this.profile = getProfile(config.profileType);
    this.scanner = new ContentScanner(this.profile);
    this.auditor = new SecurityAuditor();
  }

  async processContent(
    content: string,
    context: {
      contentType: string;
      campaignId?: string;
      recipientEmail?: string;
    }
  ): Promise<ERSResult> {
    let scanResult: ScanResult;

    if (this.config.enableDeepScan && this.config.ollamaUrl) {
      scanResult = await this.scanner.deepScan(content, this.config.ollamaUrl);
    } else {
      scanResult = this.scanner.scan(content, context.contentType);
    }

    const blocked = scanResult.riskScore >= (this.config.blockThreshold || 200);

    const auditEntry: AuditEntry = {
      profileType: this.config.profileType,
      contentType: context.contentType,
      scanResult,
      campaignId: context.campaignId,
      recipientEmail: context.recipientEmail,
      blocked,
      ollamaUsed: this.config.enableDeepScan && !!this.config.ollamaUrl
    };

    await this.auditor.log(auditEntry);

    // Send admin alert if CRITICAL risk detected
    if (blocked) {
      await emailAlertService.sendAdminAlert({
        profileType: this.config.profileType,
        contentType: context.contentType,
        scanResult,
        campaignId: context.campaignId,
        recipientEmail: context.recipientEmail,
        timestamp: new Date()
      });
    }

    return {
      allowed: !blocked,
      sanitizedContent: scanResult.sanitizedContent,
      scanResult,
      auditId: undefined
    };
  }

  async processEmail(email: {
    subject: string;
    html: string;
    text: string;
    to: string;
    campaignId?: string;
  }): Promise<{
    allowed: boolean;
    sanitizedEmail: typeof email;
    findings: ScanResult[];
  }> {
    const subjectScan = await this.processContent(email.subject, {
      contentType: 'email_subject',
      campaignId: email.campaignId,
      recipientEmail: email.to
    });

    const htmlScan = await this.processContent(email.html, {
      contentType: 'email_html',
      campaignId: email.campaignId,
      recipientEmail: email.to
    });

    const textScan = await this.processContent(email.text, {
      contentType: 'email_text',
      campaignId: email.campaignId,
      recipientEmail: email.to
    });

    const allowed = subjectScan.allowed && htmlScan.allowed && textScan.allowed;

    return {
      allowed,
      sanitizedEmail: {
        ...email,
        subject: subjectScan.sanitizedContent,
        html: htmlScan.sanitizedContent,
        text: textScan.sanitizedContent
      },
      findings: [
        subjectScan.scanResult,
        htmlScan.scanResult,
        textScan.scanResult
      ]
    };
  }

  getProfile(): SecurityProfile {
    return this.profile;
  }

  async getStats(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day') {
    return this.auditor.getStats(timeRange);
  }

  async getRecentAlerts(limit: number = 20) {
    return this.auditor.getRecentAlerts(limit);
  }
}

export function createERS(config: ERSConfig): EnterpriseResearchShield {
  return new EnterpriseResearchShield(config);
}
