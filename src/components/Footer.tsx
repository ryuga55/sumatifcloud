import { Copyright, Coffee } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-center py-4 px-6 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Copyright className="h-4 w-4" />
          <span>{currentYear}</span>
          <span>Created with</span>
          <Coffee className="h-4 w-4" />
          <span>by</span>
          <span className="font-bold">Rudy Susanto</span>
        </div>
      </div>
    </footer>
  );
}