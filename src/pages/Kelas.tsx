import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Footer } from "@/components/Footer";
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Kelas = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [namaKelas, setNamaKelas] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClass, setEditingClass] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes",
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
        .from('classes')
        .insert([
          {
            name: namaKelas,
            is_active: isActive,
            user_id: user.id
          }
        ])
        .select();

      if (error) throw error;

      setClasses([...classes, data[0]]);
      setNamaKelas('');
      setIsActive(true);
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Class added successfully",
      });
    } catch (error) {
      console.error('Error adding class:', error);
      toast({
        title: "Error",
        description: "Failed to add class",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (kelas: any) => {
    setEditingClass(kelas);
    setNamaKelas(kelas.name);
    setIsActive(kelas.is_active);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .update({
          name: namaKelas,
          is_active: isActive
        })
        .eq('id', editingClass.id)
        .select();

      if (error) throw error;

      setClasses(classes.map(c => c.id === editingClass.id ? data[0] : c));
      setEditDialogOpen(false);
      setEditingClass(null);
      setNamaKelas('');
      setIsActive(true);
      
      toast({
        title: "Success",
        description: "Class updated successfully",
      });
    } catch (error) {
      console.error('Error updating class:', error);
      toast({
        title: "Error",
        description: "Failed to update class",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClasses(classes.filter(c => c.id !== id));
      
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "Error",
        description: "Failed to delete class",
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
                <h1 className="text-xl font-semibold tracking-tight">Manajemen Kelas</h1>
                <p className="text-sm text-muted-foreground">
                  Kelola data kelas sekolah
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Daftar Kelas</h2>
                <p className="text-muted-foreground">
                  Tambah dan kelola kelas di sekolah
                </p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kelas
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Kelas Baru</DialogTitle>
                    <DialogDescription>
                      Masukkan informasi kelas yang akan ditambahkan
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="nama">Nama Kelas</Label>
                        <Input
                          id="nama"
                          value={namaKelas}
                          onChange={(e) => setNamaKelas(e.target.value)}
                          placeholder="Contoh: X IPA 1"
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={isActive}
                          onCheckedChange={setIsActive}
                        />
                        <Label htmlFor="active">Kelas Aktif</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Simpan</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading classes...</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((kelas) => (
                  <Card key={kelas.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">
                        {kelas.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(kelas)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(kelas.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Status: {kelas.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {classes.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No classes found. Add your first class to get started.
                  </div>
                )}
              </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Kelas</DialogTitle>
                  <DialogDescription>
                    Update informasi kelas
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-nama">Nama Kelas</Label>
                      <Input
                        id="edit-nama"
                        value={namaKelas}
                        onChange={(e) => setNamaKelas(e.target.value)}
                        placeholder="Contoh: X IPA 1"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-active"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                      />
                      <Label htmlFor="edit-active">Kelas Aktif</Label>
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

export default Kelas;