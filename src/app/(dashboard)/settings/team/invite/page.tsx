'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Shield,
  Target,
  UserCheck,
  HeadphonesIcon,
  Sparkles,
  DollarSign,
  Mail,
  ArrowLeft,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { hasPermission, PERMISSIONS, ROLE_LABELS, ROLE_DESCRIPTIONS, type UserRole } from '@/lib/auth/permissions';

const roleOptions: { value: UserRole; label: string; description: string; icon: any; color: string }[] = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Trusted partner with near-full access',
    icon: Shield,
    color: 'from-blue-600 to-cyan-600',
  },
  {
    value: 'manager',
    label: 'Manager',
    description: 'Team oversight and coordination',
    icon: Target,
    color: 'from-green-600 to-emerald-600',
  },
  {
    value: 'coach',
    label: 'Coach',
    description: 'Individual practitioner access',
    icon: UserCheck,
    color: 'from-orange-600 to-red-600',
  },
  {
    value: 'support',
    label: 'Support',
    description: 'Administrative helper role',
    icon: HeadphonesIcon,
    color: 'from-pink-600 to-rose-600',
  },
];

export default function InviteTeamMemberPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('coach');
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isBiller, setIsBiller] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [canInvite, setCanInvite] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const canManage = await hasPermission(session.user.id, PERMISSIONS.ADD_TEAM_MEMBERS);
    setCanInvite(canManage);

    if (!canManage) {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get current user
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        throw new Error('Not authenticated');
      }

      // Get current user's organization
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', session.user.id)
        .single();

      if (userError || !currentUser) {
        throw new Error('User not found');
      }

      // Generate invite token
      const inviteToken = crypto.randomUUID();

      // Create invitation
      const { error: inviteError } = await supabase
        .from('team_invitations')
        .insert({
          organization_id: currentUser.organization_id,
          email: email.toLowerCase(),
          role: selectedRole,
          is_supervisor: isSupervisor,
          is_biller: isBiller,
          invite_token: inviteToken,
          invited_by: session.user.id,
          status: 'pending',
        });

      if (inviteError) {
        throw new Error(inviteError.message);
      }

      // TODO: Send invitation email
      // For now, we'll just show success

      setSuccess(true);
      setTimeout(() => {
        router.push('/settings/team');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!canInvite) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invitation Sent!</h2>
          <p className="text-gray-600 mb-4">
            We've sent an invitation to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to team management...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/settings/team')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Team
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invite Team Member</h1>
        <p className="text-gray-600">
          Add a new member to your coaching team
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email Input */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
          <div>
            <Label htmlFor="email" className="text-base mb-2 block">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-lg py-6"
            />
            <p className="text-sm text-gray-600 mt-2">
              They'll receive an invitation email to join your team
            </p>
          </div>
        </Card>

        {/* Role Selection */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Select Role</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.value;

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-brand-primary-500 bg-brand-primary-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${role.color} flex-shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{role.label}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-6 w-6 text-brand-primary-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Modifier Roles */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Additional Permissions (Optional)</h2>
          <p className="text-gray-600 mb-4">
            Add special permissions that stack with the main role
          </p>

          <div className="space-y-4">
            {/* Supervisor */}
            <label className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-yellow-300 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={isSupervisor}
                onChange={(e) => setIsSupervisor(e.target.checked)}
                className="mt-1 h-5 w-5 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-bold text-gray-900">Supervisor</h3>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    FREE
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Can oversee other coaches' work (required for licensed supervisors)
                </p>
              </div>
            </label>

            {/* Biller */}
            <label className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-teal-300 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={isBiller}
                onChange={(e) => setIsBiller(e.target.checked)}
                className="mt-1 h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold text-gray-900">Biller</h3>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    FREE
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Can handle invoicing and payment processing
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/settings/team')}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={loading || !email} className="gap-2">
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send Invitation
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Preview */}
      <Card className="p-6 mt-8 bg-gray-50 border-2 border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Invitation Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-semibold">{email || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Role:</span>
            <span className="font-semibold">{ROLE_LABELS[selectedRole]}</span>
          </div>
          {isSupervisor && (
            <div className="flex justify-between">
              <span className="text-gray-600">Supervisor:</span>
              <Badge className="bg-yellow-100 text-yellow-700">Yes</Badge>
            </div>
          )}
          {isBiller && (
            <div className="flex justify-between">
              <span className="text-gray-600">Biller:</span>
              <Badge className="bg-teal-100 text-teal-700">Yes</Badge>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
