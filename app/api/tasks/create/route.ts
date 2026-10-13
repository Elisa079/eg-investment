import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('cookie')?.split('eg_session=')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifySession(token);

    const adminPhone = '+25479491677';
    if (user.email !== 'admin@eginvestment.example' && user.username !== 'admin') {
      // fallback check by phone
      const u = await prisma.user.findUnique({ where: { id: user.id } });
      if (!u || u.phone !== adminPhone) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, submissionType, rewardAmount, startAt, endAt } = body;
    if (!title || !submissionType || !rewardAmount) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const task = await prisma.task.create({ data: {
      title,
      description: description || '',
      submissionType,
      rewardAmount: Number(rewardAmount),
      startAt: new Date(startAt || Date.now()),
      endAt: new Date(endAt || Date.now() + 1000*60*60*24*30),
    }});

    return NextResponse.json({ message: 'Task created', task }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
