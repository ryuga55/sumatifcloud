import { useAuth } from '@/hooks/useAuth';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, UserCheck } from 'lucide-react';

export default function WaitingApproval() {
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Menunggu Persetujuan</CardTitle>
            <CardDescription>
              Akun Anda sedang menunggu persetujuan dari Admin
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-4">
              <UserCheck className="h-4 w-4" />
              <span>Nama: {profile?.full_name}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Admin akan meninjau dan menyetujui akun Anda dalam waktu 24 jam. 
              Anda akan menerima notifikasi email setelah akun disetujui.
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            Keluar
          </Button>
        </CardContent>
      </Card>
      <Footer />
    </div>
  );
}