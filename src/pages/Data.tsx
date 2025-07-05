import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Database, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Data = () => {
  const { profile } = useAuth();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleBackup = async () => {
    setIsBackingUp(true);
    setBackupStatus('idle');
    
    try {
      // Mock backup process - replace with actual backup logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock backup data
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          classes: [
            { id: '1', name: 'X IPA 1', is_active: true },
            { id: '2', name: 'X IPA 2', is_active: true },
          ],
          students: [
            { id: '1', name: 'Ahmad Rizki', nis: '2024001', class_id: '1' },
            { id: '2', name: 'Siti Nurhaliza', nis: '2024002', class_id: '1' },
          ],
          subjects: [
            { id: '1', name: 'Matematika' },
            { id: '2', name: 'Fisika' },
          ],
          categories: [
            { id: '1', name: 'Tugas Harian', description: 'Penilaian tugas harian' },
            { id: '2', name: 'Ulangan Harian', description: 'Penilaian ulangan harian' },
          ],
          weights: [
            { id: '1', category_id: '1', weight_percent: 25 },
            { id: '2', category_id: '2', weight_percent: 35 },
          ]
        }
      };

      // Download the backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupStatus('success');
    } catch (error) {
      console.error('Backup failed:', error);
      setBackupStatus('error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreStatus('idle');

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      
      // Validate backup data structure
      if (!backupData.data || !backupData.timestamp) {
        throw new Error('Invalid backup file format');
      }

      // Mock restore process - replace with actual restore logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Restoring data:', backupData);
      setRestoreStatus('success');
    } catch (error) {
      console.error('Restore failed:', error);
      setRestoreStatus('error');
    } finally {
      setIsRestoring(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <h1 className="text-xl font-semibold tracking-tight">Manajemen Data</h1>
                <p className="text-sm text-muted-foreground">
                  Backup dan restore data aplikasi
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Manajemen Data</h2>
              <p className="text-muted-foreground">
                Backup dan restore semua data aplikasi untuk keamanan data
              </p>
            </div>

            {/* Backup Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Backup Data
                </CardTitle>
                <CardDescription>
                  Download semua data aplikasi dalam format JSON sebagai cadangan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <p className="text-sm text-muted-foreground">
                    File backup akan berisi semua data termasuk:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>Data kelas dan siswa</li>
                    <li>Mata pelajaran dan kategori penilaian</li>
                    <li>Bobot penilaian</li>
                    <li>Data nilai dan kehadiran</li>
                    <li>Pengaturan aplikasi</li>
                  </ul>
                </div>

                {backupStatus === 'success' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Backup berhasil dibuat dan diunduh!
                    </AlertDescription>
                  </Alert>
                )}

                {backupStatus === 'error' && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Gagal membuat backup. Silakan coba lagi.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleBackup} 
                  disabled={isBackingUp}
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isBackingUp ? 'Membuat Backup...' : 'Buat Backup'}
                </Button>
              </CardContent>
            </Card>

            {/* Restore Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Restore Data
                </CardTitle>
                <CardDescription>
                  Upload file backup JSON untuk mengembalikan data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Peringatan:</strong> Proses restore akan mengganti semua data yang ada. 
                    Pastikan Anda telah membuat backup terlebih dahulu.
                  </AlertDescription>
                </Alert>

                {restoreStatus === 'success' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Data berhasil dipulihkan dari file backup!
                    </AlertDescription>
                  </Alert>
                )}

                {restoreStatus === 'error' && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Gagal memulihkan data. Pastikan file backup valid dan coba lagi.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="backup-file">Pilih File Backup</Label>
                  <Input
                    id="backup-file"
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    disabled={isRestoring}
                  />
                  <p className="text-sm text-muted-foreground">
                    Pilih file backup dengan format JSON yang telah dibuat sebelumnya
                  </p>
                </div>

                {isRestoring && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Memproses file backup...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Statistik Data
                </CardTitle>
                <CardDescription>
                  Ringkasan data yang tersimpan dalam aplikasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-2xl font-bold">3</span>
                    <span className="text-sm text-muted-foreground">Total Kelas</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-2xl font-bold">45</span>
                    <span className="text-sm text-muted-foreground">Total Siswa</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-2xl font-bold">6</span>
                    <span className="text-sm text-muted-foreground">Mata Pelajaran</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-2xl font-bold">5</span>
                    <span className="text-sm text-muted-foreground">Kategori Penilaian</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Data;