
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-8 md:p-12 bg-gradient-to-br from-primary/90 to-primary/70 text-white",
      "border border-white/10 shadow-xl",
      className
    )}>
      {/* Abstract shapes in background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute h-40 w-40 rounded-full bg-white/30 blur-3xl -top-10 -left-10" />
        <div className="absolute h-60 w-60 rounded-full bg-white/20 blur-3xl top-1/3 right-10" />
        <div className="absolute h-20 w-20 rounded-full bg-white/20 blur-xl bottom-10 left-1/3" />
      </div>

      <div className="relative z-10 flex flex-col max-w-3xl animate-fade-up">
        <div className="mb-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur-sm border border-white/10 w-fit">
          <span>Einfach. Zuverlässig. Effizient.</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Professionelles Management für Dolmetscher
        </h1>
        
        <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl">
          Verwalten Sie Ihre Einsätze, Kunden und Vergütungen an einem Ort. 
          Steigern Sie Ihre Effizienz mit unserer spezialisierten Lösung für Dolmetscher.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate('/assignments')}
            className="bg-white text-primary hover:bg-white/90 transition-all shadow-md hover:shadow-lg btn-hover-effect"
            size="lg"
          >
            Einsätze verwalten
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            onClick={() => navigate('/statistics')}
            variant="outline" 
            className="bg-transparent border-white text-white hover:bg-white/10 transition-all"
            size="lg"
          >
            Statistiken anzeigen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
