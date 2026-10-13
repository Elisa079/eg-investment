import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('cookie')?.split('eg_session=')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifySession(token);

    const body = await req.json();
    const { amount, method, recipientDetails } = body;
    if (!amount || !method || !recipientDetails) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    // For demo, ensure user has available balance >= amount (we'll compute from transactions)
    const credits = await prisma.transaction.aggregate({ where: { userId: user.id, type: 'credit', status: 'completed' }, _sum: { amount: true } });
    const debits = await prisma.transaction.aggregate({ where: { userId: user.id, type: 'debit', status: 'completed' }, _sum: { amount: true } });
    const balance = (credits._sum.amount || 0) - (debits._sum.amount || 0);

    if (amount > balance) return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });

    const withdrawal = await prisma.withdrawal.create({ data: {
      userId: user.id,
      amount: Number(amount),
      method,
      recipientDetails: recipientDetails as any,
      status: 'pending',
    }});

    // create ledger hold (debit pending)
    const tx = await prisma.transaction.create({ data: {
      userId: user.id,
      type: 'debit',
      category: 'withdrawal_hold',
      amount: Number(amount),
      reference: `wd_${withdrawal.id}`,
      status: 'pending',
      metadata: { withdrawalId: withdrawal.id }
    }});

    return NextResponse.json({ message: 'Withdrawal requested', withdrawalId: withdrawal.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
