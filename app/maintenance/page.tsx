export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-cf-dark flex flex-col items-center justify-center px-4 text-center">
      {/* Logo / wordmark */}
      <div className="mb-8">
        <span className="font-display text-5xl sm:text-6xl text-cf-cream tracking-wide">
          Card<span className="text-cf-red">Fellas</span>
        </span>
      </div>

      {/* Icon */}
      <div className="text-6xl mb-6">🃏</div>

      {/* Heading */}
      <h1 className="font-display text-3xl sm:text-4xl text-cf-cream mb-3">
        We&rsquo;ll be right back
      </h1>

      {/* Sub-copy */}
      <p className="text-cf-cream-dark text-base sm:text-lg max-w-md leading-relaxed mb-8">
        CardFellas is currently undergoing scheduled maintenance. We&rsquo;re
        shuffling the deck — check back shortly.
      </p>

      {/* Subtle divider */}
      <div className="w-16 h-px bg-cf-border mb-8" />

      {/* Contact line */}
      <p className="text-cf-cream-dark text-sm">
        Questions?{" "}
        <a
          href="mailto:info@cardfellas.com"
          className="text-cf-gold hover:underline"
        >
          info@cardfellas.com
        </a>
      </p>
    </div>
  );
}
