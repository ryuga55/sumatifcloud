import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const RekapNilai = () => {
  const { profile } = useAuth();
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');

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

  const [studentGrades, setStudentGrades] = useState([
    { 
      id: '1', 
      name: 'Ahmad Rizki', 
      nis: '2024001',
      tugas: 85,
      ulangan: 78,
      uts: 82,
      uas: 88,
      final: 83.2
    },
    { 
      id: '2', 
      name: 'Siti Nurhaliza', 
      nis: '2024002',
      tugas: 90,
      ulangan: 85,
      uts: 87,
      uas: 92,
      final: 88.5
    },
    { 
      id: '3', 
      name: 'Budi Santoso', 
      nis: '2024003',
      tugas: 75,
      ulangan: 80,
      uts: 78,
      uas: 85,
      final: 79.8
    },
    { 
      id: '4', 
      name: 'Rina Dewi', 
      nis: '2024004',
      tugas: 88,
      ulangan: 82,
      uts: 85,
      uas: 90,
      final: 86.2
    },
  ]);

  const showGradesTable = selectedKelas && selectedMapel;

  const handleExportExcel = () => {
    // Logic to export to Excel
    console.log('Exporting to Excel...');
  };

  const handleExportPDF = () => {
    // Logic to export to PDF
    console.log('Exporting to PDF...');
  };

  const calculateClassAverage = () => {
    if (studentGrades.length === 0) return 0;
    const total = studentGrades.reduce((sum, student) => sum + student.final, 0);
    return (total / studentGrades.length).toFixed(1);
  };

  const getGradeCategory = (score: number) => {
    if (score >= 90) return { label: 'A', color: 'text-green-600' };
    if (score >= 80) return { label: 'B', color: 'text-blue-600' };
    if (score >= 70) return { label: 'C', color: 'text-yellow-600' };
    if (score >= 60) return { label: 'D', color: 'text-orange-600' };
    return { label: 'E', color: 'text-red-600' };
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
                <h1 className="text-xl font-semibold tracking-tight">Rekap Nilai</h1>
                <p className="text-sm text-muted-foreground">
                  Lihat rekap nilai siswa dan export laporan
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Rekap Nilai Siswa</h2>
              <p className="text-muted-foreground">
                Pilih kelas dan mata pelajaran untuk melihat rekap nilai
              </p>
            </div>

            {/* Filter Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Pilih Kelas dan Mata Pelajaran</CardTitle>
                <CardDescription>
                  Pilih kelas dan mata pelajaran untuk melihat rekap nilai
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
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
                </div>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            {showGradesTable && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Total Siswa</p>
                        <p className="text-2xl font-bold">{studentGrades.length}</p>
                      </div>
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Rata-rata Kelas</p>
                        <p className="text-2xl font-bold">{calculateClassAverage()}</p>
                      </div>
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Nilai Tertinggi</p>
                        <p className="text-2xl font-bold">
                          {Math.max(...studentGrades.map(s => s.final)).toFixed(1)}
                        </p>
                      </div>
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Nilai Terendah</p>
                        <p className="text-2xl font-bold">
                          {Math.min(...studentGrades.map(s => s.final)).toFixed(1)}
                        </p>
                      </div>
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Grades Table */}
            {showGradesTable && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Rekap Nilai Siswa</CardTitle>
                    <CardDescription>
                      Detail nilai untuk setiap kategori penilaian
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportExcel}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export Excel
                    </Button>
                    <Button variant="outline" onClick={handleExportPDF}>
                      <Download className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIS</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead className="text-center">Tugas (25%)</TableHead>
                        <TableHead className="text-center">Ulangan (35%)</TableHead>
                        <TableHead className="text-center">UTS (20%)</TableHead>
                        <TableHead className="text-center">UAS (20%)</TableHead>
                        <TableHead className="text-center">Nilai Akhir</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentGrades.map((student) => {
                        const grade = getGradeCategory(student.final);
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.nis}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="text-center">{student.tugas}</TableCell>
                            <TableCell className="text-center">{student.ulangan}</TableCell>
                            <TableCell className="text-center">{student.uts}</TableCell>
                            <TableCell className="text-center">{student.uas}</TableCell>
                            <TableCell className="text-center font-semibold">
                              {student.final}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${grade.color}`}>
                                {grade.label}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="font-semibold bg-muted/50">
                        <TableCell colSpan={6} className="text-right">Rata-rata Kelas:</TableCell>
                        <TableCell className="text-center">{calculateClassAverage()}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
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

export default RekapNilai;