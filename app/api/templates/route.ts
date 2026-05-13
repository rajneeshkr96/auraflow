import { NextResponse } from 'next/server';
import { TemplateService } from '@/lib/templates';

export async function GET() {
  try {
    const templates = await TemplateService.getTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action === 'seed') {
      // Only allow in development
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
      }
      
      await TemplateService.seedDefaultTemplates();
      return NextResponse.json({ success: true, message: 'Templates seeded successfully' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Template API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}