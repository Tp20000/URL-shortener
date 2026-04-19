import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { urlAPI } from '@/lib/api';
import {
  Link2, Zap, Shield, BarChart3, QrCode,
  Globe, ArrowRight, Copy, Check, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Landing() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      const res = await urlAPI.create({ originalUrl: url });
      setShortUrl(res.data.data.shortUrl);
      toast.success('URL shortened!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      desc: 'Generate short URLs in milliseconds with Redis caching',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      desc: 'Track clicks, devices, browsers, OS, and referrers',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      desc: 'Rate limiting, JWT auth, and production-grade security',
    },
    {
      icon: QrCode,
      title: 'QR Codes',
      desc: 'Generate customizable QR codes for any shortened URL',
    },
    {
      icon: Link2,
      title: 'Custom Aliases',
      desc: 'Create memorable custom short links for your brand',
    },
    {
      icon: Globe,
      title: 'Link Management',
      desc: 'Edit, disable, set expiration, and organize your links',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
              <Zap className="mr-2 h-3 w-3 text-primary" />
              Open source URL shortener
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
              Short Links,{' '}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Big Impact
              </span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              Create short, powerful links with analytics, QR codes, and custom
              aliases. Built for developers, marketers, and everyone in between.
            </p>

            {/* URL Shortener Form */}
            <form
              onSubmit={handleShorten}
              className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row"
            >
              <Input
                type="text"
                placeholder="Paste your long URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 flex-1 text-base"
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Shortening...
                  </span>
                ) : (
                  <>
                    Shorten <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Result */}
            {shortUrl && (
              <div className="mx-auto mt-6 flex max-w-2xl items-center gap-2 rounded-lg border bg-card p-3">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-left text-primary hover:underline font-medium"
                >
                  {shortUrl}
                  <ExternalLink className="ml-1 inline h-3 w-3" />
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            <p className="mt-4 text-sm text-muted-foreground">
              No registration required.{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary hover:underline"
              >
                Create an account
              </button>{' '}
              for analytics &amp; management.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Everything you need
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Powerful features to manage and track your links
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-3 mb-8 text-lg text-muted-foreground">
            Create your free account and start shortening URLs today.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/register')}>
              Create Free Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}