import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = req.headers.get('cookie')?.split('eg_session=')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = verifySession(token);

    const { membershipId, action, notes } = body;
    if (!membershipId || !action) return NextResponse.json({ error: 'membershipId and action are required' }, { status: 400 });

    // simple admin check: phone matches owner admin
    const adminPhone = '+25479491677';
    const adminUser = await prisma.user.findUnique({ where: { phone: adminPhone } });
    if (!adminUser || adminUser.id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
    if (!membership) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (action === 'approve') {
      await prisma.membership.update({ where: { id: membershipId }, data: { status: 'approved', reviewedAt: new Date(), adminId: user.id } });
      await prisma.user.update({ where: { id: membership.userId }, data: { isMember: true } });
      return NextResponse.json({ message: 'Membership approved' }, { status: 200 });
    } else if (action === 'reject') {
      await prisma.membership.update({ where: { id: membershipId }, data: { status: 'rejected', reviewedAt: new Date(), adminId: user.id, } });
      return NextResponse.json({ message: 'Membership rejected' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
