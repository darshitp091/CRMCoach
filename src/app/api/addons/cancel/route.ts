import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * POST /api/addons/cancel
 * Cancel an active add-on subscription
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { addonId } = body;

    if (!addonId) {
      return NextResponse.json(
        { success: false, message: 'Add-on ID is required' },
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

    // Verify add-on belongs to user's organization
    const { data: addon, error: addonError } = await supabase
      .from('organization_addons')
      .select('*')
      .eq('id', addonId)
      .eq('organization_id', user.organization_id)
      .single();

    if (addonError || !addon) {
      return NextResponse.json(
        { success: false, message: 'Add-on not found' },
        { status: 404 }
      );
    }

    if (addon.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Add-on is not active' },
        { status: 400 }
      );
    }

    // Cancel add-on using database function
    const { data: cancelled, error: cancelError } = await supabase.rpc('cancel_addon', {
      addon_id_param: addonId,
    });

    if (cancelError || !cancelled) {
      console.error('Error cancelling add-on:', cancelError);
      return NextResponse.json(
        { success: false, message: 'Failed to cancel add-on' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Add-on cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error in POST /api/addons/cancel:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to cancel add-on' },
      { status: 500 }
    );
  }
}
