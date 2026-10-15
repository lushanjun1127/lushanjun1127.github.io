'use client';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
export function VisitTracker({ collectionId }: { collectionId: string }) {
  const params = useSearchParams();
  const folderId = params.get('folderId') || '';
  const previous = useRef('');
  useEffect(() => {
    if (!collectionId) return;
    const key = `${collectionId}:${folderId}`;
    if (previous.current === key) return;
    previous.current = key;
    fetch('/api/track', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type:'page', collectionId, folderId }), keepalive:true }).catch(() => {});
  }, [collectionId, folderId]);
  return null;
}
