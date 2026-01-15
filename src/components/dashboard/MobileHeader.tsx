import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { MobileNav } from './MobileNav';

export const MobileHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
      <MobileNav />
      
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Calendar className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">AgendAI</span>
      </Link>
      
      {/* Spacer to center logo */}
      <div className="w-10" />
    </header>
  );
};
