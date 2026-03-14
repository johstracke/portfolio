import { Button } from '@/components/shared/button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-lg">
      <div className="inline-block border-[3px] border-black bg-primary px-4 py-1 shadow-brutal-sm mb-6">
        <span className="font-bold text-sm uppercase tracking-widest">404</span>
      </div>
      <h1 className="font-display text-5xl font-bold mb-4">Page not found.</h1>
      <p className="text-lg text-ink/80 mb-8">
        That page doesn&apos;t exist, was moved, or is still being built.
      </p>
      <Button href="/">Go Home</Button>
    </div>
  );
}
