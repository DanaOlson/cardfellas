import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="font-display text-[120px] leading-none text-cf-border select-none">
        404
      </p>
      <h1 className="font-display text-4xl text-cf-cream mt-2 mb-3">
        Page Not Found
      </h1>
      <p className="text-cf-cream-dark text-sm max-w-sm mb-8">
        This card has left the collection. The page you&rsquo;re looking for
        doesn&rsquo;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-cf-red text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>
    </div>
  );
}
