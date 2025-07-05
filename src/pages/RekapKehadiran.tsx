import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CalendarCheck, Download, UserCheck, UserX, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const RekapKehadiran = () => {
  const { profile } = useAuth();
  const [selectedKelas, setSelectedKelas] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Mock data - replace with actual data from Supabase
  const classes = [
    { id: '1', name: 'X IPA 1' },
    { id: '2', name: 'X IPA 2' },
    { id: '3', name: 'XI IPA 1' },
  ];

  const [attendanceData, setAttendanceData] = useState([
    { 
      id: '1', 
      name: 'Ahmad Rizki', 
      nis: '2024001',
      hadir: 18,
      sakit: 1,
      izin: 0,
      alfa: 0,
      terlambat: 1,
      total: 20,
      percentage: 90
    },
    { 
      id: '2', 
      name: 'Siti Nurhaliza', 
      nis: '2024002',
      hadir: 20,
      sakit: 0,
      izin: 0,
      alfa: 0,
      terlambat: 0,
      total: 20,
      percentage: 100
    },
    { 
      id: '3', 
      name: 'Budi Santoso', 
      nis: '2024003',
      hadir: 17,
      sakit: 2,
      izin: 1,
      alfa: 0,
      terlambat: 0,
      total: 20,
      percentage: 85
    },
    { 
      id: '4', 
      name: 'Rina Dewi', 
      nis: '2024004',
      hadir: 19,
      sakit: 0,
      izin: 1,
      alfa: 0,
      terlambat: 0,
      total: 20,
      percentage: 95
    },
  ]);

  const showAttendanceTable = selectedKelas && startDate && endDate;

  const handleExportPDF = () => {
    // Logic to export to PDF
    console.log('Exporting attendance to PDF...');
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RekapKehadiran;