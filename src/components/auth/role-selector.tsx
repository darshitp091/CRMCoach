'use client';

import { Crown, Shield, Target, UserCheck, HeadphonesIcon } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
  disabled?: boolean;
}

const roles = [
  {
    id: 'owner',
    name: 'Owner',
    icon: Crown,
    color: 'purple',
    description: 'Full control of workspace',
    permissions: ['All permissions', 'Billing access', 'Delete workspace'],
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: Shield,
    color: 'blue',
    description: 'Manage team & clients',
    permissions: ['Manage team', 'All clients', 'Settings'],
  },
  {
    id: 'manager',
    name: 'Manager',
    icon: Target,
    color: 'green',
    description: 'Coordinate operations',
    permissions: ['Manage clients', 'View team', 'Analytics'],
  },
  {
    id: 'coach',
    name: 'Coach',
    icon: UserCheck,
    color: 'orange',
    description: 'Work with clients',
    permissions: ['Assigned clients', 'Sessions', 'Basic features'],
  },
  {
    id: 'support',
    name: 'Support',
    icon: HeadphonesIcon,
    color: 'pink',
    description: 'Help customers',
    permissions: ['View clients', 'Read-only', 'Support tickets'],
  },
];

const colorClasses = {
  purple: {
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-700',
    hover: 'hover:border-purple-500',
    selected: 'ring-purple-500',
  },
  blue: {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-700',
    hover: 'hover:border-blue-500',
    selected: 'ring-blue-500',
  },
  green: {
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-700',
    hover: 'hover:border-green-500',
    selected: 'ring-green-500',
  },
  orange: {
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-700',
    hover: 'hover:border-orange-500',
    selected: 'ring-orange-500',
  },
  pink: {
    bg: 'bg-pink-100',
    border: 'border-pink-300',
    text: 'text-pink-700',
    hover: 'hover:border-pink-500',
    selected: 'ring-pink-500',
  },
};

export function RoleSelector({ selectedRole, onRoleChange, disabled = false }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        What's your role? (You can invite team members later)
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const colors = colorClasses[role.color as keyof typeof colorClasses];
          const isSelected = selectedRole === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => !disabled && onRoleChange(role.id)}
              disabled={disabled}
              className={`
                relative p-4 border-2 rounded-lg text-left transition-all
                ${isSelected ? `${colors.border} ring-4 ${colors.selected} ring-opacity-20` : `border-gray-200 ${colors.hover}`}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg} flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{role.name}</h4>
                    {isSelected && (
                      <div className={`h-2 w-2 rounded-full ${colors.bg} ${colors.text}`} />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{role.description}</p>
                  <div className="space-y-1">
                    {role.permissions.slice(0, 2).map((perm, idx) => (
                      <p key={idx} className="text-xs text-gray-500">
                        • {perm}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Don't worry - you can change this later and invite team members with different roles
      </p>
    </div>
  );
}
