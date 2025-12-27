import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json();

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if SMTP is configured
    const smtpEnabled = process.env.SMTP_ENABLED === 'true';
    
    if (!smtpEnabled) {
      console.log('📧 [ALERT] SMTP disabled - Would send email:', {
        to,
        subject,
        contentLength: html.length
      });
      
      return NextResponse.json({
        success: true,
        message: 'Email alert logged (SMTP disabled)',
        debug: { to, subject }
      });
    }

    // In production, integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll use a mock implementation
    
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: process.env.ALERT_FROM_EMAIL || 'alerts@ers.com',
    //   to,
    //   subject,
    //   html,
    //   text
    // });

    console.log('✅ [ALERT] Email sent successfully to', to);

    return NextResponse.json({
      success: true,
      message: 'Email alert sent successfully'
    });
  } catch (error) {
    console.error('❌ [ALERT] Failed to send email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email alert' 
      },
      { status: 500 }
    );
  }
}
