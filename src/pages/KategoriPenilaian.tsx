import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Footer } from "@/components/Footer";
import { Plus, BarChart3, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const KategoriPenilaian = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [namaKategori, setNamaKategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name: namaKategori,
            description: deskripsi,
            user_id: user.id
          }
        ])
        .select();

      if (error) throw error;

      setCategories([...categories, data[0]]);
      setNamaKategori('');
      setDeskripsi('');
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setNamaKategori(category.name);
    setDeskripsi(category.description || '');
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: namaKategori,
          description: deskripsi
        })
        .eq('id', editingCategory.id)
        .select();

      if (error) throw error;

      setCategories(categories.map(c => c.id === editingCategory.id ? data[0] : c));
      setEditDialogOpen(false);
      setEditingCategory(null);
      setNamaKategori('');
      setDeskripsi('');
      
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== id));
      
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
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
                <h1 className="text-xl font-semibold tracking-tight">Kategori Penilaian</h1>
                <p className="text-sm text-muted-foreground">
                  Kelola kategori penilaian sekolah
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Daftar Kategori Penilaian</h2>
                <p className="text-muted-foreground">
                  Tambah dan kelola kategori penilaian di sekolah
                </p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kategori
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Kategori Penilaian Baru</DialogTitle>
                    <DialogDescription>
                      Masukkan informasi kategori penilaian yang akan ditambahkan
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="nama">Nama Kategori</Label>
                        <Input
                          id="nama"
                          value={namaKategori}
                          onChange={(e) => setNamaKategori(e.target.value)}
                          placeholder="Contoh: Tugas Harian"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="deskripsi">Deskripsi</Label>
                        <Textarea
                          id="deskripsi"
                          value={deskripsi}
                          onChange={(e) => setDeskripsi(e.target.value)}
                          placeholder="Deskripsi kategori penilaian"
                          rows={3}
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

            <Card>
              <CardHeader>
                <CardTitle>Data Kategori Penilaian</CardTitle>
                <CardDescription>
                  Daftar semua kategori penilaian yang tersedia
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading categories...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Kategori</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-muted-foreground" />
                              {category.name}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="text-sm text-muted-foreground truncate">
                              {category.description}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {categories.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            No categories found. Add your first category to get started.
                          </TableCell>
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
                  <DialogTitle>Edit Kategori Penilaian</DialogTitle>
                  <DialogDescription>
                    Update informasi kategori penilaian
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-nama">Nama Kategori</Label>
                      <Input
                        id="edit-nama"
                        value={namaKategori}
                        onChange={(e) => setNamaKategori(e.target.value)}
                        placeholder="Contoh: Tugas Harian"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-deskripsi">Deskripsi</Label>
                      <Textarea
                        id="edit-deskripsi"
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        placeholder="Deskripsi kategori penilaian"
                        rows={3}
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

export default KategoriPenilaian;