import { ScanResult } from './ContentScanner';
import { ProfileType } from './SecurityProfile';
import { prisma, withTimeout } from '../prisma';

export interface AuditEntry {
  profileType: ProfileType;
  contentType: string;
  scanResult: ScanResult;
  campaignId?: string;
  recipientEmail?: string;
  blocked: boolean;
  ollamaUsed?: boolean;
}

export class SecurityAuditor {
  async log(entry: AuditEntry): Promise<void> {
    try {
      await withTimeout(
        prisma.securityAudit.create({
          data: {
            profileType: entry.profileType,
            contentType: entry.contentType,
            riskScore: entry.scanResult.riskScore,
            findingsCount: entry.scanResult.findings.length,
            findings: entry.scanResult.findings as any,
            sanitized: !entry.scanResult.clean,
            ollamaUsed: entry.ollamaUsed || false,
            campaignId: entry.campaignId,
            recipientEmail: entry.recipientEmail,
            blocked: entry.blocked
          }
        }),
        5000, // 5 second timeout
        'SecurityAudit log write timed out after 5 seconds'
      );
    } catch (error) {
      console.error('Failed to log security audit:', error);
      // Database operation failed or timed out - operation continues without blocking
    }
  }

  async getStats(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day') {
    const now = new Date();
    const startTime = new Date();

    switch (timeRange) {
      case 'hour':
        startTime.setHours(now.getHours() - 1);
        break;
      case 'day':
        startTime.setDate(now.getDate() - 1);
        break;
      case 'week':
        startTime.setDate(now.getDate() - 7);
        break;
      case 'month':
        startTime.setMonth(now.getMonth() - 1);
        break;
    }

    const [totalScans, blockedCount, avgRiskScore, profileBreakdown, topFindings] = await Promise.all([
      prisma.securityAudit.count({
        where: { timestamp: { gte: startTime } }
      }),
      prisma.securityAudit.count({
        where: { 
          timestamp: { gte: startTime },
          blocked: true
        }
      }),
      prisma.securityAudit.aggregate({
        where: { timestamp: { gte: startTime } },
        _avg: { riskScore: true }
      }),
      prisma.securityAudit.groupBy({
        by: ['profileType'],
        where: { timestamp: { gte: startTime } },
        _count: true,
        _sum: { riskScore: true }
      }),
      prisma.securityAudit.findMany({
        where: { 
          timestamp: { gte: startTime },
          findingsCount: { gt: 0 }
        },
        orderBy: { riskScore: 'desc' },
        take: 10,
        select: {
          id: true,
          timestamp: true,
          profileType: true,
          riskScore: true,
          findingsCount: true,
          findings: true
        }
      })
    ]);

    return {
      timeRange,
      totalScans,
      blockedCount,
      avgRiskScore: avgRiskScore._avg.riskScore || 0,
      profileBreakdown: profileBreakdown.map((p: any) => ({
        profile: p.profileType,
        count: p._count,
        totalRisk: p._sum.riskScore || 0
      })),
      topFindings,
      scanRate: totalScans / this.getHours(timeRange),
      blockRate: totalScans > 0 ? (blockedCount / totalScans) * 100 : 0
    };
  }

  async getRecentAlerts(limit: number = 20) {
    return prisma.securityAudit.findMany({
      where: {
        OR: [
          { riskScore: { gte: 100 } },
          { blocked: true }
        ]
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  async getProfileStats(profileType: ProfileType) {
    const stats = await prisma.securityAudit.groupBy({
      by: ['contentType'],
      where: { profileType },
      _count: true,
      _avg: { riskScore: true },
      _sum: { findingsCount: true }
    });

    return stats.map((s: any) => ({
      contentType: s.contentType,
      scans: s._count,
      avgRisk: s._avg.riskScore || 0,
      totalFindings: s._sum.findingsCount || 0
    }));
  }

  private getHours(timeRange: string): number {
    switch (timeRange) {
      case 'hour': return 1;
      case 'day': return 24;
      case 'week': return 168;
      case 'month': return 720;
      default: return 24;
    }
  }

  async cleanup(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.securityAudit.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
        blocked: false,
        riskScore: { lt: 50 }
      }
    });

    return result.count;
  }

  async getTrendData(days: number = 7) {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);

    const dailyData = [];

    for (let i = 0; i < days; i++) {
      const dayStart = new Date(startDate);
      dayStart.setDate(startDate.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const [highAlerts, criticalAlerts, totalScans] = await Promise.all([
        prisma.securityAudit.count({
          where: {
            timestamp: { gte: dayStart, lte: dayEnd },
            riskScore: { gte: 100, lt: 200 }
          }
        }),
        prisma.securityAudit.count({
          where: {
            timestamp: { gte: dayStart, lte: dayEnd },
            riskScore: { gte: 200 }
          }
        }),
        prisma.securityAudit.count({
          where: {
            timestamp: { gte: dayStart, lte: dayEnd }
          }
        })
      ]);

      dailyData.push({
        date: dayStart.toISOString().split('T')[0],
        high: highAlerts,
        critical: criticalAlerts,
        total: totalScans
      });
    }

    return dailyData;
  }
}

export const auditor = new SecurityAuditor();
