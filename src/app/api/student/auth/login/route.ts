import { NextResponse } from 'next/server';
import { runAsAdmin } from '@/lib/db';
import { isRegistrationWindowOpen, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, index_no, nic_no } = await req.json();
    if (!email || !index_no || !nic_no) {
      return NextResponse.json({ success: false, error: 'Email, Index Number, and NIC Number are required.' }, { status: 400 });
    }

    // Check registration window status
    const mockTime = req.headers.get('x-mock-time');
    const { isOpen } = await isRegistrationWindowOpen(mockTime);
    if (!isOpen) {
      return NextResponse.json({ success: false, error: 'Portal Closed', code: 'PORTAL_CLOSED' }, { status: 403 });
    }

    // Verify student details (case-insensitive for email, strict for index number and NIC)
    const student = await runAsAdmin(async (client) => {
      const res = await client.query(
        'SELECT email, index_no, nic_no FROM students WHERE LOWER(email) = LOWER($1) AND index_no = $2 AND nic_no = $3',
        [email.trim(), index_no.trim(), nic_no.trim()]
      );
      return res.rows[0] || null;
    });

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student record not found or credential mismatch.' }, { status: 401 });
    }

    // Create session token
    const token = signToken({ email: student.email.toLowerCase().trim(), index_no: student.index_no.trim() });

    const response = NextResponse.json({ success: true, message: 'Authentication successful.' });
    
    // Set HTTP-only cookie
    response.cookies.set({
      name: 'student_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
