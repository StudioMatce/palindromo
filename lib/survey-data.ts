export interface SurveyOption {
  label: string;
  value: number | string;
}

export interface SurveyQuestion {
  id: string;
  axis: 'x' | 'y' | 'size';
  prompt: string;
  options: [SurveyOption, SurveyOption];
}

export const QUESTIONS: SurveyQuestion[] = [
  {
    id: 'd1',
    axis: 'y',
    prompt: "Hai un'intuizione importante durante una conversazione.",
    options: [
      { label: 'La tengo dentro, ci ragiono finché non è chiara', value: +1 },
      { label: 'La dico subito, anche se non è ancora formata', value: -1 },
    ],
  },
  {
    id: 'd2',
    axis: 'y',
    prompt: 'Un piano perfetto ma lento, oppure uno imperfetto ma già in moto?',
    options: [
      { label: 'Preferisco arrivare tardi ma arrivare giusto', value: +1 },
      { label: 'Preferisco partire storto che non partire', value: -1 },
    ],
  },
  {
    id: 'd3',
    axis: 'y',
    prompt: 'Ti chiedono un parere su qualcosa che non conosci bene.',
    options: [
      { label: 'Dico "non lo so abbastanza per dirtelo"', value: +1 },
      { label: 'Provo a rispondere con quello che ho', value: -1 },
    ],
  },
  {
    id: 'd4',
    axis: 'x',
    prompt: 'Scopri che un problema è già stato risolto cento volte prima di te.',
    options: [
      { label: 'Bene, parto da lì e provo una strada diversa', value: +1 },
      { label: 'Bene, studio come hanno fatto e seguo quella via', value: -1 },
    ],
  },
  {
    id: 'd5',
    axis: 'x',
    prompt: 'Cosa ti annoia di più?',
    options: [
      { label: 'Ripetere qualcosa che funziona già', value: +1 },
      { label: 'Reinventare qualcosa senza un vero motivo', value: -1 },
    ],
  },
  {
    id: 'd6',
    axis: 'x',
    prompt: 'Leggere la stessa cosa due volte:',
    options: [
      { label: 'È tempo perso, una volta basta', value: +1 },
      { label: 'È tempo guadagnato, la seconda vedi cose nuove', value: -1 },
    ],
  },
  {
    id: 'd7',
    axis: 'size',
    prompt: "Un'idea buona è come:",
    options: [
      { label: 'Una scintilla, breve e netta', value: 'piccolo' },
      { label: 'Un incendio, che si allarga e prende tempo', value: 'grande' },
    ],
  },
];
