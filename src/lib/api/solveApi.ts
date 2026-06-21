import type { SolverResult } from '../../types/solver';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function solveWithBackend(
  pcpsp: File,
  prec: File
): Promise<SolverResult> {
  const form = new FormData();
  form.append('pcpsp', pcpsp);
  form.append('prec', prec);

  const res = await fetch(`${API_BASE}/api/solve`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    let message = `Server error (${res.status})`;
    try {
      const body = await res.json();
      message = body.detail ?? message;
    } catch {
      message = (await res.text()) || message;
    }
    throw new Error(message);
  }

  return res.json() as Promise<SolverResult>;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}
