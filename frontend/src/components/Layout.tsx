import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Moon, Sun, LogOut, User as UserIcon, LayoutDashboard, Store, Package, BarChart2, FileText } from 'lucide-react'; // Import FileText icon
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { setTheme } = useTheme();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showSuccessToast('Déconnexion réussie !');
    } catch (error: any) {
      showErrorToast(`Erreur de déconnexion : ${error.message}`);
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Mon App</Link>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link to="/" className={cn("hover:underline", "text-primary-foreground")}>Accueil</Link>
            </li>
            <li>
              <Link to="/about" className={cn("hover:underline", "text-primary-foreground")}>À propos</Link>
            </li>
            {!loading && (
              <>
                {user ? (
                  <>
                    <li>
                      <Link to="/dashboard" className={cn("hover:underline", "text-primary-foreground flex items-center gap-1")}>
                        <LayoutDashboard className="h-4 w-4" /> Tableau de Bord
                      </Link>
                    </li>
                    <li>
                      <Link to="/shops" className={cn("hover:underline", "text-primary-foreground flex items-center gap-1")}>
                        <Store className="h-4 w-4" /> Boutiques
                      </Link>
                    </li>
                    <li>
                      <Link to="/products" className={cn("hover:underline", "text-primary-foreground flex items-center gap-1")}>
                        <Package className="h-4 w-4" /> Articles
                      </Link>
                    </li>
                    <li>
                      <Link to="/weekly-analysis" className={cn("hover:underline", "text-primary-foreground flex items-center gap-1")}>
                        <BarChart2 className="h-4 w-4" /> Analyse Hebdo
                      </Link>
                    </li>
                    <li>
                      <Link to="/reports" className={cn("hover:underline", "text-primary-foreground flex items-center gap-1")}>
                        <FileText className="h-4 w-4" /> Rapports
                      </Link>
                    </li>
                    <li>
                      <Link to="/profile" className={cn("hover:underline", "text-primary-foreground flex items-center gap-1")}>
                        <UserIcon className="h-4 w-4" /> Profil
                      </Link>
                    </li>
                    <li>
                      <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary/80 flex items-center gap-1">
                        <LogOut className="h-4 w-4" /> Déconnexion
                      </Button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className={cn("hover:underline", "text-primary-foreground")}>Connexion</Link>
                    </li>
                    <li>
                      <Link to="/signup" className={cn("hover:underline", "text-primary-foreground")}>Inscription</Link>
                    </li>
                  </>
                )}
              </>
            )}
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-muted text-muted-foreground p-4 text-center">
        <p>&copy; 2024 Mon App. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default Layout;