import { useEffect, useState } from 'react';
import { fetchPublicData } from './publicData.mjs';

export function usePublicData(path) {
  const [result, setResult] = useState({ path, loading: true, data: null, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 12000);
    fetchPublicData(path, { signal: controller.signal })
      .then(data => { if (active) setResult({ path, loading: false, data, error: null }); })
      .catch(error => { if (active) setResult({ path, loading: false, data: null, error }); })
      .finally(() => clearTimeout(timer));
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [path, attempt]);
  return {
    ...(result.path === path ? result : { loading: true, data: null, error: null }),
    retry: () => { setResult({ path, loading: true, data: null, error: null }); setAttempt(value => value + 1); },
  };
}
