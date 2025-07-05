import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const InputNilai = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [namaAssessment, setNamaAssessment] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [scores, setScores] = useState<{[key: string]: {[key: string]: number}}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedKelas && selectedMapel && selectedKategori) {
      fetchStudents();
      fetchExistingScores();
    }
  }, [selectedKelas, selectedMapel, selectedKategori]);

  const fetchData = async () => {
    try {
      const [classesData, subjectsData, categoriesData] = await Promise.all([
        supabase.from('classes').select('*').eq('is_active', true).order('name'),
        supabase.from('subjects').select('*').order('name'),
        supabase.from('categories').select('*').order('name')
      ]);

      if (classesData.error) throw classesData.error;
      if (subjectsData.error) throw subjectsData.error;
      if (categoriesData.error) throw categoriesData.error;

      setClasses(classesData.data || []);
      setSubjects(subjectsData.data || []);
      setCategories(categoriesData.data || []);
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

  const fetchStudents = async () => {
    if (!selectedKelas) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedKelas)
        .order('name', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchExistingScores = async () => {
    if (!selectedKelas || !selectedMapel || !selectedKategori) return;

    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('subject_id', selectedMapel)
        .eq('category_id', selectedKategori);

      if (error) throw error;

      // Group scores by student and assessment
      const scoresMap: {[key: string]: {[key: string]: number}} = {};
      data?.forEach(score => {
        if (!scoresMap[score.student_id]) {
          scoresMap[score.student_id] = {};
        }
        scoresMap[score.student_id][score.assessment_name] = score.score;
      });

      setScores(scoresMap);

      // Get unique assessment names
      const uniqueAssessments = [...new Set(data?.map(score => score.assessment_name) || [])];
      setAssessments(uniqueAssessments.map((name, index) => ({
        id: (index + 1).toString(),
        name: name,
        category: categories.find(c => c.id === selectedKategori)?.name || ''
      })));
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

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

  const updateScore = (studentId: string, assessmentName: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentName]: score
      }
    }));
  };

  const saveAllScores = async () => {
    if (!user || !selectedMapel || !selectedKategori) return;

    try {
      const scoresToSave = [];
      
      for (const student of students) {
        for (const assessment of assessments) {
          const score = scores[student.id]?.[assessment.name];
          if (score !== undefined && score !== null && !isNaN(score)) {
            scoresToSave.push({
              student_id: student.id,
              subject_id: selectedMapel,
              category_id: selectedKategori,
              assessment_name: assessment.name,
              score: score,
              user_id: user.id
            });
          }
        }
      }

      if (scoresToSave.length === 0) {
        toast({
          title: "Warning",
          description: "Tidak ada nilai untuk disimpan",
          variant: "destructive",
        });
        return;
      }

      // Use upsert to handle both insert and update
      const { error } = await supabase
        .from('scores')
        .upsert(scoresToSave, {
          onConflict: 'student_id,subject_id,category_id,assessment_name'
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Semua nilai berhasil disimpan",
      });
    } catch (error) {
      console.error('Error saving scores:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan nilai",
        variant: "destructive",
      });
    }
  };

  const deleteAssessment = (assessmentName: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;
    
    setAssessments(assessments.filter(a => a.name !== assessmentName));
    
    // Remove scores for this assessment
    const newScores = { ...scores };
    Object.keys(newScores).forEach(studentId => {
      delete newScores[studentId][assessmentName];
    });
    setScores(newScores);
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-1"
                          onClick={() => deleteAssessment(assessment.name)}
                        >
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
                  <Button onClick={saveAllScores}>
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
                                value={scores[student.id]?.[assessment.name] || ''}
                                onChange={(e) => updateScore(student.id, assessment.name, parseInt(e.target.value) || 0)}
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