import Link from 'next/link';
import { Button } from '@/components/shared/button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-ink/80 mb-6">Page not found.</p>
      <Button href="/">Go Home</Button>
    </div>
  );
}
