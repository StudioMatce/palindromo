'use client';

interface LandingProps {
  onNext: () => void;
}

export default function Landing({ onNext }: LandingProps) {
  return (
    <div className="landing-screen">
      {/* Eyebrow */}
      <div className="landing-eyebrow">
        Conegliano &middot; 2026
      </div>

      {/* Titolo */}
      <h1 className="landing-title">
        Palindromo
      </h1>

      {/* Payoff */}
      <p className="landing-payoff">
        Apparentemente uguale, ma non per forza identico.
      </p>

      {/* CTA */}
      <a
        href="#survey"
        onClick={(e) => {
          e.preventDefault();
          onNext();
        }}
        className="landing-cta"
      >
        <span>Scopri</span>
        <span className="landing-cta-arrow">→</span>
      </a>
    </div>
  );
}
