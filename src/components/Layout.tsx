
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  BarChart4, 
  Map, 
  Tag, 
  Users, 
  Menu, 
  X,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import SyncDatabaseButton from './SyncDatabaseButton';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  interface NavItem {
    title: string;
    href: string;
    icon: React.ReactNode;
  }

  const navItems: NavItem[] = [
    {
      title: "Startseite",
      href: "/",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "Einsätze",
      href: "/assignments",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      title: "Kategorien",
      href: "/categories",
      icon: <Tag className="mr-2 h-4 w-4" />,
    },
    {
      title: "Orte",
      href: "/locations",
      icon: <Map className="mr-2 h-4 w-4" />,
    },
    {
      title: "Dolmetscher",
      href: "/interpreters",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Statistik",
      href: "/statistics",
      icon: <BarChart4 className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 sm:max-w-none">
              <div className="flex h-full flex-col">
                <div className="flex items-center border-b px-2 py-4">
                  <Link
                    to="/"
                    className="flex items-center gap-2 font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    <Calendar className="h-6 w-6 text-purple-600" />
                    <span className="text-lg">Dolmetscher Tracking</span>
                  </Link>
                  <Button
                    variant="ghost"
                    className="ml-auto rounded-full"
                    size="icon"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <nav className="flex flex-col gap-1 p-2">
                    {navItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          location.pathname === item.href
                            ? "bg-purple-100 text-purple-900"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    ))}
                  </nav>
                </ScrollArea>
                <div className="border-t p-4">
                  <SyncDatabaseButton className="w-full" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Calendar className="h-6 w-6 text-purple-600" />
            <span className="hidden text-lg md:inline-block">
              Dolmetscher Tracking
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={cn(
                "flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                location.pathname === item.href
                  ? "bg-purple-100 text-purple-900"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <SyncDatabaseButton className="hidden md:flex" />
        </div>
      </header>
      <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
