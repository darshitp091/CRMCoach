'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/auth.service';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Zap,
  BarChart3,
  MessageSquare,
  FileText,
  UserCircle,
  Crown,
  Shield,
  Target,
  UserCheck,
  HeadphonesIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { hasPermission, PERMISSIONS, type UserRole, ROLE_LABELS } from '@/lib/auth/permissions';
import { toast } from 'sonner';
import { TrialBanner } from '@/components/subscription/trial-banner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const init = async () => {
      const currentUser = await AuthService.getCurrentUser();

      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      // Check all permissions
      if (currentUser.id) {
        const perms: Record<string, boolean> = {};
        const permissionsToCheck = [
          'VIEW_BILLING',
          'VIEW_ALL_CLIENTS',
          'MANAGE_TEAM',
          'VIEW_ANALYTICS',
          'MANAGE_SETTINGS',
        ];

        for (const perm of permissionsToCheck) {
          perms[perm] = await hasPermission(currentUser.id, PERMISSIONS[perm as keyof typeof PERMISSIONS]);
        }

        setPermissions(perms);
      }

      setLoading(false);
    };

    init();
  }, [router]);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="spinner h-12 w-12" />
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Clients', href: '/dashboard/clients', icon: Users, show: true },
    { name: 'Sessions', href: '/dashboard/sessions', icon: Calendar, show: true },
    { name: 'Payments', href: '/dashboard/payments', icon: DollarSign, show: permissions.VIEW_BILLING },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, show: permissions.VIEW_ANALYTICS },
    { name: 'Automations', href: '/dashboard/automations', icon: Zap, show: permissions.MANAGE_SETTINGS },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, show: true },
    { name: 'Team', href: '/dashboard/team', icon: Shield, show: permissions.MANAGE_TEAM },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, show: true },
  ];

  const getRoleIcon = (role: string) => {
    const icons: Record<string, any> = {
      owner: Crown,
      admin: Shield,
      manager: Target,
      coach: UserCheck,
      support: HeadphonesIcon,
    };
    return icons[role] || UserCheck;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      manager: 'bg-green-100 text-green-700',
      coach: 'bg-orange-100 text-orange-700',
      support: 'bg-pink-100 text-pink-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const RoleIcon = user?.role ? getRoleIcon(user.role) : UserCheck;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary-500">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FlowCoach</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {navigation.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-primary-50 text-brand-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-100 text-brand-primary-700 font-semibold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            {user?.role && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium mb-3 ${getRoleColor(user.role)}`}>
                <RoleIcon className="h-3.5 w-3.5" />
                {ROLE_LABELS[user.role as UserRole]}
              </div>
            )}

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients, sessions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <Link href="/dashboard/profile">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary-100 text-brand-primary-700 font-semibold hover:bg-brand-primary-200">
                {user?.full_name?.charAt(0) || 'U'}
              </button>
            </Link>
          </div>
        </header>

        {/* Trial Banner */}
        <TrialBanner />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
