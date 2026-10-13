import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('cookie')?.split('eg_session=')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifySession(token);

    const body = await req.json();
    const { referralCode } = body;
    if (!referralCode) return NextResponse.json({ error: 'referralCode required' }, { status: 400 });

    const referrer = await prisma.user.findFirst({ where: { referralCode } });
    if (!referrer) return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });

    if (referrer.id === user.id) return NextResponse.json({ error: 'Self-referral not allowed' }, { status: 400 });

    const existing = await prisma.referral.findFirst({ where: { referredId: user.id } });
    if (existing) return NextResponse.json({ error: 'Referral already registered' }, { status: 409 });

    const referral = await prisma.referral.create({ data: {
      referrerId: referrer.id,
      referredId: user.id,
      code: referralCode,
      status: 'awaiting_verification',
    }});

    return NextResponse.json({ message: 'Referral recorded', referralId: referral.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
