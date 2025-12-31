'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import {
  Package,
  Plus,
  Users,
  Calendar,
  DollarSign,
  Target,
  CheckCircle2,
  Clock,
  TrendingUp,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  Star,
} from 'lucide-react';
import Link from 'next/link';

interface Program {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number | null;
  total_sessions: number | null;
  price: number | null;
  currency: string;
  is_active: boolean;
  max_participants: number | null;
  program_type: string | null;
  milestones: any | null;
  resources: any | null;
  created_at: string;
  _count?: {
    enrollments: number;
  };
}

export default function ProgramsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const init = async () => {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);

      if (currentUser?.organization_id) {
        // Fetch programs
        const { data: programsData, error } = await supabase
          .from('programs')
          .select('*')
          .eq('organization_id', currentUser.organization_id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (programsData) {
          // For each program, get enrollment count
          const programsWithCounts = await Promise.all(
            programsData.map(async (program) => {
              const { count } = await supabase
                .from('client_programs')
                .select('*', { count: 'exact', head: true })
                .eq('program_id', program.id)
                .eq('status', 'active');

              return {
                ...program,
                _count: {
                  enrollments: count || 0,
                },
              };
            })
          );

          setPrograms(programsWithCounts);
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && program.is_active) ||
      (filterActive === 'inactive' && !program.is_active);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalPrograms: programs.length,
    activePrograms: programs.filter((p) => p.is_active).length,
    totalEnrollments: programs.reduce((sum, p) => sum + (p._count?.enrollments || 0), 0),
    totalRevenue: programs.reduce((sum, p) => {
      const enrollments = p._count?.enrollments || 0;
      const price = p.price || 0;
      return sum + enrollments * price;
    }, 0),
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="spinner h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programs & Packages</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage coaching programs, courses, and session packages
          </p>
        </div>
        <Link href="/dashboard/programs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Program
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrograms}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePrograms} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Across all programs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From program sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Enrollment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activePrograms > 0
                ? Math.round(stats.totalEnrollments / stats.activePrograms)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per active program
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterActive === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterActive('all')}
              >
                All
              </Button>
              <Button
                variant={filterActive === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterActive('active')}
              >
                Active
              </Button>
              <Button
                variant={filterActive === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterActive('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No programs found</h3>
            <p className="mt-2 text-sm text-gray-600">
              {searchQuery
                ? 'Try adjusting your search filters'
                : 'Get started by creating your first coaching program'}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/programs/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Program
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrograms.map((program) => (
            <Card
              key={program.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                      {program.is_active ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                      )}
                    </div>
                    {program.program_type && (
                      <Badge variant="outline" className="text-xs">
                        {program.program_type}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {program.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{program.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {program.duration_weeks && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{program.duration_weeks} weeks</span>
                    </div>
                  )}
                  {program.total_sessions && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{program.total_sessions} sessions</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{program._count?.enrollments || 0} enrolled</span>
                  </div>
                  {program.max_participants && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>Max {program.max_participants}</span>
                    </div>
                  )}
                </div>

                {program.price && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(program.price)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Milestones Preview */}
                {program.milestones && Array.isArray(program.milestones) && program.milestones.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Milestones
                    </div>
                    <div className="space-y-1">
                      {program.milestones.slice(0, 3).map((milestone: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span className="truncate">{milestone.title || milestone.name}</span>
                        </div>
                      ))}
                      {program.milestones.length > 3 && (
                        <div className="text-xs text-gray-500 pl-5">
                          +{program.milestones.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-2">
                  <Link href={`/dashboard/programs/${program.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Program Templates CTA */}
      <Card className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 border-brand-primary-200">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-primary-100 mb-4">
              <Star className="h-6 w-6 text-brand-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Want to save time?
            </h3>
            <p className="text-sm text-gray-600 mb-4 max-w-2xl mx-auto">
              Choose from our library of pre-built program templates designed by expert coaches.
              Customize them to match your coaching style and launch in minutes.
            </p>
            <Button>Browse Templates</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
