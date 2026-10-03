'use client';
import { useEffect, useRef } from 'react';
import { request } from './api';
import type { LearningInteractionDto, LearningInteractionReceiptDto } from './generated-types';

type Interaction = Omit<LearningInteractionDto, 'clientRequestId'>;
// Analytics never blocks learning. The server gate remains off until Data approves the mapping.
export async function recordLearningInteraction(
  token: string,
  input: Interaction,
  clientRequestId = crypto.randomUUID(),
) {
  return request<LearningInteractionReceiptDto>(token, '/students/me/learning-interactions', {
    method: 'POST',
    body: JSON.stringify({ ...input, clientRequestId }),
  });
}
export function useLearningView(
  token: string,
  eventName: Interaction['eventName'],
  context: { attemptId?: string | undefined; packageId?: string | undefined } = {},
  enabled = true,
) {
  const sent = useRef(new Set<string>());
  const { attemptId, packageId } = context;
  useEffect(() => {
    const key = JSON.stringify([token, eventName, attemptId, packageId]);
    if (!enabled || sent.current.has(key)) return;
    sent.current.add(key);
    void recordLearningInteraction(token, {
      eventName,
      ...(attemptId ? { attemptId } : {}),
      ...(packageId ? { packageId } : {}),
    }).catch(() => {});
  }, [token, eventName, attemptId, packageId, enabled]);
}
