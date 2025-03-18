
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Tags, 
  Menu, 
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Einsätze', href: '/assignments', icon: Calendar },
    { name: 'Statistiken', href: '/statistics', icon: BarChart3 },
    { name: 'Kategorien', href: '/categories', icon: Tags },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile header with menu button */}
      {isMobile && (
        <header className="flex items-center justify-between p-4 bg-white border-b border-border/50 fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="ml-3 font-semibold text-lg">DolmetscherManager</h1>
          </div>
        </header>
      )}

      <div className="flex flex-1 mt-16 md:mt-0">
        {/* Sidebar - desktop always visible, mobile conditional */}
        <aside 
          className={cn(
            "fixed inset-y-0 z-50 flex flex-col bg-white border-r border-border/50 transition-transform duration-300 ease-in-out",
            isMobile ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0 w-64"
          )}
        >
          {/* Sidebar header */}
          <div className="h-16 flex items-center px-6 border-b border-border/50">
            {isMobile && (
              <button 
                onClick={toggleSidebar}
                className="absolute right-3 top-3 p-2 rounded-full hover:bg-secondary transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            )}
            <h1 className="font-semibold text-lg">DolmetscherManager</h1>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group',
                    isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  <item.icon size={18} className={cn(
                    "mr-2 transition-transform duration-300 group-hover:scale-110",
                    isActive ? 'text-white' : 'text-muted-foreground'
                  )} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/50 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} DolmetscherManager</p>
          </div>
        </aside>

        {/* Mobile overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <main className={cn(
          "flex-1 transition-all duration-300 p-6",
          isMobile ? "ml-0" : "ml-64"
        )}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
