#!/usr/bin/env node

/**
 * Test-script för AI-analys i Enterprise Research Shield
 * Kör: node test-ai-analysis.js
 */

const API_BASE = 'http://localhost:3000/api/security';

// Färgkoder för terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test-scenarios
const testCases = [
  {
    name: 'SQL Injection - Classic OR 1=1',
    text: "SELECT * FROM users WHERE id = 1 OR 1=1",
    expectedThreat: true,
    expectedCategory: 'SQL_INJECTION'
  },
  {
    name: 'SQL Injection - Drop Table',
    text: "'; DROP TABLE users; --",
    expectedThreat: true,
    expectedCategory: 'SQL_INJECTION'
  },
  {
    name: 'Norsk PII - Fødselsnummer + adress',
    text: "Hei, mitt fødselsnummer er 010190-12345 og jeg bor på Storgata 15, Oslo",
    expectedThreat: true,
    expectedCategory: 'PII_LEAK'
  },
  {
    name: 'Social Engineering - Phishing',
    text: "Klikk her for å verifisere passordet ditt: http://evil.com/phishing",
    expectedThreat: true,
    expectedCategory: 'MALICIOUS_CONTENT'
  },
  {
    name: 'Safe Content - Normal email',
    text: "Hei! Hvordan går det? Håper alt er bra med deg. Vi sees på fredag!",
    expectedThreat: false,
    expectedCategory: 'SAFE'
  }
];

async function testAIAnalysis(testCase) {
  try {
    const response = await fetch(`${API_BASE}/ai-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: testCase.text,
        model: 'qwen2.5:7b'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API error');
    }

    const result = await response.json();
    const analysis = result.data;

    // Verifiera resultat
    const threatMatch = analysis.isThreat === testCase.expectedThreat;
    const categoryMatch = analysis.category === testCase.expectedCategory;
    const passed = threatMatch && categoryMatch;

    // Output med färgkodning
    const statusColor = passed ? colors.green : colors.red;
    const statusSymbol = passed ? '✅' : '❌';

    console.log(`\n${statusColor}${statusSymbol} ${testCase.name}${colors.reset}`);
    console.log(`   Text: "${testCase.text.substring(0, 60)}..."`);
    console.log(`   AI Resultat:`);
    console.log(`     - Threat: ${analysis.isThreat} (förväntat: ${testCase.expectedThreat})`);
    console.log(`     - Category: ${analysis.category} (förväntat: ${testCase.expectedCategory})`);
    console.log(`     - Severity: ${analysis.severity}`);
    console.log(`     - Reason: ${analysis.reason}`);

    return { passed, testCase: testCase.name, analysis };

  } catch (error) {
    console.error(`\n${colors.red}❌ ${testCase.name}${colors.reset}`);
    console.error(`   Error: ${error.message}`);
    return { passed: false, testCase: testCase.name, error: error.message };
  }
}

async function testIntegratedScan() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}🧪 INTEGRERAD SCAN (Regex + AI)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  const testContent = "Saksnummer: 2024/12345, fødselsnummer 010190-12345. SELECT * FROM admin WHERE password='123'";

  try {
    const response = await fetch(`${API_BASE}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: testContent,
        profileType: 'SOCIAL',
        contentType: 'email_text',
        enableDeepScan: true
      })
    });

    const result = await response.json();
    const data = result.data;

    console.log(`\n${colors.green}✅ Integrerad Scan Lyckades${colors.reset}`);
    console.log(`   Input: "${testContent.substring(0, 70)}..."`);
    console.log(`   Resultat:`);
    console.log(`     - Allowed: ${data.allowed}`);
    console.log(`     - Risk Score: ${data.riskScore}`);
    console.log(`     - Findings: ${data.findings.length}`);

    if (data.aiAnalysis) {
      console.log(`     - AI Threat: ${data.aiAnalysis.isThreat}`);
      console.log(`     - AI Category: ${data.aiAnalysis.category}`);
      console.log(`     - AI Reason: ${data.aiAnalysis.reason}`);
    }

    console.log(`\n   Fynd:`);
    data.findings.forEach((finding, i) => {
      console.log(`     ${i + 1}. ${finding.pattern} (${finding.severity})`);
    });

  } catch (error) {
    console.error(`\n${colors.red}❌ Integrerad Scan Misslyckades${colors.reset}`);
    console.error(`   Error: ${error.message}`);
  }
}

async function runTests() {
  console.log(`${colors.magenta}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║  🤖 ERS AI-Analys Test Suite (Qwen 2.5:7b)   ║${colors.reset}`);
  console.log(`${colors.magenta}╚════════════════════════════════════════════════╝${colors.reset}`);

  // Kontrollera att Ollama är tillgänglig
  try {
    const healthCheck = await fetch('http://localhost:11434/api/tags');
    if (!healthCheck.ok) {
      throw new Error('Ollama server not responding');
    }
    console.log(`\n${colors.green}✓ Ollama server is running${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}✗ Ollama server is not running!${colors.reset}`);
    console.error(`  Start it with: ollama serve`);
    process.exit(1);
  }

  // Kontrollera att Next.js API är tillgänglig
  try {
    const apiCheck = await fetch(API_BASE + '/stats?timeRange=hour');
    if (!apiCheck.ok && apiCheck.status !== 404) {
      throw new Error('Next.js API not responding');
    }
    console.log(`${colors.green}✓ Next.js API is running${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}✗ Next.js API is not running!${colors.reset}`);
    console.error(`  Start it with: npm run dev`);
    process.exit(1);
  }

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}🧪 DIREKTA AI-ANALYSER${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  const results = [];

  for (const testCase of testCases) {
    const result = await testAIAnalysis(testCase);
    results.push(result);
    // Vänta lite mellan tester för att inte överbelasta Ollama
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Kör integrerad scan
  await testIntegratedScan();

  // Sammanfattning
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`\n${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.magenta}📊 SAMMANFATTNING${colors.reset}`);
  console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`   Tests körda: ${total}`);
  console.log(`   Lyckade: ${colors.green}${passed}${colors.reset}`);
  console.log(`   Misslyckade: ${colors.red}${total - passed}${colors.reset}`);
  console.log(`   Success Rate: ${passRate >= 80 ? colors.green : colors.yellow}${passRate}%${colors.reset}\n`);

  process.exit(passed === total ? 0 : 1);
}

// Kör tester
runTests().catch(error => {
  console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
