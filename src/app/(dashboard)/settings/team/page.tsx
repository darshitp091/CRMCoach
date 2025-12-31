'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Crown,
  Shield,
  Target,
  UserCheck,
  HeadphonesIcon,
  Mail,
  MoreVertical,
  Trash2,
  Edit,
  UserPlus,
  Sparkles,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { hasPermission, PERMISSIONS, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS, type UserRole } from '@/lib/auth/permissions';
import { usePlanLimits } from '@/hooks/use-plan-limits';
import { LimitWarning } from '@/components/upgrade/upgrade-prompt';

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_supervisor: boolean;
  is_biller: boolean;
  assigned_clients_count: number;
  role_assigned_at: string;
  created_at: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: UserRole;
  is_supervisor: boolean;
  is_biller: boolean;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invited_at: string;
  expires_at: string;
}

const roleIcons: Record<UserRole, any> = {
  owner: Crown,
  admin: Shield,
  manager: Target,
  coach: UserCheck,
  support: HeadphonesIcon,
};

export default function TeamManagementPage() {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [canManageTeam, setCanManageTeam] = useState(false);
  const { canAddTeamMember, usage, features, plan } = usePlanLimits();

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        router.push('/login');
        return;
      }

      const userId = session.user.id;
      setCurrentUserId(userId);

      // Get current user's info
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('role, organization_id')
        .eq('id', userId)
        .single();

      if (userError || !currentUser) {
        console.error('Error fetching user:', userError);
        return;
      }

      setCurrentUserRole(currentUser.role as UserRole);

      // Check if user can manage team
      const canManage = await hasPermission(userId, PERMISSIONS.ADD_TEAM_MEMBERS);
      setCanManageTeam(canManage);

      // If not authorized, redirect
      if (!canManage) {
        router.push('/dashboard');
        return;
      }

      // Load team members
      const { data: members, error: membersError } = await supabase
        .from('team_members_view')
        .select('*')
        .eq('organization_id', currentUser.organization_id)
        .order('created_at', { ascending: true });

      if (!membersError && members) {
        setTeamMembers(members as TeamMember[]);
      }

      // Load pending invitations
      const { data: invites, error: invitesError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('organization_id', currentUser.organization_id)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false });

      if (!invitesError && invites) {
        setInvitations(invites as TeamInvitation[]);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteClick = () => {
    router.push('/settings/team/invite');
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', memberId);

      if (error) {
        alert('Error removing team member: ' + error.message);
        return;
      }

      // Reload data
      loadTeamData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) {
        alert('Error cancelling invitation: ' + error.message);
        return;
      }

      // Reload data
      loadTeamData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const getRoleBadgeColor = (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
      owner: 'bg-purple-100 text-purple-700 border-purple-200',
      admin: 'bg-blue-100 text-blue-700 border-blue-200',
      manager: 'bg-green-100 text-green-700 border-green-200',
      coach: 'bg-orange-100 text-orange-700 border-orange-200',
      support: 'bg-pink-100 text-pink-700 border-pink-200',
    };
    return colors[role];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team...</p>
        </div>
      </div>
    );
  }

  if (!canManageTeam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to manage team members.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const teamMemberLimitCheck = canAddTeamMember();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
        <p className="text-gray-600">
          Manage your team members and their roles
        </p>
      </div>

      {/* Team Member Limit Warning */}
      {features.maxTeamMembers !== -1 && (
        <LimitWarning
          current={usage.teamMembers}
          limit={features.maxTeamMembers}
          resource="Team Members"
          suggestedPlan={plan === 'standard' ? 'Pro' : 'Premium'}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">{teamMembers.length}</p>
            </div>
            <Users className="h-10 w-10 text-brand-primary-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coaches</p>
              <p className="text-3xl font-bold text-orange-600">
                {teamMembers.filter((m) => m.role === 'coach').length}
              </p>
            </div>
            <UserCheck className="h-10 w-10 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-3xl font-bold text-blue-600">
                {teamMembers.filter((m) => m.role === 'admin').length}
              </p>
            </div>
            <Shield className="h-10 w-10 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Invites</p>
              <p className="text-3xl font-bold text-purple-600">{invitations.length}</p>
            </div>
            <Mail className="h-10 w-10 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Invite Button */}
      <div className="mb-6">
        {teamMemberLimitCheck.allowed ? (
          <Button onClick={handleInviteClick} size="lg" className="gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </Button>
        ) : (
          <Button disabled size="lg" className="gap-2" title="Team member limit reached">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </Button>
        )}
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Pending Invitations</h2>
          <div className="space-y-4">
            {invitations.map((invitation) => {
              const RoleIcon = roleIcons[invitation.role];
              return (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${getRoleBadgeColor(invitation.role)}`}>
                      <RoleIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{invitation.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleBadgeColor(invitation.role)}>
                          {ROLE_LABELS[invitation.role]}
                        </Badge>
                        {invitation.is_supervisor && (
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Supervisor
                          </Badge>
                        )}
                        {invitation.is_biller && (
                          <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Biller
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Invited {new Date(invitation.invited_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelInvitation(invitation.id)}
                  >
                    Cancel
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Team Members List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Team Members</h2>
        <div className="space-y-4">
          {teamMembers.map((member) => {
            const RoleIcon = roleIcons[member.role];
            const isCurrentUser = member.id === currentUserId;
            const canRemove = member.role !== 'owner' && !isCurrentUser;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-brand-primary-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${getRoleBadgeColor(member.role)}`}>
                    <RoleIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{member.full_name || member.email}</p>
                      {isCurrentUser && (
                        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {ROLE_LABELS[member.role]}
                      </Badge>
                      {member.is_supervisor && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Supervisor
                        </Badge>
                      )}
                      {member.is_biller && (
                        <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Biller
                        </Badge>
                      )}
                    </div>
                    {member.role === 'coach' && (
                      <p className="text-sm text-gray-600 mt-1">
                        {member.assigned_clients_count} assigned client
                        {member.assigned_clients_count !== 1 ? 's' : ''}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {canRemove && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Help Text */}
      <Card className="p-6 mt-8 bg-blue-50 border-2 border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">💡 Role Information</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
            <div key={role}>
              <span className="font-semibold">{ROLE_LABELS[role as UserRole]}:</span> {description}
            </div>
          ))}
        </div>
        <p className="text-sm text-blue-800 mt-4">
          <strong>Modifier Roles:</strong> Supervisor and Biller are special permissions that can be added to any role.
        </p>
      </Card>
    </div>
  );
}
