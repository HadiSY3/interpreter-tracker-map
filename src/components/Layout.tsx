
import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calendar,
  Tag,
  BarChart4,
  Menu,
  X,
  LogOut,
  MapPin,
  Users
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Einsätze',
      href: '/assignments',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: 'Orte',
      href: '/locations',
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      title: 'Kategorien',
      href: '/categories',
      icon: <Tag className="h-5 w-5" />,
    },
    {
      title: 'Dolmetscher',
      href: '/interpreters',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Statistiken',
      href: '/statistics',
      icon: <BarChart4 className="h-5 w-5" />,
    },
  ];

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    if (showMobileMenu) setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="lg:hidden border-b bg-white p-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="font-bold text-lg text-primary flex items-center"
          onClick={closeMobileMenu}
        >
          DolmetcherApp
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMobileMenu}
          className="lg:hidden"
        >
          {showMobileMenu ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r p-4">
          <div className="flex items-center h-12 mb-8">
            <Link to="/" className="font-bold text-xl text-primary">
              DolmetcherApp
            </Link>
          </div>
          <nav className="space-y-1 flex-1">
            {navItems.map(({ title, href, icon }) => (
              <Link 
                key={href} 
                to={href}
                className={cn(
                  "flex items-center h-12 px-4 rounded-md text-sm font-medium",
                  "hover:bg-secondary/80 transition-colors",
                  location.pathname === href 
                    ? "bg-secondary text-primary" 
                    : "text-gray-600"
                )}
              >
                <span className="mr-3">{icon}</span>
                {title}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t mt-8">
            <Button variant="ghost" className="w-full justify-start text-red-500">
              <LogOut className="mr-3 h-5 w-5" />
              Abmelden
            </Button>
          </div>
        </aside>

        {/* Mobile Menu */}
        {isMobile && showMobileMenu && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-bold text-lg text-primary">DolmetcherApp</span>
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex-1 overflow-auto p-4 pt-2">
                <div className="space-y-1">
                  {navItems.map(({ title, href, icon }) => (
                    <Link
                      key={href}
                      to={href}
                      className={cn(
                        "flex items-center h-12 px-4 rounded-md text-sm font-medium",
                        "transition-colors",
                        location.pathname === href
                          ? "bg-secondary text-primary"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                      onClick={closeMobileMenu}
                    >
                      <span className="mr-3">{icon}</span>
                      {title}
                    </Link>
                  ))}
                </div>
              </nav>
              <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start text-red-500">
                  <LogOut className="mr-3 h-5 w-5" />
                  Abmelden
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
