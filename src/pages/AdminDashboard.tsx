import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Users, Crown, LogOut } from 'lucide-react';

interface PendingUser {
  id: string;
  user_id: string;
  full_name: string | null;
  created_at: string;
  is_approved: boolean;
}

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, created_at, is_approved')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Gagal memuat data pengguna",
          variant: "destructive"
        });
      } else {
        setPendingUsers(data || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('user_id', userId);

      if (error) {
        toast({
          title: "Error",
          description: "Gagal menyetujui pengguna",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Berhasil",
          description: "Pengguna berhasil disetujui"
        });
        fetchPendingUsers(); // Refresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyetujui pengguna",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const pendingCount = pendingUsers.filter(user => !user.is_approved).length;
  const approvedCount = pendingUsers.filter(user => user.is_approved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Selamat datang, {profile?.full_name}
            </span>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengguna Menunggu</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengguna Disetujui</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingUsers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Pengguna</CardTitle>
            <CardDescription>
              Daftar semua pengguna yang terdaftar dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Memuat data...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Belum ada pengguna yang terdaftar
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{user.full_name || 'Nama tidak tersedia'}</p>
                          <p className="text-sm text-muted-foreground">
                            Terdaftar: {new Date(user.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <Badge variant={user.is_approved ? "default" : "secondary"}>
                          {user.is_approved ? "Disetujui" : "Menunggu"}
                        </Badge>
                      </div>
                    </div>
                    {!user.is_approved && (
                      <Button
                        onClick={() => approveUser(user.user_id)}
                        size="sm"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Setujui
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}