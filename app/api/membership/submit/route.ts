import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = req.headers.get('cookie')?.split('eg_session=')[1];

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = verifySession(token);

    const { amount = 1000, paymentReference, attachmentUrl } = body;

    if (!paymentReference) {
      return NextResponse.json({ error: 'paymentReference is required' }, { status: 400 });
    }

    // prevent duplicate payment references
    const existing = await prisma.membership.findUnique({ where: { paymentReference } }).catch(() => null);
    if (existing) return NextResponse.json({ error: 'Payment reference already used' }, { status: 409 });

    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        amount: Number(amount),
        paymentReference,
        attachmentUrl: attachmentUrl || null,
        status: 'pending',
      },
    });

    // create a notification for admin (demo)
    await prisma.notification.create({
      data: {
        channel: 'in-app',
        to: '+25479491677',
        template: 'membership_submitted',
        payload: { membershipId: membership.id },
        status: 'queued',
      },
    });

    return NextResponse.json({ message: 'Membership submitted', membershipId: membership.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
