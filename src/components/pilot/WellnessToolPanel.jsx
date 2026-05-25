import React, { useState } from 'react';
import { ArrowLeft, Headphones, LifeBuoy, PenLine, Wind } from 'lucide-react';
import ActionPanel from './ActionPanel';

const tools = {
  'Breathing Tools': { icon: Wind, type: 'Breathing exercise', title: 'Breathing Tools', description: 'Choose a guided reset and save how you feel after.', options: ['Box Breathing', 'Grounding', 'Reset timer'], placeholder: 'What changed after this exercise?' },
  'Panic Support': { icon: LifeBuoy, type: 'Emergency calm', title: 'Panic Support', description: 'Use a fast calm path when the moment feels too big.', options: ['Safe Place', 'Reach Out', 'Call Support', 'Journal Now'], placeholder: 'What support step did you take?' },
  'Binaural Beats': { icon: Headphones, type: 'Audio player', title: 'Binaural Beats', description: 'Mock audio player for calm, focus, and rest tracks.', options: ['▶ Calm track', '▶ Focus track', '▶ Rest track'], placeholder: 'Save the track that helped most.' },
  Journaling: { icon: PenLine, type: 'Journal form', title: 'Journaling', description: 'Write a quick entry and keep a local saved list.', options: ['Today I noticed...', 'One thing I handled...', 'Tomorrow I need...'], placeholder: 'Write your journal entry...' },
};

export default function WellnessToolPanel({ toolTitle, onBack }) {
  const tool = tools[toolTitle] || tools.Journaling;
  return <ActionPanel action={tool} onBack={onBack} />;
}