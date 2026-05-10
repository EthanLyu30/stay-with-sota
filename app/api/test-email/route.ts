import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email/sender';

export async function POST() {
  try {
    await sendTestEmail();
    return NextResponse.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    );
  }
}
