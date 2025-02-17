import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In test mode, we can only send to verified emails
const TEST_MODE = !process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';
const RECIPIENT_EMAIL = TEST_MODE ? 'chikuma@dera.ai' : 'hello@dera.ai';

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

    console.log('Attempting to send email with Resend...');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('Sending to:', RECIPIENT_EMAIL);

    // Send email using Resend
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