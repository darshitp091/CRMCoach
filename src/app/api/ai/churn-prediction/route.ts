import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { predictChurnRisk, isGeminiConfigured, estimateAICost } from '@/lib/ai/gemini';
import { checkUsageLimit, incrementUsage, trackCost } from '@/lib/usage-limits';

/**
 * POST /api/ai/churn-prediction
 * Predict client churn risk using AI
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

    const { data: user } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single();

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
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('organization_id', user.organization_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, message: 'Client not found' },
        { status: 404 }
      );
    }

    // Get session history
    const { data: sessions } = await supabase
      .from('sessions')
      .select('scheduled_at, status')
      .eq('client_id', clientId)
      .order('scheduled_at', { ascending: false })
      .limit(50);

    const sessionHistory = (sessions || []).map(s => ({
      date: s.scheduled_at,
      attended: s.status === 'completed',
      cancelled: s.status === 'cancelled',
      noShow: s.status === 'no_show',
    }));

    const totalSessions = sessions?.length || 0;
    const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
    const cancelledSessions = sessions?.filter(s => s.status === 'cancelled').length || 0;
    const noShowSessions = sessions?.filter(s => s.status === 'no_show').length || 0;

    const lastSession = sessions?.[0];
    const lastSessionDate = lastSession?.scheduled_at || 'Never';

    // Predict churn risk
    const prediction = await predictChurnRisk({
      clientId,
      clientName: client.full_name,
      sessionHistory,
      lastSessionDate,
      totalSessions,
      completedSessions,
      cancelledSessions,
      noShowSessions,
    });

    // Store prediction in database
    await supabase
      .from('clients')
      .update({
        churn_risk_score: prediction.riskScore,
        churn_risk_level: prediction.riskLevel,
        churn_prediction_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    // Increment usage
    await incrementUsage(user.organization_id, 'ai_insights', 1);

    // Track cost
    const cost = estimateAICost('churn_prediction');
    await trackCost(user.organization_id, 'ai_churn_prediction', 1, cost);

    return NextResponse.json({
      success: true,
      prediction,
      usage: {
        current: usageCheck.current + 1,
        limit: usageCheck.limit,
        remaining: usageCheck.remaining - 1,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/ai/churn-prediction:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to predict churn risk' },
      { status: 500 }
    );
  }
}
