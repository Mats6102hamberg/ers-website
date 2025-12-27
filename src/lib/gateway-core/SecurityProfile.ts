export type SecurityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProfileType = 'MEDICAL' | 'SOCIAL' | 'ENTERPRISE';

export interface SensitivePattern {
  name: string;
  regex: RegExp;
  severity: SecurityLevel;
  replacement: string;
}

export interface SecurityProfile {
  type: ProfileType;
  patterns: SensitivePattern[];
  allowedDomains?: string[];
  requireEncryption: boolean;
  auditLevel: SecurityLevel;
}

export const MedicalProfile: SecurityProfile = {
  type: 'MEDICAL',
  patterns: [
    {
      name: 'Swedish Personal Number',
      regex: /\b(\d{6}[-\s]?\d{4})\b/g,
      severity: 'CRITICAL',
      replacement: '[PERSONNUMMER MASKERAT]'
    },
    {
      name: 'Norwegian Fødselsnummer',
      regex: /\b(\d{6}\s?\d{5})\b/g,
      severity: 'CRITICAL',
      replacement: '[FØDSELSNUMMER MASKERT]'
    },
    {
      name: 'Medical Record Number',
      regex: /\b(MRN|JNR|JOURNALNR)[:\s-]?(\d{6,10})\b/gi,
      severity: 'CRITICAL',
      replacement: '[JOURNALNUMMER MASKERAT]'
    },
    {
      name: 'Diagnosis Code (ICD-10)',
      regex: /\b([A-Z]\d{2}\.?\d{1,2})\b/g,
      severity: 'HIGH',
      replacement: '[DIAGNOSKOD MASKERAD]'
    },
    {
      name: 'Prescription Number',
      regex: /\b(RX|RECEPT)[:\s-]?(\d{8,12})\b/gi,
      severity: 'HIGH',
      replacement: '[RECEPTNUMMER MASKERAT]'
    }
  ],
  requireEncryption: true,
  auditLevel: 'CRITICAL'
};

export const SocialProfile: SecurityProfile = {
  type: 'SOCIAL',
  patterns: [
    {
      name: 'Swedish Personal Number',
      regex: /\b(\d{6}[-\s]?\d{4})\b/g,
      severity: 'CRITICAL',
      replacement: '[PERSONNUMMER MASKERAT]'
    },
    {
      name: 'Norwegian Fødselsnummer',
      regex: /\b(\d{6}\s?\d{5})\b/g,
      severity: 'CRITICAL',
      replacement: '[FØDSELSNUMMER MASKERT]'
    },
    {
      name: 'Norwegian Case Number',
      regex: /\b(SAK|SAKSN?R?)[:\s-]?(\d{4}[-\/]\d{4,6})\b/gi,
      severity: 'HIGH',
      replacement: '[SAKSNUMMER MASKERT]'
    },
    {
      name: 'Swedish Case Number',
      regex: /\b(ÄRENDE|ÄR\.?NR)[:\s-]?(\d{4}[-\/]\d{4,6})\b/gi,
      severity: 'HIGH',
      replacement: '[ÄRENDENUMMER MASKERAT]'
    },
    {
      name: 'Social Security Decision',
      regex: /\b(BESLUT|VEDTAK)[:\s-]?(\d{6,10})\b/gi,
      severity: 'HIGH',
      replacement: '[BESLUTSNUMMER MASKERAT]'
    },
    {
      name: 'Bank Account Number',
      regex: /\b(\d{4}[\s-]?\d{2}[\s-]?\d{5})\b/g,
      severity: 'MEDIUM',
      replacement: '[KONTONUMMER MASKERAT]'
    }
  ],
  requireEncryption: true,
  auditLevel: 'HIGH'
};

export const EnterpriseProfile: SecurityProfile = {
  type: 'ENTERPRISE',
  patterns: [
    {
      name: 'API Key',
      regex: /\b([A-Za-z0-9_-]{32,})\b/g,
      severity: 'CRITICAL',
      replacement: '[API-NYCKEL MASKERAD]'
    },
    {
      name: 'Email Address',
      regex: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
      severity: 'MEDIUM',
      replacement: '[E-POST MASKERAD]'
    },
    {
      name: 'Phone Number',
      regex: /\b(\+?46|0)[\s-]?7[\s-]?\d{1}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/g,
      severity: 'MEDIUM',
      replacement: '[TELEFON MASKERAT]'
    },
    {
      name: 'Swedish Organization Number',
      regex: /\b(\d{6}[-\s]?\d{4})\b/g,
      severity: 'LOW',
      replacement: '[ORGNR MASKERAT]'
    },
    {
      name: 'Credit Card',
      regex: /\b(\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4})\b/g,
      severity: 'CRITICAL',
      replacement: '[KORTNUMMER MASKERAT]'
    }
  ],
  requireEncryption: false,
  auditLevel: 'MEDIUM'
};

export function getProfile(type: ProfileType): SecurityProfile {
  switch (type) {
    case 'MEDICAL':
      return MedicalProfile;
    case 'SOCIAL':
      return SocialProfile;
    case 'ENTERPRISE':
      return EnterpriseProfile;
    default:
      return EnterpriseProfile;
  }
}
