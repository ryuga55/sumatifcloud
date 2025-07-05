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
import { CalendarCheck, Download, UserCheck, UserX, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RekapKehadiran = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedKelas, setSelectedKelas] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classes, setClasses] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedKelas && startDate && endDate) {
      fetchAttendanceData();
    }
  }, [selectedKelas, startDate, endDate]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data kelas",
        variant: "destructive",
      });
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedKelas)
        .order('name', { ascending: true });

      if (studentsError) throw studentsError;

      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .in('student_id', studentsData.map(s => s.id));

      if (attendanceError) throw attendanceError;

      const attendanceSummary = studentsData.map(student => {
        const studentAttendance = attendanceRecords.filter(a => a.student_id === student.id);
        
        const hadir = studentAttendance.filter(a => a.status === 'hadir').length;
        const sakit = studentAttendance.filter(a => a.status === 'sakit').length;
        const izin = studentAttendance.filter(a => a.status === 'izin').length;
        const alfa = studentAttendance.filter(a => a.status === 'alfa').length;
        const terlambat = studentAttendance.filter(a => a.status === 'terlambat').length;
        
        const total = studentAttendance.length;
        const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;

        return {
          id: student.id,
          name: student.name,
          nis: student.nis,
          hadir,
          sakit,
          izin,
          alfa,
          terlambat,
          total,
          percentage
        };
      });

      setAttendanceData(attendanceSummary);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data kehadiran",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const showAttendanceTable = selectedKelas && startDate && endDate;

  const handleExportPDF = () => {
    if (attendanceData.length === 0) return;
    
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <h2>Rekap Kehadiran Siswa</h2>
      <p>Periode: ${startDate} - ${endDate}</p>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>NIS</th>
            <th>Nama Siswa</th>
            <th>Hadir</th>
            <th>Sakit</th>
            <th>Izin</th>
            <th>Alfa</th>
            <th>Terlambat</th>
            <th>Persentase</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${attendanceData.map(student => {
            const category = getAttendanceCategory(student.percentage);
            return `
              <tr>
                <td>${student.nis}</td>
                <td>${student.name}</td>
                <td>${student.hadir}</td>
                <td>${student.sakit}</td>
                <td>${student.izin}</td>
                <td>${student.alfa}</td>
                <td>${student.terlambat}</td>
                <td>${student.percentage}%</td>
                <td>${category.label}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    
    const newWindow = window.open('', '_blank');
    newWindow.document.write(printContent.innerHTML);
    newWindow.print();
  };

  const calculateClassStats = () => {
    if (attendanceData.length === 0) return {
      totalStudents: 0,
      averageAttendance: 0,
      totalDays: 0
    };

    const totalStudents = attendanceData.length;
    const averageAttendance = attendanceData.reduce((sum, student) => sum + student.percentage, 0) / totalStudents;
    const totalDays = attendanceData[0]?.total || 0;

    return {
      totalStudents,
      averageAttendance: averageAttendance.toFixed(1),
      totalDays
    };
  };

  const getAttendanceCategory = (percentage: number) => {
    if (percentage >= 95) return { label: 'Sangat Baik', color: 'text-green-600' };
    if (percentage >= 85) return { label: 'Baik', color: 'text-blue-600' };
    if (percentage >= 75) return { label: 'Cukup', color: 'text-yellow-600' };
    return { label: 'Kurang', color: 'text-red-600' };
  };

  const stats = calculateClassStats();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <h1 className="text-xl font-semibold tracking-tight">Rekap Kehadiran</h1>
                <p className="text-sm text-muted-foreground">
                  Lihat rekap kehadiran siswa dan export laporan
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Rekap Kehadiran Siswa</h2>
              <p className="text-muted-foreground">
                Pilih kelas dan periode untuk melihat rekap kehadiran
              </p>
            </div>

            {/* Filter Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Pilih Kelas dan Periode</CardTitle>
                <CardDescription>
                  Pilih kelas dan rentang tanggal untuk melihat rekap kehadiran
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
                    <Label htmlFor="start-date">Tanggal Mulai</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end-date">Tanggal Akhir</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            {showAttendanceTable && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Total Siswa</p>
                        <p className="text-2xl font-bold">{stats.totalStudents}</p>
                      </div>
                      <UserCheck className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Total Hari</p>
                        <p className="text-2xl font-bold">{stats.totalDays}</p>
                      </div>
                      <CalendarCheck className="h-6 w-6 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Rata-rata Kehadiran</p>
                        <p className="text-2xl font-bold">{stats.averageAttendance}%</p>
                      </div>
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Kehadiran Tertinggi</p>
                        <p className="text-2xl font-bold">
                          {Math.max(...attendanceData.map(s => s.percentage))}%
                        </p>
                      </div>
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Attendance Table */}
            {showAttendanceTable && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Rekap Kehadiran Siswa</CardTitle>
                    <CardDescription>
                      Detail kehadiran untuk setiap siswa dalam periode yang dipilih
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleExportPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIS</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <UserCheck className="h-4 w-4 text-green-600" />
                            Hadir
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <UserX className="h-4 w-4 text-blue-600" />
                            Sakit
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <UserX className="h-4 w-4 text-yellow-600" />
                            Izin
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <UserX className="h-4 w-4 text-red-600" />
                            Alfa
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4 text-orange-600" />
                            Terlambat
                          </div>
                        </TableHead>
                        <TableHead className="text-center">Persentase</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceData.map((student) => {
                        const category = getAttendanceCategory(student.percentage);
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.nis}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="text-center text-green-600 font-semibold">
                              {student.hadir}
                            </TableCell>
                            <TableCell className="text-center text-blue-600">
                              {student.sakit}
                            </TableCell>
                            <TableCell className="text-center text-yellow-600">
                              {student.izin}
                            </TableCell>
                            <TableCell className="text-center text-red-600">
                              {student.alfa}
                            </TableCell>
                            <TableCell className="text-center text-orange-600">
                              {student.terlambat}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {student.percentage}%
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${category.color}`}>
                                {category.label}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RekapKehadiran;