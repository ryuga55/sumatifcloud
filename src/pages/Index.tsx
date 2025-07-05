import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap, LogOut } from 'lucide-react';

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

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
      } else if (profile.role === 'user' && profile.is_approved && !profile.is_verified) {
        navigate('/license');
      }
      // If user is approved and verified, stay on dashboard
    }
  }, [user, profile, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">School SaaS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {profile.role === 'admin' ? 'Admin' : 'User'}: {profile.full_name}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Selamat Datang, {profile.full_name}!
          </h2>
          <p className="mt-2 text-gray-600">
            {profile.role === 'admin' 
              ? 'Dashboard Administrator - Kelola sistem dan lisensi' 
              : 'Dashboard Sekolah - Kelola data siswa dan nilai'
            }
          </p>
        </div>

        {profile.role === 'admin' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>License Management</CardTitle>
                <CardDescription>Kelola license key untuk sekolah</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Kelola License
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Kelola pengguna sistem</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Kelola User
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Kelas</CardTitle>
                <CardDescription>Jumlah kelas yang dikelola</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Siswa</CardTitle>
                <CardDescription>Jumlah siswa terdaftar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Mata Pelajaran</CardTitle>
                <CardDescription>Jumlah mata pelajaran</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Kategori Nilai</CardTitle>
                <CardDescription>Kategori penilaian</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Aksi cepat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm">
                  Input Nilai
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  Input Kehadiran
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
