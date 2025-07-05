import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle } from 'lucide-react';

interface WhatsAppContactProps {
  className?: string;
}

export function WhatsAppContact({ className }: WhatsAppContactProps) {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    instansi: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleWhatsAppContact = () => {
    const message = `Halo Admin SUMATIF CLOUD,

Saya ingin menghubungi Admin terkait akun saya:

Nama: ${formData.nama}
Email: ${formData.email}${formData.instansi ? `\nInstansi: ${formData.instansi}` : ''}

Mohon bantuan untuk persetujuan akun saya.

Terima kasih.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/6282127618761?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const isFormValid = formData.nama && formData.email;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Hubungi Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hubungi Admin via WhatsApp</DialogTitle>
          <DialogDescription>
            Silakan isi data di bawah untuk menghubungi admin
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama *</Label>
            <Input
              id="nama"
              name="nama"
              type="text"
              placeholder="Masukkan nama lengkap"
              value={formData.nama}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contoh@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instansi">Instansi (Opsional)</Label>
            <Input
              id="instansi"
              name="instansi"
              type="text"
              placeholder="Nama instansi/sekolah"
              value={formData.instansi}
              onChange={handleInputChange}
            />
          </div>
          <Button 
            onClick={handleWhatsAppContact} 
            className="w-full" 
            disabled={!isFormValid}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Kirim Pesan WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}