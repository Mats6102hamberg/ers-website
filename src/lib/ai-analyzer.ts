// lib/ai-analyzer.ts - OpenAI Cloud-First with Local Keyword Fallback

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

/**
 * TIMEOUT WRAPPER - Prevents OpenAI calls from hanging indefinitely
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

/**
 * LOCAL KEYWORD ANALYSIS FALLBACK
 * Runs when OpenAI is unavailable - scans for dangerous patterns
 */
function analyzeWithKeywords(text: string): SecurityAnalysis {
  const lowerText = text.toLowerCase();

  // Norwegian/Swedish sensitive keywords
  const piiPatterns = [
    'personnummer', 'fødselsnummer', 'bankkontonummer',
    'helsejournal', 'medisinsk journal', 'diagnose',
    'konfidentiellt', 'hemligt', 'classified'
  ];

  const sqlPatterns = [
    'select * from', 'drop table', 'union select',
    'exec(', 'execute(', '--', "';", 'or 1=1',
    'script>', '<iframe'
  ];

  const maliciousPatterns = [
    'phishing', 'malware', 'ransomware', 'exploit',
    'clickjacking', 'zero-day', 'backdoor'
  ];

  let riskScore = 0;
  const findings: string[] = [];

  // Check PII leakage
  for (const pattern of piiPatterns) {
    if (lowerText.includes(pattern)) {
      riskScore += 150;
      findings.push(`PII keyword detected: ${pattern}`);
    }
  }

  // Check SQL injection
  for (const pattern of sqlPatterns) {
    if (lowerText.includes(pattern)) {
      riskScore += 200;
      findings.push(`SQL injection pattern: ${pattern}`);
    }
  }

  // Check malicious content
  for (const pattern of maliciousPatterns) {
    if (lowerText.includes(pattern)) {
      riskScore += 100;
      findings.push(`Malicious keyword: ${pattern}`);
    }
  }

  // Determine severity and category
  let severity: SecurityAnalysis['severity'] = 'LOW';
  let category: SecurityAnalysis['category'] = 'SAFE';
  let isThreat = false;

  if (riskScore >= 200) {
    severity = 'CRITICAL';
    isThreat = true;
    category = findings.some(f => f.includes('SQL')) ? 'SQL_INJECTION' :
               findings.some(f => f.includes('PII')) ? 'PII_LEAK' : 'MALICIOUS_CONTENT';
  } else if (riskScore >= 100) {
    severity = 'HIGH';
    isThreat = true;
    category = findings.some(f => f.includes('PII')) ? 'PII_LEAK' : 'MALICIOUS_CONTENT';
  } else if (riskScore >= 50) {
    severity = 'MEDIUM';
    isThreat = true;
    category = 'MALICIOUS_CONTENT';
  }

  return {
    isThreat,
    severity,
    category,
    reason: findings.length > 0
      ? `Keyword analysis: ${findings.join(', ')}`
      : 'Local keyword analysis - no threats detected'
  };
}

/**
 * OPENAI API CALL - Primary analysis method
 */
async function analyzeWithOpenAI(
  text: string,
  model: string = 'gpt-4o-mini'
): Promise<SecurityAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const systemPrompt = `You are the security engine for Enterprise Research Shield (ERS).
Your task is to analyze text for security risks, specifically:
1. SQL Injection attempts or code execution patterns.
2. Norwegian/Swedish PII leakage (personnummer, fødselsnummer, sensitiv helseinformasjon).
3. Malicious intent or social engineering.

Respond ONLY with a JSON object in this exact format:
{
  "isThreat": boolean,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "category": "SQL_INJECTION" | "PII_LEAK" | "MALICIOUS_CONTENT" | "SAFE",
  "reason": "Short explanation"
}`;

  const response = await withTimeout(
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `ANALYZE THIS TEXT:\n"${text}"` }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    }),
    10000, // 10 second timeout for OpenAI
    'OpenAI API call timed out after 10 seconds'
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // HARDENED PARSING with structure validation
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response structure: data is not an object');
  }

  if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
    throw new Error('Invalid response structure: missing choices array');
  }

  if (!data.choices[0].message || !data.choices[0].message.content) {
    throw new Error('Invalid response structure: missing message content');
  }

  // Parse the JSON response from OpenAI
  const content = data.choices[0].message.content;
  const analysis: SecurityAnalysis = JSON.parse(content);

  // Validate required fields
  if (!analysis.hasOwnProperty('isThreat') ||
      !analysis.hasOwnProperty('severity') ||
      !analysis.hasOwnProperty('category')) {
    throw new Error('Invalid analysis structure: missing required fields');
  }

  return analysis;
}

/**
 * MAIN ANALYSIS FUNCTION - Cloud-First with Local Fallback
 *
 * Strategy:
 * 1. Try OpenAI API (gpt-4o-mini) with 10s timeout
 * 2. On ANY failure → Fall back to local keyword analysis
 * 3. Always returns valid SecurityAnalysis structure
 */
