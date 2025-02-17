import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In test mode, we can only send to verified emails
const TEST_MODE = !process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';
const RECIPIENT_EMAIL = TEST_MODE ? 'chikuma@dera.ai' : 'hello@dera.ai';

// Discord webhook for instant notifications
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function sendDiscordNotification(data: { name: string; email: string; company?: string; message: string }) {
  if (!DISCORD_WEBHOOK_URL) return;

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [{
          title: `New Contact Form Submission from ${data.name}`,
          color: 0x00ff00, // Green color
          fields: [
            {
              name: 'Name',
              value: data.name,
              inline: true,
            },
            {
              name: 'Email',
              value: data.email,
              inline: true,
            },
            {
              name: 'Company',
              value: data.company || 'Not provided',
              inline: true,
            },
            {
              name: 'Message',
              value: data.message,
            },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    console.log('Discord notification sent successfully');
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, message } = body;

    console.log('Received form submission:', { name, email, company, message });

    // Basic validation
    if (!name || !email || !message) {
      console.log('Validation failed:', { name, email, message });
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email:', email);
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Send Discord notification first (instant)
    await sendDiscordNotification({ name, email, company, message });

    console.log('Attempting to send email with Resend...');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('Sending to:', RECIPIENT_EMAIL);

    // Send email using Resend (as backup)
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: RECIPIENT_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Company: ${company || 'Not provided'}

Message:
${message}

Note: This email was ${TEST_MODE ? 'sent in test mode' : 'sent in production mode'}
      `,
      replyTo: email,
    });

    console.log('Resend API response:', result);

    return NextResponse.json(
      { message: 'Form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}