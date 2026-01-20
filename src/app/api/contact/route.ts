import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, EMAIL_TO } = process.env;
    if (!EMAIL_USER || !EMAIL_PASSWORD || !EMAIL_FROM || !EMAIL_TO) {
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
    });

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: `Contact form submission from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}

Message:
${message}
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('CONTACT API ERROR:', err.message);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
