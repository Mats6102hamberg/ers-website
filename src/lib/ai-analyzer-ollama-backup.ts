// lib/ai-analyzer.ts

interface SecurityAnalysis {
  isThreat: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'SQL_INJECTION' | 'PII_LEAK' | 'MALICIOUS_CONTENT' | 'SAFE';
  reason: string;
}

interface CouncilAnalysis extends SecurityAnalysis {
  council: {
    riskAI: SecurityAnalysis & { model: string };
    analysisAI: SecurityAnalysis & { model: string };
    consensus: 'UNANIMOUS_SAFE' | 'UNANIMOUS_THREAT' | 'SPLIT_DECISION';
    finalDecision: 'BLOCK' | 'ALLOW';
    reasoning: string;
  };
}

export async function analyzeWithLocalAI(
  text: string,
  model: string = 'qwen2.5:7b' // Standardmodell, kan bytas till llama3.1
): Promise<SecurityAnalysis> {

  // System-promt som definierar AI:ns roll som säkerhetsexpert
  const systemPrompt = `
    You are the security engine for Enterprise Research Shield (ERS).
    Your task is to analyze text for security risks, specifically:
    1. SQL Injection attempts or code execution patterns.
    2. Norwegian PII leakage (fødselsnummer, sensitiv helseinfo) that might have slipped through regex.
    3. Malicious intent or social engineering.

    Respond ONLY with a JSON object in this format:
    {
      "isThreat": boolean,
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "category": "SQL_INJECTION" | "PII_LEAK" | "MALICIOUS_CONTENT" | "SAFE",
      "reason": "Short explanation"
    }
  `;

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `ANALYZE THIS TEXT:\n"${text}"` }
        ],
        format: 'json', // Tvingar Qwen 2.5 att svara med valid JSON
        stream: false,    // Vi vill ha hela svaret direkt, inte strömmat
        options: {
          temperature: 0.1 // Låg temperatur för konsekventa, logiska svar
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();

    // HARDENED PARSING with explicit structure validation
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response structure: data is not an object');
    }

    if (!data.message || typeof data.message !== 'object') {
      throw new Error('Invalid response structure: missing message object');
    }

    if (!data.message.content || typeof data.message.content !== 'string') {
      throw new Error('Invalid response structure: missing content string');
    }

    // Now safe to parse
    const analysis: SecurityAnalysis = JSON.parse(data.message.content);

    // Validate the parsed analysis has required fields
    if (!analysis.hasOwnProperty('isThreat') ||
        !analysis.hasOwnProperty('severity') ||
        !analysis.hasOwnProperty('category')) {
      throw new Error('Invalid analysis structure: missing required fields');
    }

    return analysis;

  } catch (error) {
    console.error('❌ AI Analysis failed:', error);
    // Enhanced logging for debugging
    if (error instanceof SyntaxError) {
      console.error('JSON Parse Error - Ollama returned invalid JSON');
    } else if (error instanceof TypeError) {
      console.error('Structure Error - Unexpected response format');
    }

    // Fail-safe: Om AI:n är nere, anta att det är säkert men logga felet
    // Alternativt: Blockera allt om du vill vara extremt strikt.
    return {
      isThreat: false,
      severity: 'LOW',
      category: 'SAFE',
      reason: `AI Analysis Unavailable - ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * AI COUNCIL - Analyserar innehåll med två olika AI-modeller parallellt
 *
 * Qwen 2.5:7b (Risk-AI): Snabb, strikt säkerhetsanalys
 * Llama 3.1:8b (Analys-AI): Djupare kontextförståelse
 *
 * Vaktmästar-logik: Om någon flaggar CRITICAL/HIGH → BLOCKERA (Safety First)
 */
export async function analyzeWithCouncil(text: string): Promise<CouncilAnalysis> {
  const riskModel = process.env.OLLAMA_RISK_MODEL || 'qwen2.5:7b';
  const analysisModel = process.env.OLLAMA_ANALYSIS_MODEL || 'llama3.1:8b';

  // System-prompt för Risk-AI (Qwen 2.5) - Strikt säkerhetsfokus
  const riskPrompt = `
    You are the RISK-AI for Enterprise Research Shield (ERS).
    Your role is STRICT SECURITY ANALYSIS with zero tolerance for threats.

    Analyze text for:
    1. SQL Injection attempts or code execution patterns
    2. Norwegian PII leakage (fødselsnummer, sensitiv helseinfo)
    3. Malicious intent or social engineering

    Be CONSERVATIVE - flag suspicious patterns even if uncertain.

    Respond ONLY with JSON:
    {
      "isThreat": boolean,
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "category": "SQL_INJECTION" | "PII_LEAK" | "MALICIOUS_CONTENT" | "SAFE",
      "reason": "Short explanation"
    }
  `;

  // System-prompt för Analys-AI (Llama 3.1) - Djupare kontextförståelse
  const analysisPrompt = `
    You are the ANALYSIS-AI for Enterprise Research Shield (ERS).
    Your role is CONTEXTUAL ANALYSIS with deep understanding.

    Analyze text for:
    1. SQL Injection - distinguish between actual threats vs. educational content
    2. Norwegian PII - consider if data is already masked/sanitized
    3. Malicious intent - understand context and user intent

    Be ANALYTICAL - consider context before flagging.

    Respond ONLY with JSON:
    {
      "isThreat": boolean,
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "category": "SQL_INJECTION" | "PII_LEAK" | "MALICIOUS_CONTENT" | "SAFE",
      "reason": "Short explanation with context"
    }
  `;

  try {
    console.log('🤖 AI Council analyzing with:', riskModel, '+', analysisModel);

    // Kör båda AI-modellerna PARALLELLT
    const [riskResult, analysisResult] = await Promise.all([
      analyzeWithModel(text, riskModel, riskPrompt),
      analyzeWithModel(text, analysisModel, analysisPrompt)
    ]);

    // Implementera VAKTMÄSTAR-LOGIK (Safety First)
    const hasCriticalOrHigh = (analysis: SecurityAnalysis) =>
      analysis.isThreat && ['CRITICAL', 'HIGH'].includes(analysis.severity);

    const riskFlagged = hasCriticalOrHigh(riskResult);
    const analysisFlagged = hasCriticalOrHigh(analysisResult);

    // Bestäm konsensus
    let consensus: CouncilAnalysis['council']['consensus'];
    let finalDecision: 'BLOCK' | 'ALLOW';
    let finalSeverity: SecurityAnalysis['severity'];
    let finalCategory: SecurityAnalysis['category'];
    let reasoning: string;

    if (riskFlagged || analysisFlagged) {
      // NÅGON FLAGGADE CRITICAL/HIGH → BLOCKERA
      finalDecision = 'BLOCK';
      consensus = riskFlagged && analysisFlagged ? 'UNANIMOUS_THREAT' : 'SPLIT_DECISION';

      // Välj högsta severity
      finalSeverity = getSeverityPriority(riskResult.severity) > getSeverityPriority(analysisResult.severity)
        ? riskResult.severity
        : analysisResult.severity;

      // Välj kategori från den som flaggade
      finalCategory = riskFlagged ? riskResult.category : analysisResult.category;

      reasoning = consensus === 'UNANIMOUS_THREAT'
        ? `Both AIs flagged threat: Risk-AI (${riskResult.reason}), Analysis-AI (${analysisResult.reason})`
        : `Safety First: ${riskFlagged ? 'Risk-AI' : 'Analysis-AI'} flagged ${finalSeverity} threat. Other AI: ${riskFlagged ? analysisResult.reason : riskResult.reason}`;
    } else if (!riskResult.isThreat && !analysisResult.isThreat) {
      // BÅDA SÄGER SÄKERT → TILLÅT
      finalDecision = 'ALLOW';
      consensus = 'UNANIMOUS_SAFE';
      finalSeverity = 'LOW';
      finalCategory = 'SAFE';
      reasoning = 'Both AIs confirmed content is safe';
    } else {
      // SPLIT PÅ LOW/MEDIUM → TILLÅT MED VARNING
      finalDecision = 'ALLOW';
      consensus = 'SPLIT_DECISION';
      finalSeverity = 'MEDIUM';
      finalCategory = riskResult.isThreat ? riskResult.category : analysisResult.category;
      reasoning = `Split decision on low-priority threat: Risk-AI (${riskResult.reason}), Analysis-AI (${analysisResult.reason})`;
    }

    console.log(`✅ Council decision: ${finalDecision} (${consensus})`);

    return {
      isThreat: finalDecision === 'BLOCK',
      severity: finalSeverity,
      category: finalCategory,
      reason: reasoning,
      council: {
        riskAI: { ...riskResult, model: riskModel },
        analysisAI: { ...analysisResult, model: analysisModel },
        consensus,
        finalDecision,
        reasoning
      }
    };

  } catch (error) {
    console.error('❌ AI Council failed:', error);

    // Fail-safe: Om Council är nere, försök med endast Risk-AI
    try {
      const fallbackResult = await analyzeWithLocalAI(text, riskModel);
      console.warn('⚠️ Fallback to Risk-AI only');

      return {
        ...fallbackResult,
        council: {
          riskAI: { ...fallbackResult, model: riskModel },
          analysisAI: {
            isThreat: false,
            severity: 'LOW',
            category: 'SAFE',
            reason: 'Analysis-AI unavailable',
            model: analysisModel
          },
          consensus: 'SPLIT_DECISION',
          finalDecision: fallbackResult.isThreat && ['CRITICAL', 'HIGH'].includes(fallbackResult.severity) ? 'BLOCK' : 'ALLOW',
          reasoning: 'Fallback to Risk-AI only (Analysis-AI failed)'
        }
      };
    } catch (fallbackError) {
      // Total fail-safe: Båda AI:er är nere
      console.error('❌ Complete AI Council failure');
      return {
        isThreat: false,
        severity: 'LOW',
        category: 'SAFE',
        reason: 'AI Council Unavailable - Both models failed',
        council: {
          riskAI: {
            isThreat: false,
            severity: 'LOW',
            category: 'SAFE',
            reason: 'Unavailable',
            model: riskModel
          },
          analysisAI: {
            isThreat: false,
            severity: 'LOW',
            category: 'SAFE',
            reason: 'Unavailable',
            model: analysisModel
          },
          consensus: 'UNANIMOUS_SAFE',
          finalDecision: 'ALLOW',
          reasoning: 'AI Council completely unavailable - allowing with caution'
        }
      };
    }
  }
}

/**
 * Helper: Analysera med specifik modell och prompt
 */
async function analyzeWithModel(
  text: string,
  model: string,
  systemPrompt: string
): Promise<SecurityAnalysis> {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `ANALYZE THIS TEXT:\n"${text}"` }
      ],
      format: 'json',
      stream: false,
      options: {
        temperature: 0.1
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error for ${model}: ${response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(data.message.content);
}

/**
 * Helper: Severity prioritering för jämförelse
 */
function getSeverityPriority(severity: SecurityAnalysis['severity']): number {
  switch (severity) {
    case 'CRITICAL': return 4;
    case 'HIGH': return 3;
    case 'MEDIUM': return 2;
    case 'LOW': return 1;
    default: return 0;
  }
}
