import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { addOns } from '@/config/pricing';

/**
 * GET /api/addons
 * Returns available add-ons for the user's current plan
 */
export async function GET(req: NextRequest) {
  try {
    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization and plan
    const { data: user, error: userError } = await (supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single() as any);

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { data: org, error: orgError } = await (supabase
      .from('organizations')
      .select('subscription_plan')
      .eq('id', user.organization_id)
      .single() as any);

    if (orgError || !org) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    const plan = org.subscription_plan;

    // Get active add-ons
    const { data: activeAddons, error: addonsError } = await ((supabase as any)
      .rpc('get_active_addons', { org_id: user.organization_id }));

    if (addonsError) {
      console.error('Error fetching active add-ons:', addonsError);
    }

    // Build available add-ons based on plan
    const availableAddons: any = {
      clients: {
        ...addOns.clients[plan],
        active: activeAddons?.find((a: any) => a.addon_type === 'clients') || null,
      },
      teamMembers: {
        ...addOns.teamMembers[plan],
        active: activeAddons?.find((a: any) => a.addon_type === 'team_members') || null,
      },
      storage: {
        ...addOns.storage,
        active: activeAddons?.find((a: any) => a.addon_type === 'storage') || null,
      },
      emails: {
        ...addOns.emails,
        active: activeAddons?.find((a: any) => a.addon_type === 'emails') || null,
      },
      sms: {
        ...addOns.sms,
        active: activeAddons?.find((a: any) => a.addon_type === 'sms') || null,
      },
    };

    // Add plan-specific add-ons
    if (plan === 'pro' || plan === 'premium') {
      availableAddons.whatsapp = {
        ...addOns.whatsapp[plan],
        active: activeAddons?.find((a: any) => a.addon_type === 'whatsapp') || null,
      };
      availableAddons.video = {
        ...addOns.video[plan],
        active: activeAddons?.find((a: any) => a.addon_type === 'video') || null,
      };
      availableAddons.transcription = {
        packages: addOns.transcription,
        active: activeAddons?.find((a: any) => a.addon_type === 'transcription') || null,
      };
      availableAddons.aiSummaries = {
        ...addOns.aiSummaries,
        active: activeAddons?.find((a: any) => a.addon_type === 'ai_summaries') || null,
      };
    }

    return NextResponse.json({
      success: true,
      plan,
      addons: availableAddons,
      activeAddons: activeAddons || [],
    });
  } catch (error: any) {
    console.error('Error in GET /api/addons:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
