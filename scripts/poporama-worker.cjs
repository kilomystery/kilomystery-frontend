// Dedicated server process. Keep the secret outside the frontend and source control.
const origin = process.env.POPORAMA_WORKER_URL;
const secret = process.env.POPORAMA_WORKER_SECRET;
if (!origin || !secret || secret.length < 32) { console.error('Configure POPORAMA_WORKER_URL and a POPORAMA_WORKER_SECRET of at least 32 characters.'); process.exit(1); }
let stopping = false;
process.on('SIGTERM', () => { stopping = true; }); process.on('SIGINT', () => { stopping = true; });
(async () => {
  let failures = 0;
  while (!stopping) {
    try {
      const response = await fetch(new URL('/api/poporama/jobs/run', origin), { method: 'POST', signal: AbortSignal.timeout(55000), headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: '{}' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      failures = 0;
    } catch (e) { failures++; console.error(`POPORAMA worker: ${e.message}; automatic retry.`); }
    await new Promise(resolve => setTimeout(resolve, Math.min(30000, 1000 * 2 ** Math.min(failures, 5))));
  }
})();
