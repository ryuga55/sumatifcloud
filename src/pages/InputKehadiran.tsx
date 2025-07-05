import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Calendar, Save, UserCheck, UserX, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const InputKehadiran = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedKelas && selectedDate) {
      fetchStudentsAndAttendance();
    }
  }, [selectedKelas, selectedDate]);

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

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedKelas)
        .order('name', { ascending: true });

      if (studentsError) throw studentsError;

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', selectedDate)
        .in('student_id', studentsData.map(s => s.id));

      if (attendanceError) throw attendanceError;

      const studentsWithAttendance = studentsData.map(student => {
        const attendance = attendanceData.find(a => a.student_id === student.id);
        return {
          ...student,
          status: attendance?.status || 'hadir'
        };
      });

      setStudents(studentsWithAttendance);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data siswa dan kehadiran",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const attendanceOptions = [
    { value: 'hadir', label: 'Hadir', icon: UserCheck, color: 'text-green-600' },
    { value: 'sakit', label: 'Sakit', icon: UserX, color: 'text-blue-600' },
    { value: 'izin', label: 'Izin', icon: UserX, color: 'text-yellow-600' },
    { value: 'alfa', label: 'Alfa', icon: UserX, color: 'text-red-600' },
    { value: 'terlambat', label: 'Terlambat', icon: Clock, color: 'text-orange-600' },
  ];

  const updateAttendance = (studentId: string, status: string) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, status }
        : student
    ));
  };

  const showAttendanceTable = selectedKelas && selectedDate;

  const getStatusOption = (status: string) => {
    return attendanceOptions.find(option => option.value === status);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const attendanceRecords = students.map(student => ({
        student_id: student.id,
        date: selectedDate,
        status: student.status,
        user_id: user?.id
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, {
          onConflict: 'student_id,date'
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data kehadiran berhasil disimpan",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan data kehadiran",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
                <h1 className="text-xl font-semibold tracking-tight">Input Kehadiran</h1>
                <p className="text-sm text-muted-foreground">
                  Input kehadiran siswa berdasarkan kelas dan tanggal
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Input Kehadiran Siswa</h2>
              <p className="text-muted-foreground">
                Pilih kelas dan tanggal untuk mulai input kehadiran
              </p>
            </div>

            {/* Filter Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Pilih Kelas dan Tanggal</CardTitle>
                <CardDescription>
                  Pilih kelas dan tanggal untuk input kehadiran
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
                    <Label htmlFor="tanggal">Tanggal</Label>
                    <Input
                      id="tanggal"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            {showAttendanceTable && (
              <div className="grid gap-4 md:grid-cols-5">
                {attendanceOptions.map((option) => {
                  const count = students.filter(s => s.status === option.value).length;
                  const IconComponent = option.icon;
                  return (
                    <Card key={option.value}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{option.label}</p>
                            <p className="text-2xl font-bold">{count}</p>
                          </div>
                          <IconComponent className={`h-6 w-6 ${option.color}`} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Attendance Table */}
            {showAttendanceTable && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Daftar Kehadiran Siswa</CardTitle>
                    <CardDescription>
                      Pilih status kehadiran untuk setiap siswa
                    </CardDescription>
                  </div>
                  <Button onClick={handleSaveAll}>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Kehadiran
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIS</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead>Status Kehadiran</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const statusOption = getStatusOption(student.status);
                        const StatusIcon = statusOption?.icon || UserCheck;
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.nis}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>
                              <Select 
                                value={student.status} 
                                onValueChange={(value) => updateAttendance(student.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <div className="flex items-center gap-2">
                                    <StatusIcon className={`h-4 w-4 ${statusOption?.color || ''}`} />
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  {attendanceOptions.map((option) => {
                                    const IconComponent = option.icon;
                                    return (
                                      <SelectItem key={option.value} value={option.value}>
                                        <div className="flex items-center gap-2">
                                          <IconComponent className={`h-4 w-4 ${option.color}`} />
                                          {option.label}
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
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

export default InputKehadiran;