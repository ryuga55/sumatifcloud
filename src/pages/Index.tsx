import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Footer } from "@/components/Footer";
import { Users, GraduationCap, BookOpen, BarChart3, UserCheck, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalClasses: 0,
    activeClasses: 0,
    totalStudents: 0,
    totalSubjects: 0,
    totalCategories: 0
  });

  const dashboardCards = [
    {
      title: "Total Kelas",
      description: "Semua kelas yang dikelola",
      value: dashboardData.totalClasses.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Kelas Aktif", 
      description: "Kelas yang sedang aktif",
      value: dashboardData.activeClasses.toString(),
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Total Siswa",
      description: "Semua siswa terdaftar",
      value: dashboardData.totalStudents.toString(), 
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Siswa Terdaftar",
      description: "Siswa yang telah terdaftar",
      value: dashboardData.totalStudents.toString(),
      icon: UserCheck,
      color: "text-orange-600", 
      bgColor: "bg-orange-50"
    },
    {
      title: "Total Mata Pelajaran",
      description: "Mata pelajaran tersedia",
      value: dashboardData.totalSubjects.toString(),
      icon: BookOpen,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Total Kategori Nilai",
      description: "Kategori penilaian yang ada",
      value: dashboardData.totalCategories.toString(),
      icon: BarChart3,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!profile) {
        // Profile not loaded yet, wait
        return;
      } else if (profile.role === 'admin') {
        navigate('/admin');
      } else if (profile.role === 'user' && !profile.is_approved) {
        navigate('/waiting-approval');
      } else {
        // If user is approved, fetch dashboard data
        fetchDashboardData();
      }
    }
  }, [user, profile, loading, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [classesRes, studentsRes, subjectsRes, categoriesRes] = await Promise.all([
        supabase.from('classes').select('id, is_active', { count: 'exact' }),
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('subjects').select('id', { count: 'exact' }),
        supabase.from('categories').select('id', { count: 'exact' })
      ]);

      const activeClasses = classesRes.data?.filter(c => c.is_active).length || 0;

      setDashboardData({
        totalClasses: classesRes.count || 0,
        activeClasses,
        totalStudents: studentsRes.count || 0,
        totalSubjects: subjectsRes.count || 0,
        totalCategories: categoriesRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // Redirect admin users to admin dashboard
  if (profile.role === 'admin') {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Selamat datang, {profile.full_name}
                </p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 space-y-6 p-6">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Selamat Datang, {profile.full_name}!
              </h2>
              <p className="text-muted-foreground">
                Dashboard Sekolah - Kelola data siswa dan nilai dengan mudah
              </p>
            </div>

            {/* Dashboard Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboardCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {card.title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${card.bgColor}`}>
                        <IconComponent className={`h-4 w-4 ${card.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {card.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Aksi Cepat</CardTitle>
                  <CardDescription>
                    Akses fitur yang sering digunakan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">
                    <Button className="w-full justify-start" size="sm">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Input Nilai
                    </Button>
                    <Button className="w-full justify-start" size="sm" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Input Kehadiran
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Laporan</CardTitle>
                  <CardDescription>
                    Generate laporan dan rekap data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">
                    <Button className="w-full justify-start" size="sm" variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Rekap Nilai
                    </Button>
                    <Button className="w-full justify-start" size="sm" variant="outline">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Rekap Kehadiran
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
