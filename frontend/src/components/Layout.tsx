import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils'; // Assurez-vous que le chemin est correct

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Mon App</Link>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className={cn("hover:underline", "text-primary-foreground")}>Accueil</Link>
            </li>
            <li>
              <Link to="/about" className={cn("hover:underline", "text-primary-foreground")}>À propos</Link>
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