import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Footer } from "@/components/Footer";
import { Plus, Scale, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BobotPenilaian = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [kategoriId, setKategoriId] = useState('');
  const [bobot, setBobot] = useState('');
  const [weights, setWeights] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWeight, setEditingWeight] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch weights with category information
      const { data: weightsData, error: weightsError } = await supabase
        .from('weights')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false });

      if (weightsError) throw weightsError;

      // Fetch categories for dropdown
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      setWeights(weightsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalBobot = weights.reduce((sum, weight) => sum + weight.weight_percent, 0);
  const isValidTotal = totalBobot === 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('weights')
        .insert([
          {
            category_id: kategoriId,
            weight_percent: parseInt(bobot),
            user_id: user.id
          }
        ])
        .select(`
          *,
          categories(name)
        `);

      if (error) throw error;

      setWeights([...weights, data[0]]);
      setKategoriId('');
      setBobot('');
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Weight added successfully",
      });
    } catch (error) {
      console.error('Error adding weight:', error);
      toast({
        title: "Error",
        description: "Failed to add weight",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (weight: any) => {
    setEditingWeight(weight);
    setKategoriId(weight.category_id);
    setBobot(weight.weight_percent.toString());
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeight) return;

    try {
      const { data, error } = await supabase
        .from('weights')
        .update({
          category_id: kategoriId,
          weight_percent: parseInt(bobot)
        })
        .eq('id', editingWeight.id)
        .select(`
          *,
          categories(name)
        `);

      if (error) throw error;

      setWeights(weights.map(w => w.id === editingWeight.id ? data[0] : w));
      setEditDialogOpen(false);
      setEditingWeight(null);
      setKategoriId('');
      setBobot('');
      
      toast({
        title: "Success",
        description: "Weight updated successfully",
      });
    } catch (error) {
      console.error('Error updating weight:', error);
      toast({
        title: "Error",
        description: "Failed to update weight",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this weight?')) return;

    try {
      const { error } = await supabase
        .from('weights')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWeights(weights.filter(w => w.id !== id));
      
      toast({
        title: "Success",
        description: "Weight deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting weight:', error);
      toast({
        title: "Error",
        description: "Failed to delete weight",
        variant: "destructive",
      });
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
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading weights...</p>
                  </div>
                ) : (
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
                              {weight.categories?.name || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{weight.weight_percent}%</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(weight)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(weight.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {weights.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            No weights found. Add your first weight to get started.
                          </TableCell>
                        </TableRow>
                      )}
                      {weights.length > 0 && (
                        <TableRow className="font-semibold bg-muted/50">
                          <TableCell>Total</TableCell>
                          <TableCell>
                            <span className={isValidTotal ? "text-green-600" : "text-orange-600"}>
                              {totalBobot}%
                            </span>
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Bobot Penilaian</DialogTitle>
                  <DialogDescription>
                    Update bobot untuk kategori penilaian
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-kategori">Kategori Penilaian</Label>
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
                      <Label htmlFor="edit-bobot">Bobot (%)</Label>
                      <Input
                        id="edit-bobot"
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
                    <Button type="submit">Update</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BobotPenilaian;