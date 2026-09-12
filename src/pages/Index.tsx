
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  QrCode,
  ScanLine,
  ShieldCheck,
  Users,
  BookOpen,
  CalendarDays,
  BarChart3,
  Lock,
  KeyRound,
  FileCheck,
  Gauge,
  Church,
} from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

const qrSteps = [
  {
    icon: <QrCode className="h-6 w-6" />,
    step: '1',
    title: 'Print each child\u2019s QR card',
    description:
      'Every child profile generates a personal QR code. It carries only the child\u2019s id and name \u2014 no addresses, contacts, or medical details.',
  },
  {
    icon: <ScanLine className="h-6 w-6" />,
    step: '2',
    title: 'Scan at the door',
    description:
      'Staff open the scanner in the app and scan each card at check-in. Attendance is recorded instantly, no paper sheets, no lost sign-ins.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    step: '3',
    title: 'A record you can trust',
    description:
      'Duplicate scans are caught automatically, and parents only ever see their own children. Every check-in is part of a tamper-evident history.',
  },
];

const bento = [
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Child profiles',
    description: 'Complete records with age groups, parents, and notes \u2014 visible only to the people who need them.',
    span: 'lg:col-span-2',
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: 'Curriculum',
    description: 'Plan lessons with objectives, materials, and activities; share them with the right teachers.',
    span: '',
  },
  {
    icon: <CalendarDays className="h-5 w-5" />,
    title: 'Events',
    description: 'VBS, camps, and festivals with capacity limits and one-tap registration.',
    span: '',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Reports',
    description: 'Attendance trends and ministry analytics for staff \u2014 exportable for your records.',
    span: '',
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: 'Role-based access',
    description: 'Admins, teachers, volunteers, and parents each see exactly what their role allows \u2014 nothing more.',
    span: 'lg:col-span-3',
  },
];

const securityPoints = [
  {
    icon: <KeyRound className="h-4 w-4" />,
    title: 'Passwords hashed with PBKDF2',
    text: '100,000-round PBKDF2-SHA256 with per-user salts. Plaintext passwords never reach the database.',
  },
  {
    icon: <FileCheck className="h-4 w-4" />,
    title: 'Validated uploads',
    text: 'Images are checked against a strict type allowlist; stored content types are derived from the file, never trusted from the client.',
  },
  {
    icon: <Gauge className="h-4 w-4" />,
    title: 'Rate-limited sign-in',
    text: 'Login attempts are throttled per IP to slow down credential guessing.',
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: 'Role-checked on every request',
    text: 'Authorization is enforced server-side on every API route \u2014 the UI is a convenience, not the boundary.',
  },
];

const Index = () => {
  const navigate = useNavigate();
  usePageMeta({
    title: 'KidMin Harmony \u2014 Children\u2019s Ministry Management',
    description:
      'Child records, secure QR-code check-in, curriculum, events, and attendance reports for your children\u2019s ministry \u2014 in one place.',
    noindex: false,
  });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 rounded-md">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Church className="h-4 w-4" />
            </span>
            <span className="text-lg font-semibold">KidMin Harmony</span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Main">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Sign in
            </Button>
            <Button onClick={() => navigate('/register')}>
              Get started
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 via-background to-background"
          />
          <div className="container flex flex-col items-center py-20 text-center md:py-28">
            <p className="mb-4 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary animate-fade-in">
              Designed for children&rsquo;s ministries
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl animate-slide-up">
              Every child checked in.
              <br />
              <span className="text-primary">Nothing left to guess.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground animate-slide-up [animation-delay:150ms]">
              KidMin Harmony brings child records, QR-code check-in, curriculum, events, and
              attendance reports together in one calm, secure place \u2014 built for the people who
              actually run the room.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-slide-up [animation-delay:300ms]">
              <Button size="lg" onClick={() => navigate('/register')} className="group">
                Create your ministry&rsquo;s account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Sign in
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground animate-fade-in [animation-delay:500ms]">
              Free to run \u2014 self-hosted on your own infrastructure.
            </p>
          </div>
        </section>

        {/* How QR check-in works */}
        <section className="w-full border-y border-border/60 bg-secondary/40 py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">How check-in actually works</h2>
              <p className="mt-3 text-muted-foreground">
                No clipboards, no &ldquo;which room was Timmy in?&rdquo; \u2014 just a card per child and a
                scan per door.
              </p>
            </div>
            <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {qrSteps.map((item, i) => (
                <li
                  key={item.step}
                  className="relative rounded-xl border border-border bg-card p-6 shadow-sm animate-slide-up"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {item.icon}
                    </span>
                    <span className="text-4xl font-bold text-primary/20">{item.step}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Feature bento */}
        <section className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">One place for the whole ministry</h2>
              <p className="mt-3 text-muted-foreground">
                Everything a children&rsquo;s ministry touches, organized the way you already think
                about it.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bento.map((item) => (
                <div
                  key={item.title}
                  className={`group rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 ${item.span}`}
                >
                  <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {item.icon}
                  </span>
                  <h3 className="mb-1.5 font-semibold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="w-full border-t border-border/60 bg-secondary/40 py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                You&rsquo;ll be looking after children. So is the software.
              </h2>
              <p className="mt-3 text-muted-foreground">
                KidMin Harmony treats child data like the sensitive data it is.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {securityPoints.map((point) => (
                <div key={point.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {point.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold">{point.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{point.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6 text-center">
            <div className="mx-auto max-w-xl space-y-5">
              <h2 className="text-3xl font-bold tracking-tight">
                Set up your ministry in an afternoon
              </h2>
              <p className="text-muted-foreground">
                Create the admin account, add your children, print the QR cards \u2014 and the next
                check-in takes seconds.
              </p>
              <Button size="lg" onClick={() => navigate('/register')} className="group">
                Get started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="container flex flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row md:px-6">
          <p>&copy; {new Date().getFullYear()} KidMin Harmony. Built for children&rsquo;s ministries.</p>
          <nav aria-label="Footer" className="flex items-center gap-4">
            <Link to="/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="hover:text-foreground transition-colors">
              Create account
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Index;
