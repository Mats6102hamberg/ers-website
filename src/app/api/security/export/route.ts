import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || 'all';
    const profileType = searchParams.get('profileType');

    let whereClause: any = {};

    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      whereClause.timestamp = { gte: startDate };
    }

    // Filter by profile type
    if (profileType && profileType !== 'all') {
      whereClause.profileType = profileType;
    }

    // Fetch all audit logs
    const auditLogs = await prisma.securityAudit.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' }
    });

    // Convert to CSV
    const csv = convertToCSV(auditLogs);

    // Set headers for CSV download
    const filename = `security-audit-${new Date().toISOString().split('T')[0]}.csv`;
    
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Security export error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export security audit logs' 
      },
      { status: 500 }
    );
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return 'Timestamp,Profile Type,Content Type,Risk Score,Findings Count,Sanitized,Ollama Used,Campaign ID,Recipient Email,Blocked,Findings\n';
  }

  // CSV Headers
  const headers = [
    'Timestamp',
    'Profile Type',
    'Content Type',
    'Risk Score',
    'Findings Count',
    'Sanitized',
    'Ollama Used',
    'Campaign ID',
    'Recipient Email',
    'Blocked',
    'Findings'
  ];

  // Create CSV rows
  const rows = data.map(log => {
    const findings = Array.isArray(log.findings) 
      ? log.findings.map((f: any) => `${f.pattern}: ${f.severity}`).join('; ')
      : JSON.stringify(log.findings);

    return [
      new Date(log.timestamp).toISOString(),
      log.profileType,
      log.contentType,
      log.riskScore,
      log.findingsCount,
      log.sanitized ? 'Yes' : 'No',
      log.ollamaUsed ? 'Yes' : 'No',
      log.campaignId || '',
      log.recipientEmail || '',
      log.blocked ? 'Yes' : 'No',
      `"${findings.replace(/"/g, '""')}"` // Escape quotes in findings
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
