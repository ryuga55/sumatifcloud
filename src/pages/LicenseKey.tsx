import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Key } from 'lucide-react';

export default function LicenseKey() {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if license key exists and is not used
      const { data: keyData, error: keyError } = await supabase
        .from('license_keys')
        .select('*')
        .eq('key', licenseKey)
        .eq('is_used', false)
        .single();

      if (keyError || !keyData) {
        toast({
          title: "Key Tidak Valid",
          description: "License key tidak ditemukan atau sudah digunakan",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Update license key status
      const { error: updateKeyError } = await supabase
        .from('license_keys')
        .update({
          is_used: true,
          assigned_user_id: user?.id,
          used_at: new Date().toISOString()
        })
        .eq('id', keyData.id);

      if (updateKeyError) {
        toast({
          title: "Error",
          description: "Gagal mengaktifkan license key",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Update user profile
      const { error: profileError } = await updateProfile({
        license_key: licenseKey,
        is_verified: true
      });

      if (profileError) {
        toast({
          title: "Error",
          description: "Gagal memperbarui profil",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Berhasil",
        description: "License key berhasil diaktifkan!"
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memvalidasi license key",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center">
            <Key className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Aktivasi License</CardTitle>
            <CardDescription>
              Masukkan license key untuk mengaktifkan akun Anda
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="licenseKey">License Key</Label>
              <Input
                id="licenseKey"
                name="licenseKey"
                type="text"
                placeholder="Masukkan 6 karakter license key"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                maxLength={6}
                required
                className="text-center font-mono text-lg tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || licenseKey.length !== 6}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aktivasi
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}