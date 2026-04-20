'use client';

import { useState, useMemo, useEffect } from 'react';
import { QUESTIONS } from '@/lib/survey-data';
import { generatePreviewVariants } from '@/lib/shape';
import XShape from './XShape';

interface SurveyProps {
  onComplete: (answers: (number | string)[]) => void;
}

export default function Survey({ onComplete }: SurveyProps) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | string)[]>([]);
  const [anim, setAnim] = useState<'in' | 'out'>('in');

  const q = QUESTIONS[idx];

  // Una variante X unica per ogni domanda
  const PREVIEW_VARIANTS = useMemo(() => generatePreviewVariants(), []);

  useEffect(() => {
    setAnim('in');
  }, [idx]);

  const choose = (val: number | string) => {
    setAnim('out');
    setTimeout(() => {
      const next = [...answers, val];
      setAnswers(next);
      if (next.length === QUESTIONS.length) {
        onComplete(next);
      } else {
        setIdx(idx + 1);
      }
    }, 260);
  };

  const goBack = () => {
    setAnim('out');
    setTimeout(() => {
      setAnswers(answers.slice(0, -1));
      setIdx(idx - 1);
    }, 200);
  };

  return (
    <div className="survey-screen">
      <div
        className="survey-content"
        style={{
          opacity: anim === 'out' ? 0 : 1,
          transform: anim === 'out' ? 'translateY(-20px)' : 'translateY(0)',
        }}
      >
        {/* Preview X unica per questa domanda */}
        <div style={{ opacity: 0.8, marginBottom: 28 }}>
          <XShape
            size={44}
            color="#eb0028"
            {...PREVIEW_VARIANTS[idx]}
          />
        </div>

        {/* Contatore */}
        <div className="survey-counter">
          {String(idx + 1).padStart(2, '0')} / {String(QUESTIONS.length).padStart(2, '0')}
        </div>

        {/* Domanda */}
        <div className="survey-prompt">
          {q.prompt}
        </div>

        <div style={{ height: 60 }} />

        {/* Opzioni */}
        <div className="survey-options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => choose(opt.value)}
              className="survey-opt"
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Indietro */}
        {idx > 0 && (
          <button onClick={goBack} className="survey-back">
            &larr; Indietro
          </button>
        )}
      </div>
    </div>
  );
}
