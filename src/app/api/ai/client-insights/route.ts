import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { generateClientInsights, isGeminiConfigured, estimateAICost } from '@/lib/ai/gemini';
import { checkUsageLimit, incrementUsage, trackCost } from '@/lib/usage-limits';

/**
 * POST /api/ai/client-insights
 * Generate AI insights about client progress
 */
export async function POST(req: NextRequest) {
  try {
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { success: false, message: 'AI features not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json(
        { success: false, message: 'Client ID is required' },
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

    const { data: user } = await (supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single() as any);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check AI insights usage limit
    const usageCheck = await checkUsageLimit(user.organization_id, 'ai_insights', 1);

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

    // Get client details
    const { data: client } = await (supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('organization_id', user.organization_id)
      .single() as any);

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Client not found' },
        { status: 404 }
      );
    }

    // Get sessions with AI summaries
    const { data: sessions } = await (supabase
      .from('sessions')
      .select('ai_summary, scheduled_at')
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .not('ai_summary', 'is', null)
      .order('scheduled_at', { ascending: false })
      .limit(10) as any);

    const sessionSummaries = (sessions || []).map(s => s.ai_summary).filter(Boolean);

    if (sessionSummaries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No session summaries available. Generate session summaries first.',
        },
        { status: 400 }
      );
    }

    // Get program enrollments
    const { data: programs } = await (supabase
      .from('client_programs')
      .select('programs(name)')
      .eq('client_id', clientId) as any);

    const enrolledPrograms = programs?.map(p => p.programs?.name).filter(Boolean) || [];

    // Generate insights
    const insights = await generateClientInsights({
      clientName: client.full_name,
      clientGoals: client.goals || [],
      sessionSummaries,
      totalSessions: sessions?.length || 0,
      enrolledPrograms,
    });

    // Store insights in database
    await ((supabase as any)
      .from('clients')
      .update({
        ai_insights: insights,
        ai_insights_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId));

    // Increment usage
    await incrementUsage(user.organization_id, 'ai_insights', 1);

    // Track cost
    const cost = estimateAICost('client_insights');
    await trackCost(user.organization_id, 'ai_client_insights', 1, cost);

    return NextResponse.json({
      success: true,
      insights,
      usage: {
        current: usageCheck.current + 1,
        limit: usageCheck.limit,
        remaining: usageCheck.remaining - 1,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/ai/client-insights:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
