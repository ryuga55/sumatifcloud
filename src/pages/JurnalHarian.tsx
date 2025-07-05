import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, FileDown, Plus, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { Footer } from '@/components/Footer'
import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  date: z.date({
    required_error: "Tanggal wajib diisi",
  }),
  class_id: z.string().min(1, "Kelas wajib dipilih"),
  subject_id: z.string().min(1, "Mata pelajaran wajib dipilih"),
  material: z.string().min(1, "Materi wajib diisi"),
  method: z.string().min(1, "Metode wajib dipilih"),
  students_present: z.number().min(0, "Jumlah siswa hadir minimal 0"),
  teacher_notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface DailyJournal {
  id: string
  date: string
  class_id: string
  subject_id: string
  material: string
  method: string
  students_present: number
  teacher_notes: string | null
  classes: { name: string } | null
  subjects: { name: string } | null
}

interface ClassData {
  id: string
  name: string
}

interface SubjectData {
  id: string
  name: string
}

const methodOptions = [
  { value: "ceramah", label: "Ceramah" },
  { value: "diskusi", label: "Diskusi" },
  { value: "praktik", label: "Praktik" },
  { value: "presentasi", label: "Presentasi" },
  { value: "tanya_jawab", label: "Tanya Jawab" },
  { value: "demonstrasi", label: "Demonstrasi" },
  { value: "eksperimen", label: "Eksperimen" },
  { value: "game_edukasi", label: "Game Edukasi" },
]

export default function JurnalHarian() {
  const { user } = useAuth()
  const [journals, setJournals] = useState<DailyJournal[]>([])
  const [classes, setClasses] = useState<ClassData[]>([])
  const [subjects, setSubjects] = useState<SubjectData[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJournal, setEditingJournal] = useState<DailyJournal | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      class_id: "",
      subject_id: "",
      material: "",
      method: "",
      students_present: 0,
      teacher_notes: "",
    },
  })

  useEffect(() => {
    fetchJournals()
    fetchClasses()
    fetchSubjects()
  }, [user])

  const fetchJournals = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("daily_journals")
        .select(`
          *,
          classes(name),
          subjects(name)
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error
      setJournals((data as any) || [])
    } catch (error) {
      console.error("Error fetching journals:", error)
      toast.error("Gagal memuat data jurnal")
    }
  }

  const fetchClasses = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name")
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (error) throw error
      setClasses(data || [])
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const fetchSubjects = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("user_id", user.id)

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return

    setLoading(true)
    try {
      const journalData = {
        user_id: user.id,
        date: format(data.date, "yyyy-MM-dd"),
        class_id: data.class_id,
        subject_id: data.subject_id,
        material: data.material,
        method: data.method,
        students_present: data.students_present,
        teacher_notes: data.teacher_notes || null,
      }

      if (editingJournal) {
        const { error } = await supabase
          .from("daily_journals")
          .update(journalData)
          .eq("id", editingJournal.id)

        if (error) throw error
        toast.success("Jurnal berhasil diperbarui")
      } else {
        const { error } = await supabase
          .from("daily_journals")
          .insert([journalData])

        if (error) throw error
        toast.success("Jurnal berhasil disimpan")
      }

      form.reset()
      setIsDialogOpen(false)
      setEditingJournal(null)
      fetchJournals()
    } catch (error) {
      console.error("Error saving journal:", error)
      toast.error("Gagal menyimpan jurnal")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (journal: DailyJournal) => {
    setEditingJournal(journal)
    form.reset({
      date: new Date(journal.date),
      class_id: journal.class_id,
      subject_id: journal.subject_id,
      material: journal.material,
      method: journal.method,
      students_present: journal.students_present,
      teacher_notes: journal.teacher_notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jurnal ini?")) return

    try {
      const { error } = await supabase
        .from("daily_journals")
        .delete()
        .eq("id", id)

      if (error) throw error
      toast.success("Jurnal berhasil dihapus")
      fetchJournals()
    } catch (error) {
      console.error("Error deleting journal:", error)
      toast.error("Gagal menghapus jurnal")
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(18)
    doc.text("Jurnal Harian Guru", 14, 20)
    
    // Table data
    const tableData = journals.map(journal => [
      format(new Date(journal.date), "dd/MM/yyyy"),
      journal.classes?.name || '-',
      journal.subjects?.name || '-',
      journal.material,
      methodOptions.find(m => m.value === journal.method)?.label || journal.method,
      journal.students_present.toString(),
      journal.teacher_notes || "-"
    ])

    autoTable(doc, {
      head: [["Tanggal", "Kelas", "Mata Pelajaran", "Materi", "Metode", "Siswa Hadir", "Catatan"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    doc.save("jurnal-harian.pdf")
  }

  const openDialog = () => {
    setEditingJournal(null)
    form.reset()
    setIsDialogOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Jurnal Harian</h1>
          <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Jurnal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingJournal ? "Edit Jurnal Harian" : "Tambah Jurnal Harian"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Tanggal</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
                                  ) : (
                                    <span>Pilih tanggal</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="class_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kelas</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kelas" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {classes.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subject_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mata Pelajaran</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih mata pelajaran" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metode</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih metode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {methodOptions.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Materi</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masukkan materi yang diajarkan"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="students_present"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Siswa Hadir</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="teacher_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan Guru</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Catatan tambahan (opsional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Jurnal Harian</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Materi</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Siswa Hadir</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {journals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Belum ada data jurnal harian
                  </TableCell>
                </TableRow>
              ) : (
                journals.map((journal) => (
                  <TableRow key={journal.id}>
                    <TableCell>
                      {format(new Date(journal.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{journal.classes?.name || '-'}</TableCell>
                    <TableCell>{journal.subjects?.name || '-'}</TableCell>
                    <TableCell>{journal.material}</TableCell>
                    <TableCell>
                      {methodOptions.find(m => m.value === journal.method)?.label || journal.method}
                    </TableCell>
                    <TableCell>{journal.students_present}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(journal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(journal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
      <Footer />
    </div>
  )
}