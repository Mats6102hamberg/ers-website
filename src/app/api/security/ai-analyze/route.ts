import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithLocalAI } from '@/lib/ai-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, model } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    // Kontrollera om OpenAI är konfigurerat (krävs inte, fallback till keyword analysis)
    const openAIConfigured = !!process.env.OPENAI_API_KEY;
    if (!openAIConfigured) {
      console.warn('⚠️ OPENAI_API_KEY not set - will use keyword fallback');
    }

    const analysis = await analyzeWithLocalAI(text, model);

    return NextResponse.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze content with AI'
      },
      { status: 500 }
    );
  }
}
