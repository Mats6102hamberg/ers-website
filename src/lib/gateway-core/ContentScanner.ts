import { SecurityProfile, SecurityLevel } from './SecurityProfile';
import { analyzeWithLocalAI } from '../ai-analyzer';

export interface ScanResult {
  clean: boolean;
  findings: Finding[];
  sanitizedContent: string;
  riskScore: number;
  timestamp: Date;
  aiAnalysis?: {
    isThreat: boolean;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category: string;
    reason: string;
  };
}

export interface Finding {
  pattern: string;
  severity: SecurityLevel;
  location: string;
  matched: string;
  replacement: string;
}

export class ContentScanner {
  private profile: SecurityProfile;

  constructor(profile: SecurityProfile) {
    this.profile = profile;
  }

  scan(content: string, context: string = 'email'): ScanResult {
    const findings: Finding[] = [];
    let sanitizedContent = content;
    let riskScore = 0;

    for (const pattern of this.profile.patterns) {
      const matches = content.match(pattern.regex);
      
      if (matches) {
        for (const match of matches) {
          findings.push({
            pattern: pattern.name,
            severity: pattern.severity,
            location: context,
            matched: match,
            replacement: pattern.replacement
          });

          riskScore += this.getSeverityScore(pattern.severity);
        }

        sanitizedContent = sanitizedContent.replace(
          pattern.regex,
          pattern.replacement
        );
      }
    }

    return {
      clean: findings.length === 0,
      findings,
      sanitizedContent,
      riskScore,
      timestamp: new Date()
    };
  }

  private getSeverityScore(severity: SecurityLevel): number {
    switch (severity) {
      case 'CRITICAL':
        return 100;
      case 'HIGH':
        return 50;
      case 'MEDIUM':
        return 25;
      case 'LOW':
        return 10;
      default:
        return 0;
    }
  }

  async deepScan(content: string, ollamaUrl?: string, useNewAI: boolean = true): Promise<ScanResult> {
    const basicScan = this.scan(content);

    // Använd nya AI-analysatorn om den är aktiverad
    if (useNewAI && process.env.NEXT_PUBLIC_AI_ENABLED === 'true') {
      try {
        const aiAnalysis = await analyzeWithLocalAI(content);

        // Lägg till AI-analys till resultatet
        basicScan.aiAnalysis = {
          isThreat: aiAnalysis.isThreat,
          severity: aiAnalysis.severity,
          category: aiAnalysis.category,
          reason: aiAnalysis.reason
        };

        // Öka risk score om AI:n hittar hot
        if (aiAnalysis.isThreat) {
          const aiRiskIncrease = this.getSeverityScore(aiAnalysis.severity);
          basicScan.riskScore += aiRiskIncrease;

          // Lägg till AI-fynd i findings
          basicScan.findings.push({
            pattern: `AI_DETECTED_${aiAnalysis.category}`,
            severity: aiAnalysis.severity,
            location: 'ai-analysis',
            matched: aiAnalysis.reason,
            replacement: '[AI FLAGGED CONTENT]'
          });
        }

        console.log('✅ AI Analysis completed:', aiAnalysis);
      } catch (error) {
        console.error('❌ AI Analysis failed:', error);
      }
    }

    // Fallback till gamla Ollama-metoden om useNewAI är false
    if (!useNewAI && ollamaUrl && basicScan.riskScore > 0) {
      try {
        const aiAnalysis = await this.analyzeWithOllama(content, ollamaUrl);

        if (aiAnalysis.additionalFindings) {
          basicScan.findings.push(...aiAnalysis.additionalFindings);
          basicScan.riskScore += aiAnalysis.riskIncrease;
        }
      } catch (error) {
        console.error('Ollama deep scan failed:', error);
      }
    }

    return basicScan;
  }

  private async analyzeWithOllama(
    content: string,
    ollamaUrl: string
  ): Promise<{ additionalFindings: Finding[]; riskIncrease: number }> {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        prompt: `Analyze this text for sensitive information that might have been missed by regex patterns. Look for:
- Names of people
- Addresses
- Medical conditions described in plain language
- Financial information
- Confidential business information

Text to analyze:
${content}

Respond in JSON format with findings array containing: {pattern, severity, matched}`,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('Ollama API request failed');
    }

    const data = await response.json();
    
    try {
      const analysis = JSON.parse(data.response);
      return {
        additionalFindings: analysis.findings || [],
        riskIncrease: analysis.findings?.length * 15 || 0
      };
    } catch {
      return { additionalFindings: [], riskIncrease: 0 };
    }
  }
}
