import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('cookie')?.split('eg_session=')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifySession(token);

    const body = await req.json();
    const { taskId, originalName, storageKey, mimeType, sizeBytes, mediaType } = body;
    if (!taskId || !storageKey) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const media = await prisma.media.create({ data: {
      userId: user.id,
      originalName: originalName || storageKey,
      storageKey,
      mimeType: mimeType || 'application/octet-stream',
      sizeBytes: Number(sizeBytes || 0),
      mediaType: mediaType || 'video',
      expiresAt: new Date(Date.now() + 1000*60*60*24*2), // expires in 2 days
    }});

    const submission = await prisma.taskSubmission.create({ data: {
      taskId,
      userId: user.id,
      mediaId: media.id,
      status: 'pending',
    }});

    // notify admin in demo
    await prisma.notification.create({ data: {
      channel: 'in-app',
      to: '+25479491677',
      template: 'submission_pending',
      payload: { submissionId: submission.id },
      status: 'queued',
    }});

    return NextResponse.json({ message: 'Submission created', submissionId: submission.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