export async function analyzeWithLocalAI(
  text: string,
  model: string = 'gpt-4o-mini'
): Promise<SecurityAnalysis> {
  try {
    console.log('🌐 Attempting OpenAI analysis with', model);
    const result = await analyzeWithOpenAI(text, model);
    console.log('✅ OpenAI analysis successful');
    return result;
  } catch (error) {
    console.error('❌ OpenAI Analysis failed:', error);

    // Enhanced logging for debugging
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        console.error('⏱️ Timeout Error - OpenAI took too long');
      } else if (error.message.includes('OPENAI_API_KEY')) {
        console.error('🔑 API Key Error - Check environment variables');
      } else if (error instanceof SyntaxError) {
        console.error('📝 JSON Parse Error - OpenAI returned invalid JSON');
      } else if (error instanceof TypeError) {
        console.error('🔧 Structure Error - Unexpected response format');
      }
    }

    // FALLBACK TO LOCAL KEYWORD ANALYSIS
    console.warn('⚠️ Falling back to local keyword analysis');
    const keywordResult = analyzeWithKeywords(text);

    // Add fallback notice to reason
    return {
      ...keywordResult,
      reason: `[Local Fallback] ${keywordResult.reason}`
    };
  }
}

/**
 * AI COUNCIL - Dual analysis with OpenAI
 *
 * Uses gpt-4o-mini twice with different prompts:
 * - Risk-AI: Strict security focus
 * - Analysis-AI: Contextual understanding
 *
 * If either fails, falls back to keyword analysis
 */
export async function analyzeWithCouncil(text: string): Promise<CouncilAnalysis> {
  const riskModel = process.env.OPENAI_RISK_MODEL || 'gpt-4o-mini';
  const analysisModel = process.env.OPENAI_ANALYSIS_MODEL || 'gpt-4o-mini';

  // System-prompt för Risk-AI - Strikt säkerhetsfokus
  const riskPrompt = `You are the RISK-AI for Enterprise Research Shield (ERS).
Your role is STRICT SECURITY ANALYSIS with zero tolerance for threats.

Analyze text for:
1. SQL Injection attempts or code execution patterns
2. Norwegian/Swedish PII leakage (personnummer, fødselsnummer, sensitiv helseinformasjon)
3. Malicious intent or social engineering

Be CONSERVATIVE - flag suspicious patterns even if uncertain.

Respond ONLY with JSON:
{
  "isThreat": boolean,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "category": "SQL_INJECTION" | "PII_LEAK" | "MALICIOUS_CONTENT" | "SAFE",
  "reason": "Short explanation"
}`;

  // System-prompt för Analys-AI - Djupare kontextförståelse
  const analysisPrompt = `You are the ANALYSIS-AI for Enterprise Research Shield (ERS).
Your role is CONTEXTUAL ANALYSIS with deep understanding.

Analyze text for:
1. SQL Injection - distinguish between actual threats vs. educational content
2. Norwegian/Swedish PII - consider if data is already masked/sanitized
3. Malicious intent - understand context and user intent

Be ANALYTICAL - consider context before flagging.

Respond ONLY with JSON:
{
  "isThreat": boolean,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "category": "SQL_INJECTION" | "PII_LEAK" | "MALICIOUS_CONTENT" | "SAFE",
  "reason": "Short explanation with context"
}`;

  try {
    console.log('🤖 AI Council analyzing with OpenAI:', riskModel, '+', analysisModel);

    // Kör båda AI-modellerna PARALLELLT
    const [riskResult, analysisResult] = await Promise.all([
      analyzeWithModelOpenAI(text, riskModel, riskPrompt),
      analyzeWithModelOpenAI(text, analysisModel, analysisPrompt)
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

    // Fail-safe: Om OpenAI är nere, försök med endast Risk-AI
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
      // Total fail-safe: OpenAI helt nere, använd keyword analysis
      console.error('❌ Complete AI Council failure - using keyword fallback');
      const keywordResult = analyzeWithKeywords(text);

      return {
        isThreat: keywordResult.isThreat,
        severity: keywordResult.severity,
        category: keywordResult.category,
        reason: `[Keyword Fallback] ${keywordResult.reason}`,
        council: {
          riskAI: {
            ...keywordResult,
            model: 'keyword-analysis',
            reason: keywordResult.reason
          },
          analysisAI: {
            isThreat: false,
            severity: 'LOW',
            category: 'SAFE',
            reason: 'Unavailable',
            model: 'unavailable'
          },
          consensus: 'UNANIMOUS_SAFE',
          finalDecision: keywordResult.isThreat && ['CRITICAL', 'HIGH'].includes(keywordResult.severity) ? 'BLOCK' : 'ALLOW',
          reasoning: 'Complete fallback to keyword analysis - OpenAI unavailable'
        }
      };
    }
  }
}

/**
 * Helper: Analysera med specifik modell och prompt (OpenAI version)
 */
async function analyzeWithModelOpenAI(
  text: string,
  model: string,
  systemPrompt: string
): Promise<SecurityAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await withTimeout(
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `ANALYZE THIS TEXT:\n"${text}"` }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    }),
    10000,
    `OpenAI API call timed out for model ${model}`
  );

  if (!response.ok) {
    throw new Error(`OpenAI API error for ${model}: ${response.status}`);
  }

  const data = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid OpenAI response structure');
  }

  return JSON.parse(data.choices[0].message.content);
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
