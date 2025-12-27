import { NextRequest, NextResponse } from 'next/server';
import { createERS } from '@/lib/gateway-core/EnterpriseResearchShield';
import { ProfileType } from '@/lib/gateway-core/SecurityProfile';
import { analyzeWithCouncil } from '@/lib/ai-analyzer';
import { sendCriticalAlert } from '@/lib/email-alerts';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, profileType, contentType, enableDeepScan, ollamaUrl, recipientEmail } = body;

    if (!content || !profileType) {
      return NextResponse.json(
        { success: false, error: 'Content and profileType are required' },
        { status: 400 }
      );
    }

    // 1. Din existerande Regex-sanering körs först...
    const ers = createERS({
      profileType: profileType as ProfileType,
      enableDeepScan: enableDeepScan || false,
      ollamaUrl: ollamaUrl || process.env.OLLAMA_URL,
      blockThreshold: 200
    });

    const result = await ers.processContent(content, {
      contentType: contentType || 'text',
    });

    const sanitizedContent = result.sanitizedContent;

    // 2. Skicka till AI COUNCIL för analys (OpenAI eller keyword fallback)
    let aiAnalysis = null;
    const aiEnabled = process.env.NEXT_PUBLIC_AI_ENABLED === 'true';
    if (aiEnabled) {
      const aiProvider = process.env.OPENAI_API_KEY ? 'OpenAI (gpt-4o-mini)' : 'Keyword Analysis (fallback)';
      console.log(`🤖 Asking AI Council (${aiProvider}) for analysis...`);
      aiAnalysis = await analyzeWithCouncil(sanitizedContent);

      if (aiAnalysis.isThreat) {
        console.warn(`🚨 AI Council Flagged Threat: ${aiAnalysis.category}`);
        console.log(`   Decision: ${aiAnalysis.council.finalDecision} (${aiAnalysis.council.consensus})`);
        console.log(`   Risk-AI (${aiAnalysis.council.riskAI.model}): ${aiAnalysis.council.riskAI.severity}`);
        console.log(`   Analysis-AI (${aiAnalysis.council.analysisAI.model}): ${aiAnalysis.council.analysisAI.severity}`);

        // Logga till databasen
        try {
          const findingsData = {
            ...result.scanResult.findings,
            aiCouncil: {
              category: aiAnalysis.category,
              severity: aiAnalysis.severity,
              reason: aiAnalysis.reason,
              consensus: aiAnalysis.council.consensus,
              finalDecision: aiAnalysis.council.finalDecision,
              riskAI: {
                model: aiAnalysis.council.riskAI.model,
                severity: aiAnalysis.council.riskAI.severity,
                reason: aiAnalysis.council.riskAI.reason
              },
              analysisAI: {
                model: aiAnalysis.council.analysisAI.model,
                severity: aiAnalysis.council.analysisAI.severity,
                reason: aiAnalysis.council.analysisAI.reason
              }
            }
          };

          await prisma.securityAudit.create({
            data: {
              profileType: profileType,
              contentType: contentType || 'text',
              riskScore: result.scanResult.riskScore + getSeverityScore(aiAnalysis.severity),
              findingsCount: result.scanResult.findings.length + 1,
              findings: findingsData as any,
              sanitized: true,
              blocked: ['HIGH', 'CRITICAL'].includes(aiAnalysis.severity),
              recipientEmail: recipientEmail || null
            }
          });
        } catch (dbError) {
          console.error('Failed to log AI Council finding to database:', dbError);
        }

        // Om det är allvarligt -> Skicka E-post
        if (['HIGH', 'CRITICAL'].includes(aiAnalysis.severity)) {
          await sendCriticalAlert({
            type: `AI Council: ${aiAnalysis.category}`,
            severity: aiAnalysis.severity,
            source: `AI Council (${aiAnalysis.council.consensus})`,
            timestamp: new Date(),
            details: `${aiAnalysis.reason}\n\nRisk-AI: ${aiAnalysis.council.riskAI.reason}\nAnalysis-AI: ${aiAnalysis.council.analysisAI.reason}`,
            recipientEmail: recipientEmail,
            contentPreview: content.substring(0, 200)
          });

          // Blockera requesten
          return NextResponse.json(
            {
              success: false,
              error: 'Blocked by AI Council',
              data: {
                allowed: false,
                blocked: true,
                reason: aiAnalysis.reason,
                severity: aiAnalysis.severity,
                category: aiAnalysis.category,
                council: {
                  consensus: aiAnalysis.council.consensus,
                  finalDecision: aiAnalysis.council.finalDecision,
                  riskAI: `${aiAnalysis.council.riskAI.severity} - ${aiAnalysis.council.riskAI.reason}`,
                  analysisAI: `${aiAnalysis.council.analysisAI.severity} - ${aiAnalysis.council.analysisAI.reason}`
                }
              }
            },
            { status: 403 }
          );
        }
      }
    }

    // 3. Om säkert, fortsätt...
    return NextResponse.json({
      success: true,
      data: {
        allowed: result.allowed,
        sanitized: sanitizedContent,
        riskScore: result.scanResult.riskScore,
        findings: result.scanResult.findings,
        clean: result.scanResult.clean,
        aiAnalysis: aiAnalysis
      }
    });
  } catch (error) {
    console.error('Security scan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to scan content'
      },
      { status: 500 }
    );
  }
}

function getSeverityScore(severity: string): number {
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
