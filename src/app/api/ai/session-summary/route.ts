import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { generateSessionSummary, isGeminiConfigured, estimateAICost } from '@/lib/ai/gemini';
import { checkUsageLimit, incrementUsage, trackCost } from '@/lib/usage-limits';
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';

/**
 * POST /api/ai/session-summary
 * Generate AI-powered session summary
 */
export async function POST(req: NextRequest) {
  try {
    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { success: false, message: 'AI features not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission to use AI features
    const canUseAI = await hasPermission(session.user.id, PERMISSIONS.USE_AI_FEATURES);
    if (!canUseAI) {
      return NextResponse.json(
        { success: false, message: 'You don\'t have permission to use AI features. Contact your admin.' },
        { status: 403 }
      );
    }

    // Get user's organization
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check AI summaries usage limit
    const usageCheck = await checkUsageLimit(user.organization_id, 'ai_summaries', 1);

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: usageCheck.message,
          overageCost: usageCheck.overageCost,
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    // Get session details
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        client:clients(id, full_name),
        coach:users!coach_id(id, full_name)
      `)
      .eq('id', sessionId)
      .eq('organization_id', user.organization_id)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Generate AI summary
    const summary = await generateSessionSummary({
      sessionTitle: sessionData.title,
      clientName: sessionData.client?.full_name || 'Unknown',
      sessionDate: sessionData.scheduled_at,
      sessionNotes: sessionData.notes || '',
      sessionDuration: sessionData.duration,
      sessionType: sessionData.session_type || 'coaching',
    });

    // Store summary in database
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        ai_summary: summary.summary,
        ai_key_points: summary.keyPoints,
        ai_action_items: summary.actionItems,
        ai_tags: summary.tags,
        ai_sentiment: summary.sentiment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error saving AI summary:', updateError);
    }

    // Increment usage counter
    await incrementUsage(user.organization_id, 'ai_summaries', 1);

    // Track cost (internal)
    const cost = estimateAICost('session_summary');
    await trackCost(user.organization_id, 'ai_summary', 1, cost);

    return NextResponse.json({
      success: true,
      summary,
      usage: {
        current: usageCheck.current + 1,
        limit: usageCheck.limit,
        remaining: usageCheck.remaining - 1,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/ai/session-summary:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
