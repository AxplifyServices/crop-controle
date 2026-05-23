'use client';

import {Agentation} from 'agentation';

export function AgentationClient() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{position: 'relative', zIndex: 999999}}>
      <Agentation />
    </div>
  );
}