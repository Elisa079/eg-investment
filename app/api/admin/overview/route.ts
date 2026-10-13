import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('cookie')?.split('eg_session=')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = verifySession(token);

    const adminPhone = '+25479491677';
    const u = await prisma.user.findUnique({ where: { id: admin.id } });
    if (!u || u.phone !== adminPhone) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const pendingMemberships = await prisma.membership.findMany({ where: { status: 'pending' } });
    const pendingSubmissions = await prisma.taskSubmission.findMany({ where: { status: 'pending' } });
    const pendingWithdrawals = await prisma.withdrawal.findMany({ where: { status: 'pending' } });

    return NextResponse.json({ pendingMemberships, pendingSubmissions, pendingWithdrawals });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
