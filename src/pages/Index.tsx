
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Users, CalendarCheck, BookOpen, Shield, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: 'Child Management',
    description: 'Register and manage children with complete profiles and family information.'
  },
  {
    icon: <CalendarCheck className="h-6 w-6 text-primary" />,
    title: 'Attendance Tracking',
    description: 'Secure QR-code based check-in/out system with automated tracking.'
  },
  {
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    title: 'Curriculum Management',
    description: 'Create, organize and distribute lesson materials to teachers and parents.'
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: 'Secure Access Control',
    description: 'Role-based permissions ensure data privacy and protection.'
  },
  {
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: 'Partnership Management',
    description: 'Track donations and manage partnerships for children\'s ministry.'
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const revealItems = () => {
      let newVisibleItems: number[] = [];
      features.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => [...prev, index]);
        }, 300 * index);
      });
      return newVisibleItems;
    };
    
    revealItems();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
        <div className="container px-4 md:px-6 space-y-10 md:space-y-14">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl animate-slide-up">
              Harmonizing Children's Ministry Management
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl animate-slide-up [animation-delay:200ms]">
              Streamline your children's ministry with our all-in-one management solution. 
              Secure, efficient, and designed for modern churches.
            </p>
          </div>
          <div className="space-x-4 animate-slide-up [animation-delay:400ms]">
            <Button 
              size="lg"
              onClick={() => navigate('/register')}
              className="group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full py-12 md:py-24 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 animate-slide-up">
            Powerful Features for Your Ministry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "p-6 rounded-lg glass-card hover:scale-105 transition-transform duration-300 cursor-pointer",
                  visibleItems.includes(index) ? "animate-scale-in" : "opacity-0"
                )}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6 text-center">
          <div className="mx-auto max-w-[600px] space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter animate-slide-up">
              Ready to Transform Your Ministry?
            </h2>
            <p className="text-muted-foreground animate-slide-up [animation-delay:200ms]">
              Join churches worldwide in streamlining their children's ministry operations.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="animate-slide-up [animation-delay:400ms]"
            >
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
