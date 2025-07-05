import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Plus, Scale, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BobotPenilaian = () => {
  const { profile } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [kategoriId, setKategoriId] = useState('');
  const [bobot, setBobot] = useState('');

  // Mock data - replace with actual data from Supabase
  const [weights, setWeights] = useState([
    { id: '1', category_id: '1', category_name: 'Tugas Harian', weight_percent: 25 },
    { id: '2', category_id: '2', category_name: 'Ulangan Harian', weight_percent: 35 },
    { id: '3', category_id: '3', category_name: 'Ujian Tengah Semester', weight_percent: 20 },
    { id: '4', category_id: '4', category_name: 'Ujian Akhir Semester', weight_percent: 20 },
  ]);

  const categories = [
    { id: '1', name: 'Tugas Harian' },
    { id: '2', name: 'Ulangan Harian' },
    { id: '3', name: 'Ujian Tengah Semester' },
    { id: '4', name: 'Ujian Akhir Semester' },
    { id: '5', name: 'Praktikum' },
  ];

  const totalBobot = weights.reduce((sum, weight) => sum + weight.weight_percent, 0);
  const isValidTotal = totalBobot === 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCategory = categories.find(c => c.id === kategoriId);
    const newWeight = {
      id: Date.now().toString(),
      category_id: kategoriId,
      category_name: selectedCategory?.name || '',
      weight_percent: parseInt(bobot)
    };
    setWeights([...weights, newWeight]);
    setKategoriId('');
    setBobot('');
    setIsDialogOpen(false);
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
                <h1 className="text-xl font-semibold tracking-tight">Bobot Penilaian</h1>
                <p className="text-sm text-muted-foreground">
                  Kelola bobot penilaian sekolah
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Pengaturan Bobot Penilaian</h2>
                <p className="text-muted-foreground">
                  Atur bobot untuk setiap kategori penilaian (Total harus 100%)
                </p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Bobot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Bobot Penilaian</DialogTitle>
                    <DialogDescription>
                      Masukkan bobot untuk kategori penilaian
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="kategori">Kategori Penilaian</Label>
                        <Select value={kategoriId} onValueChange={setKategoriId} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bobot">Bobot (%)</Label>
                        <Input
                          id="bobot"
                          type="number"
                          value={bobot}
                          onChange={(e) => setBobot(e.target.value)}
                          placeholder="Contoh: 25"
                          min="1"
                          max="100"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Simpan</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Status Total Bobot */}
            <Alert className={isValidTotal ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
              <div className="flex items-center gap-2">
                {isValidTotal ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                )}
                <AlertDescription className={isValidTotal ? "text-green-800" : "text-orange-800"}>
                  Total bobot saat ini: {totalBobot}% 
                  {isValidTotal ? " - Pengaturan valid" : " - Total harus 100%"}
                </AlertDescription>
              </div>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Data Bobot Penilaian</CardTitle>
                <CardDescription>
                  Daftar bobot untuk setiap kategori penilaian
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori Penilaian</TableHead>
                      <TableHead>Bobot (%)</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weights.map((weight) => (
                      <TableRow key={weight.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                            {weight.category_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{weight.weight_percent}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-semibold bg-muted/50">
                      <TableCell>Total</TableCell>
                      <TableCell>
                        <span className={isValidTotal ? "text-green-600" : "text-orange-600"}>
                          {totalBobot}%
                        </span>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BobotPenilaian;