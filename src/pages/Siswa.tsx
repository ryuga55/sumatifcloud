import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Plus, GraduationCap, Edit, Trash2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const Siswa = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nis, setNis] = useState('');
  const [kelasId, setKelasId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch students with class information
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          classes(name)
        `)
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;

      // Fetch classes for dropdown
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (classesError) throw classesError;

      setStudents(studentsData || []);
      setClasses(classesData || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            name: namaLengkap,
            nis: nis,
            class_id: kelasId,
            user_id: user.id
          }
        ])
        .select(`
          *,
          classes(name)
        `);

      if (error) throw error;

      setStudents([...students, data[0]]);
      setNamaLengkap('');
      setNis('');
      setKelasId('');
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Student added successfully",
      });
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setNamaLengkap(student.name);
    setNis(student.nis);
    setKelasId(student.class_id);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          name: namaLengkap,
          nis: nis,
          class_id: kelasId
        })
        .eq('id', editingStudent.id)
        .select(`
          *,
          classes(name)
        `);

      if (error) throw error;

      setStudents(students.map(s => s.id === editingStudent.id ? data[0] : s));
      setEditDialogOpen(false);
      setEditingStudent(null);
      setNamaLengkap('');
      setNis('');
      setKelasId('');
      
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStudents(students.filter(s => s.id !== id));
      
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    // Create sample data with headers
    const templateData = [
      ['Nama Lengkap', 'NIS', 'Kelas'],
      ['Contoh: Ahmad Budi', '12345', 'Kelas 1A'],
      ['Contoh: Siti Aminah', '12346', 'Kelas 1B']
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Nama Lengkap
      { wch: 15 }, // NIS
      { wch: 15 }  // Kelas
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
    XLSX.writeFile(wb, 'template_siswa.xlsx');

    toast({
      title: "Success",
      description: "Template Excel berhasil diunduh",
    });
  };

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Check if file has data
      if (jsonData.length < 2) {
        toast({
          title: "Error",
          description: "File Excel kosong atau tidak memiliki data siswa",
          variant: "destructive",
        });
        return;
      }

      // Skip header row and process data
      const rows = jsonData.slice(1) as any[][];
      const studentsToImport = [];
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 because we start from row 2 (after header)
        
        // Skip empty rows
        if (!row || row.length === 0 || !row.some(cell => cell)) continue;

        const [name, nis, className] = row;

        // Validate required fields
        if (!name || !nis || !className) {
          errors.push(`Baris ${rowNumber}: Data tidak lengkap (nama, nis, atau kelas kosong)`);
          continue;
        }

        // Check for duplicate NIS in the import data
        const isDuplicateInImport = studentsToImport.some(s => s.nis === nis.toString());
        if (isDuplicateInImport) {
          errors.push(`Baris ${rowNumber}: NIS ${nis} duplikat dalam file Excel`);
          continue;
        }

        // Check for existing NIS in database
        const existingStudent = students.find(s => s.nis === nis.toString());
        if (existingStudent) {
          errors.push(`Baris ${rowNumber}: NIS ${nis} sudah terdaftar (${existingStudent.name})`);
          continue;
        }

        // Find class by name (case insensitive and trim whitespace)
        const matchingClass = classes.find(c => 
          c.name.toLowerCase().trim() === className.toString().toLowerCase().trim()
        );
        
        if (!matchingClass) {
          const availableClasses = classes.map(c => c.name).join(', ');
          errors.push(`Baris ${rowNumber}: Kelas "${className}" tidak ditemukan. Kelas tersedia: ${availableClasses}`);
          continue;
        }

        studentsToImport.push({
          name: name.toString().trim(),
          nis: nis.toString().trim(),
          class_id: matchingClass.id,
          user_id: user.id
        });
      }

      // Show errors if any
      if (errors.length > 0) {
        toast({
          title: "Peringatan Import",
          description: `${errors.length} baris bermasalah. ${studentsToImport.length} siswa akan diimport.`,
          variant: "destructive",
        });
        console.warn('Import errors:', errors);
      }

      if (studentsToImport.length === 0) {
        toast({
          title: "Error",
          description: "Tidak ada data siswa yang valid untuk diimport",
          variant: "destructive",
        });
        return;
      }

      // Insert students in batch
      const { data: insertedData, error } = await supabase
        .from('students')
        .insert(studentsToImport)
        .select(`
          *,
          classes(name)
        `);

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Error",
          description: error.message.includes('duplicate') 
            ? "Beberapa NIS sudah terdaftar dalam sistem"
            : "Gagal menyimpan data siswa",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setStudents(prev => [...prev, ...insertedData].sort((a, b) => a.name.localeCompare(b.name)));
      
      toast({
        title: "Success",
        description: `${insertedData.length} siswa berhasil diimport${errors.length > 0 ? ` (${errors.length} baris diabaikan)` : ''}`,
      });

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Error importing Excel:', error);
      toast({
        title: "Error",
        description: "Gagal membaca file Excel. Pastikan format file benar.",
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
                <h1 className="text-xl font-semibold tracking-tight">Manajemen Siswa</h1>
                <p className="text-sm text-muted-foreground">
                  Kelola data siswa sekolah
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Daftar Siswa</h2>
                <p className="text-muted-foreground">
                  Tambah dan kelola data siswa di sekolah
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadTemplate}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('excel-input')?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Excel
                </Button>
                <input
                  id="excel-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelImport}
                  className="hidden"
                />
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Siswa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Siswa Baru</DialogTitle>
                      <DialogDescription>
                        Masukkan informasi siswa yang akan ditambahkan
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="nama">Nama Lengkap</Label>
                          <Input
                            id="nama"
                            value={namaLengkap}
                            onChange={(e) => setNamaLengkap(e.target.value)}
                            placeholder="Masukkan nama lengkap"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="nis">NIS</Label>
                          <Input
                            id="nis"
                            value={nis}
                            onChange={(e) => setNis(e.target.value)}
                            placeholder="Nomor Induk Siswa"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="kelas">Kelas</Label>
                          <Select value={kelasId} onValueChange={setKelasId} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kelas" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((kelas) => (
                                <SelectItem key={kelas.id} value={kelas.id}>
                                  {kelas.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Simpan</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Data Siswa</CardTitle>
                <CardDescription>
                  Daftar semua siswa yang terdaftar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading students...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>NIS</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.nis}</TableCell>
                          <TableCell>{student.classes?.name || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(student)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(student.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {students.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No students found. Add your first student to get started.
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
                  <DialogTitle>Edit Siswa</DialogTitle>
                  <DialogDescription>
                    Update informasi siswa
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-nama">Nama Lengkap</Label>
                      <Input
                        id="edit-nama"
                        value={namaLengkap}
                        onChange={(e) => setNamaLengkap(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-nis">NIS</Label>
                      <Input
                        id="edit-nis"
                        value={nis}
                        onChange={(e) => setNis(e.target.value)}
                        placeholder="Nomor Induk Siswa"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-kelas">Kelas</Label>
                      <Select value={kelasId} onValueChange={setKelasId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((kelas) => (
                            <SelectItem key={kelas.id} value={kelas.id}>
                              {kelas.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Update</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Siswa;