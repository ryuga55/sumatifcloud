import { useState } from "react"
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  BarChart3, 
  Scale, 
  ClipboardList, 
  Calendar,
  FileText,
  CalendarCheck,
  Database,
  LogOut,
  Home,
  NotebookPen
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Kelas", url: "/kelas", icon: Users },
  { title: "Siswa", url: "/siswa", icon: GraduationCap },
  { title: "Mata Pelajaran", url: "/mata-pelajaran", icon: BookOpen },
  { title: "Kategori Penilaian", url: "/kategori-penilaian", icon: BarChart3 },
  { title: "Bobot Penilaian", url: "/bobot-penilaian", icon: Scale },
  { title: "Input Nilai", url: "/input-nilai", icon: ClipboardList },
  { title: "Input Kehadiran", url: "/input-kehadiran", icon: Calendar },
  { title: "Jurnal Harian", url: "/jurnal-harian", icon: NotebookPen },
  { title: "Rekap Nilai", url: "/rekap-nilai", icon: FileText },
  { title: "Rekap Kehadiran", url: "/rekap-kehadiran", icon: CalendarCheck },
  { title: "Data", url: "/data", icon: Database },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const collapsed = state === "collapsed"

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold">School SaaS</h2>
              <p className="text-sm text-muted-foreground">Dashboard Sekolah</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end
                      className={({ isActive }) =>
                        `flex items-center space-x-3 font-poppins font-medium transition-colors ${
                          isActive 
                            ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-3">
          {!collapsed && profile && (
            <div className="text-sm">
              <p className="font-medium">{profile.full_name}</p>
              <p className="text-muted-foreground capitalize">{profile.role}</p>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Keluar</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}