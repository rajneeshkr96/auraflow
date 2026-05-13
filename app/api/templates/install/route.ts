import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth';
import { TemplateService } from '@/lib/templates';

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId } = await request.json();
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const automation = await TemplateService.useTemplate(templateId, userId);
    
    return NextResponse.json({ 
      success: true, 
      data: automation,
      message: 'Template installed successfully'
    });
  } catch (error) {
    console.error('Template installation error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to install template' 
    }, { status: 500 });
  }
}