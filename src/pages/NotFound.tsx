import { Link } from "react-router-dom";
import { Church } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

const NotFound = () => {
  usePageMeta({ title: "Page not found — KidMin Harmony" });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Church className="h-7 w-7" />
      </span>
      <p className="text-sm font-medium uppercase tracking-widest text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">This page walked off with the class</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved. Let&rsquo;s get you back
        to safe ground.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Return home
      </Link>
    </div>
  );
};

export default NotFound;
