import { useAuth } from '@/hooks/useAuth';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, UserCheck } from 'lucide-react';
import { WhatsAppContact } from '@/components/WhatsAppContact';
import { useNavigate } from 'react-router-dom';

export default function WaitingApproval() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center space-y-4 px-4 sm:px-6">
            <div className="mx-auto h-12 w-12 bg-warning rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">Menunggu Persetujuan</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Akun Anda sedang menunggu persetujuan dari Admin
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-4">
                <UserCheck className="h-4 w-4 flex-shrink-0" />
                <span className="break-all">Nama: {profile?.full_name}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Admin akan meninjau dan menyetujui akun Anda dalam waktu 24 jam. 
                Anda akan menerima notifikasi email setelah akun disetujui.
              </p>
            </div>
            <div className="space-y-3">
              <WhatsAppContact className="w-full" />
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                Keluar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}