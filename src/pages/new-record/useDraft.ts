import { useState, useEffect, useCallback } from 'react';
import { getDraft, updateDraft, subscribeDraft } from './draftStore';
import type { INewRecordDraft } from './draftStore';

/**
 * useDraft — 订阅草稿 store 的 React hook
 * 返回 [draft, update] 对
 */
export function useDraft(): [Readonly<INewRecordDraft>, (patch: Partial<INewRecordDraft>) => void] {
  const [draft, setDraft] = useState(getDraft);

  useEffect(() => {
    const unsub = subscribeDraft(() => setDraft(getDraft()));
    return unsub;
  }, []);

  const update = useCallback((patch: Partial<INewRecordDraft>) => {
    updateDraft(patch);
  }, []);

  return [draft, update];
}
