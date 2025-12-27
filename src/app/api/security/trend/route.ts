import { NextRequest, NextResponse } from 'next/server';
import { auditor } from '@/lib/gateway-core/SecurityAuditor';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');

    const trendData = await auditor.getTrendData(days);

    return NextResponse.json({
      success: true,
      data: trendData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Security trend error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch security trend data' 
      },
      { status: 500 }
    );
  }
}
