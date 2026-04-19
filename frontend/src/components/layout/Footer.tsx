import { Link2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:flex-row px-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
            <Link2 className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">Shortly</span>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Shortly. Built for learning &amp; interviews.
        </p>
      </div>
    </footer>
  );
}