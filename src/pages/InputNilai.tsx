import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Plus, ClipboardList, Save, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const InputNilai = () => {
  const { profile } = useAuth();
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [namaAssessment, setNamaAssessment] = useState('');

  // Mock data - replace with actual data from Supabase
  const classes = [
    { id: '1', name: 'X IPA 1' },
    { id: '2', name: 'X IPA 2' },
    { id: '3', name: 'XI IPA 1' },
  ];

  const subjects = [
    { id: '1', name: 'Matematika' },
    { id: '2', name: 'Fisika' },
    { id: '3', name: 'Kimia' },
  ];

  const categories = [
    { id: '1', name: 'Tugas Harian' },
    { id: '2', name: 'Ulangan Harian' },
    { id: '3', name: 'Ujian Tengah Semester' },
  ];

  const [assessments, setAssessments] = useState([
    { id: '1', name: 'UH1 - Aljabar', category: 'Ulangan Harian' },
    { id: '2', name: 'Tugas Kelompok', category: 'Tugas Harian' },
  ]);

  const [students, setStudents] = useState([
    { id: '1', name: 'Ahmad Rizki', nis: '2024001', scores: { '1': 85, '2': 90 } },
    { id: '2', name: 'Siti Nurhaliza', nis: '2024002', scores: { '1': 78, '2': 85 } },
    { id: '3', name: 'Budi Santoso', nis: '2024003', scores: { '1': 92, '2': 88 } },
  ]);

  const handleAddAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCategory = categories.find(c => c.id === selectedKategori);
    const newAssessment = {
      id: Date.now().toString(),
      name: namaAssessment,
      category: selectedCategory?.name || ''
    };
    setAssessments([...assessments, newAssessment]);
    setNamaAssessment('');
    setIsDialogOpen(false);
  };

  const updateScore = (studentId: string, assessmentId: string, score: number) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, scores: { ...student.scores, [assessmentId]: score } }
        : student
    ));
  };

  const showStudentTable = selectedKelas && selectedMapel && selectedKategori;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <h1 className="text-xl font-semibold tracking-tight">Input Nilai</h1>
                <p className="text-sm text-muted-foreground">
                  Input nilai siswa berdasarkan mata pelajaran dan kategori
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Input Nilai Siswa</h2>
              <p className="text-muted-foreground">
                Pilih kelas, mata pelajaran, dan kategori untuk mulai input nilai
              </p>
            </div>

            {/* Filter Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Pilih Filter</CardTitle>
                <CardDescription>
                  Pilih kelas, mata pelajaran, dan kategori penilaian
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="kelas">Kelas</Label>
                    <Select value={selectedKelas} onValueChange={setSelectedKelas}>
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
                  <div className="grid gap-2">
                    <Label htmlFor="mapel">Mata Pelajaran</Label>
                    <Select value={selectedMapel} onValueChange={setSelectedMapel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mata pelajaran" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kategori">Kategori Penilaian</Label>
                    <Select value={selectedKategori} onValueChange={setSelectedKategori}>
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
                </div>
              </CardContent>
            </Card>

            {/* Assessment Management */}
            {showStudentTable && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Jenis Penilaian</CardTitle>
                    <CardDescription>
                      Kelola jenis penilaian untuk kategori yang dipilih
                    </CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Jenis Penilaian
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Jenis Penilaian</DialogTitle>
                        <DialogDescription>
                          Masukkan nama jenis penilaian baru
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddAssessment}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="nama">Nama Jenis Penilaian</Label>
                            <Input
                              id="nama"
                              value={namaAssessment}
                              onChange={(e) => setNamaAssessment(e.target.value)}
                              placeholder="Contoh: UH1, UTS, Tugas Kelompok"
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
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {assessments.map((assessment) => (
                      <div key={assessment.id} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md">
                        <span className="text-sm">{assessment.name}</span>
                        <Button variant="ghost" size="sm" className="h-auto p-1">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Student Scores Table */}
            {showStudentTable && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Input Nilai Siswa</CardTitle>
                    <CardDescription>
                      Masukkan nilai untuk setiap siswa dan jenis penilaian
                    </CardDescription>
                  </div>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Semua
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIS</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        {assessments.map((assessment) => (
                          <TableHead key={assessment.id} className="text-center">
                            {assessment.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.nis}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          {assessments.map((assessment) => (
                            <TableCell key={assessment.id} className="text-center">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={student.scores[assessment.id] || ''}
                                onChange={(e) => updateScore(student.id, assessment.id, parseInt(e.target.value) || 0)}
                                className="w-16 text-center"
                                placeholder="0"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default InputNilai;