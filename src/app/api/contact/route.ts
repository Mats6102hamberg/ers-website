import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, organization, email, phone, message } = body;

    // Validera input
    if (!name || !organization || !email) {
      return NextResponse.json(
        { error: 'Namn, organisation och e-post är obligatoriska' },
        { status: 400 }
      );
    }

    // Skapa email-innehåll
    const emailContent = `
Ny intresseanmälan för ERS

Namn: ${name}
Organisation: ${organization}
E-post: ${email}
Telefon: ${phone || 'Ej angivet'}

Meddelande:
${message || 'Inget meddelande'}

---
Skickat från smartflowab.se kontaktformulär
    `.trim();

    // Skicka email via Resend (om konfigurerat)
    if (process.env.RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'ERS Kontaktformulär <noreply@smartflowab.se>',
          to: ['info@smartflowab.se'],
          subject: `Ny intresseanmälan från ${name} (${organization})`,
          text: emailContent,
          reply_to: email
        })
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.text();
        console.error('Resend API error:', error);
        throw new Error('Failed to send email via Resend');
      }
    } else {
      // Fallback: Logga till console om Resend inte är konfigurerat
      console.log('📧 Ny intresseanmälan (Resend ej konfigurerat):');
      console.log(emailContent);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Tack för ditt intresse! Vi återkommer inom 24 timmar.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod. Vänligen försök igen eller kontakta oss direkt på info@smartflowab.se' },
      { status: 500 }
    );
  }
}
