'use client';

import { useState, useEffect } from 'react';
import { computeShape, type ComputedShape } from '@/lib/shape';
import Landing from '@/components/Landing';
import Survey from '@/components/Survey';
import Reveal from '@/components/Reveal';
import Playground from '@/components/Playground';

type Screen = 'landing' | 'survey' | 'reveal' | 'playground';

// Barra di progresso con 3 step in alto al centro
function ProgressCounter({ step }: { step: number }) {
  return (
    <div className="progress-counter">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="progress-bar"
          style={{ background: i <= step ? '#f2f2f2' : '#333' }}
        />
      ))}
      <span style={{ marginLeft: 8 }}>
        {String(step + 1).padStart(2, '0')} / 03
      </span>
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [shape, setShape] = useState<ComputedShape | null>(null);
  const [answers, setAnswers] = useState<(number | string)[] | null>(null);

  // Scrolla in cima quando cambia schermata
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const stepForScreen: Record<string, number> = {
    landing: 0,
    survey: 1,
    reveal: 2,
  };

  return (
    <>
      {/* Progress counter — visibile tranne nel playground */}
      {screen !== 'playground' && (
        <ProgressCounter step={stepForScreen[screen]} />
      )}

      {/* Bottone indietro */}
      {screen !== 'landing' && screen !== 'playground' && (
        <button
          onClick={() => {
            if (screen === 'survey') setScreen('landing');
            else if (screen === 'reveal') setScreen('survey');
          }}
          className="app-back"
        >
          &larr; indietro
        </button>
      )}

      {screen === 'playground' && (
        <button
          onClick={() => setScreen(answers ? 'reveal' : 'landing')}
          className="app-back"
        >
          &larr; indietro
        </button>
      )}

      {/* Schermate */}
      {screen === 'landing' && (
        <Landing onNext={() => setScreen('survey')} />
      )}

      {screen === 'survey' && (
        <Survey
          onComplete={(a) => {
            setAnswers(a);
            setShape(computeShape(a));
            setScreen('reveal');
          }}
        />
      )}

      {screen === 'reveal' && shape && (
        <Reveal
          shape={shape}
          onPlayground={() => setScreen('playground')}
        />
      )}

      {screen === 'playground' && (
        <Playground initialShape={shape} />
      )}
    </>
  );
}
