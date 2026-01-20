/**
 * 404 Not Found Page
 *
 * Displayed when a page doesn't exist
 */

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        {/* Large 404 */}
        <h1 className="text-9xl font-bold tracking-tighter text-primary">404</h1>

        {/* Title */}
        <h2 className="mt-4 text-3xl font-bold tracking-tight">Page not found</h2>

        {/* Description */}
        <p className="mt-4 text-lg text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Link>
          </Button>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-muted-foreground">
          If you think this is a mistake, please contact support
        </p>
      </div>
    </div>
  );
}