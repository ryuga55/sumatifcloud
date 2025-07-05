import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Footer } from "@/components/Footer";
import { Users, GraduationCap, BookOpen, BarChart3, UserCheck, Target, Star, Shield, Clock, CheckCircle, School } from 'lucide-react';
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
        // Show landing page for non-authenticated users
        return;
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

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <School className="h-8 w-8 text-primary" />
                <div className="font-bold text-xl text-primary">SUMATIF CLOUD</div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Masuk
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Daftar
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">
                <span className="text-primary">SUMATIF CLOUD</span>
                <br />
                Sistem Manajemen Sekolah Modern
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Terhubung. Tersimpan. Tertata. Kelola seluruh kebutuhan administrasi sekolah Anda dengan mudah dan efisien.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8 py-3" onClick={() => navigate('/auth')}>
                  Mulai Sekarang
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Fitur Unggulan
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Solusi lengkap untuk mengelola semua aspek administrasi sekolah dalam satu platform terpadu
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Manajemen Siswa</CardTitle>
                  <CardDescription>
                    Kelola data siswa, kelas, dan informasi akademik dengan sistem yang terorganisir
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Penilaian & Rapor</CardTitle>
                  <CardDescription>
                    Input nilai, bobot penilaian, dan generate rapor siswa secara otomatis
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Absensi Digital</CardTitle>
                  <CardDescription>
                    Catat kehadiran siswa secara digital dengan laporan yang akurat dan real-time
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Jurnal Harian</CardTitle>
                  <CardDescription>
                    Dokumentasi kegiatan pembelajaran harian dengan materi dan metode yang digunakan
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Keamanan Data</CardTitle>
                  <CardDescription>
                    Data sekolah tersimpan aman dengan sistem backup otomatis dan enkripsi tingkat tinggi
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Akses 24/7</CardTitle>
                  <CardDescription>
                    Akses sistem kapan saja dan dimana saja dengan teknologi cloud yang handal
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-primary/5 rounded-2xl p-8 sm:p-12">
              <Star className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Siap Transformasi Digital Sekolah Anda?
              </h2>
              <p className="text-muted-foreground mb-8">
                Bergabunglah dengan sekolah-sekolah yang telah merasakan kemudahan mengelola administrasi dengan SUMATIF CLOUD
              </p>
              <Button size="lg" className="px-8 py-3" onClick={() => navigate('/auth')}>
                Mulai Gratis Sekarang
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  if (!profile) {
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
