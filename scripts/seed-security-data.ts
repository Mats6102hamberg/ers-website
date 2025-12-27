import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Norge-specifika mönster för realistisk testdata
const norwegianPatterns = [
  { pattern: 'Norwegian Fødselsnummer', severity: 'CRITICAL', matched: '010190-12345' },
  { pattern: 'Norwegian Fødselsnummer', severity: 'CRITICAL', matched: '150685-54321' },
  { pattern: 'Norwegian Fødselsnummer', severity: 'CRITICAL', matched: '230995-67890' },
  { pattern: 'Saksnummer', severity: 'HIGH', matched: 'SAK-2024/12345' },
  { pattern: 'Saksnummer', severity: 'HIGH', matched: 'SAKSNR: 2024/67890' },
  { pattern: 'NAV Decision Number', severity: 'HIGH', matched: 'VEDTAK-2024-001' },
  { pattern: 'NAV Decision Number', severity: 'HIGH', matched: 'BESLUT: 2024-456' },
  { pattern: 'Bank Account Number', severity: 'MEDIUM', matched: '1234-56-78901' },
  { pattern: 'Bank Account Number', severity: 'MEDIUM', matched: '9876-54-32109' },
  { pattern: 'Personnummer (SE)', severity: 'CRITICAL', matched: '901010-1234' },
  { pattern: 'Email Address', severity: 'LOW', matched: 'user@example.com' },
  { pattern: 'Phone Number', severity: 'LOW', matched: '+47 12345678' }
];

const profileTypes = ['SOCIAL', 'MEDICAL', 'ENTERPRISE'];
const contentTypes = ['email_subject', 'email_html', 'email_text', 'document'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFindings(): any[] {
  const numFindings = getRandomInt(1, 4);
  const findings = [];
  
  for (let i = 0; i < numFindings; i++) {
    findings.push(getRandomElement(norwegianPatterns));
  }
  
  return findings;
}

function calculateRiskScore(findings: any[]): number {
  let score = 0;
  for (const finding of findings) {
    switch (finding.severity) {
      case 'CRITICAL': score += 100; break;
      case 'HIGH': score += 50; break;
      case 'MEDIUM': score += 25; break;
      case 'LOW': score += 10; break;
    }
  }
  return score;
}

async function seedSecurityData() {
  console.log('🌱 Starting to seed security data...');

  const now = new Date();
  const events = [];

  // Generera 30 händelser över de senaste 7 dagarna
  for (let i = 0; i < 30; i++) {
    const daysAgo = getRandomInt(0, 6);
    const hoursAgo = getRandomInt(0, 23);
    const minutesAgo = getRandomInt(0, 59);
    
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);
    timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);

    const findings = generateFindings();
    const riskScore = calculateRiskScore(findings);
    const blocked = riskScore >= 200;
    const sanitized = riskScore >= 50 && !blocked;
    const profileType = getRandomElement(profileTypes);
    const contentType = getRandomElement(contentTypes);

    events.push({
      profileType,
      contentType,
      riskScore,
      findingsCount: findings.length,
      findings,
      sanitized,
      ollamaUsed: Math.random() > 0.7, // 30% chance
      blocked,
      campaignId: `camp_${getRandomInt(1000, 9999)}`,
      recipientEmail: `user${getRandomInt(1, 100)}@example.com`,
      timestamp
    });
  }

  // Sortera efter timestamp för bättre översikt
  events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Lägg in i databasen
  let created = 0;
  for (const event of events) {
    try {
      await prisma.securityAudit.create({
        data: event
      });
      created++;
      
      const emoji = event.blocked ? '🚫' : event.sanitized ? '🧹' : '✅';
      console.log(`${emoji} Created event: ${event.profileType} | Risk: ${event.riskScore} | ${event.timestamp.toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('❌ Failed to create event:', error);
    }
  }

  console.log(`\n✅ Successfully seeded ${created} security events!`);
  console.log('\n📊 Summary:');
  
  const blocked = events.filter(e => e.blocked).length;
  const sanitized = events.filter(e => e.sanitized && !e.blocked).length;
  const clean = events.filter(e => !e.sanitized && !e.blocked).length;
  
  console.log(`   🚫 Blocked (CRITICAL): ${blocked}`);
  console.log(`   🧹 Sanitized (HIGH): ${sanitized}`);
  console.log(`   ✅ Clean (LOW/MEDIUM): ${clean}`);
  
  const avgRisk = events.reduce((sum, e) => sum + e.riskScore, 0) / events.length;
  console.log(`   📈 Average risk score: ${avgRisk.toFixed(1)}`);
  
  console.log('\n🎯 Dashboard is now ready for demo!');
}

seedSecurityData()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
