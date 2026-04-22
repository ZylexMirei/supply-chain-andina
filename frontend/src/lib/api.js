const DEFAULT_TIMEOUT_MS = 12000;

function withTimeout(signal, timeoutMs) {
  if (!timeoutMs) return { signal, cleanup: () => {} };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const onAbort = () => controller.abort();
  if (signal) signal.addEventListener('abort', onAbort, { once: true });

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', onAbort);
    },
  };
}

async function safeJson(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function getApiBase() {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
}

export async function apiFetch(path, options = {}) {
  const base = getApiBase();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { signal, cleanup } = withTimeout(options.signal, timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal });
    const data = await safeJson(res);

    if (!res.ok) {
      const message = data?.message || `Solicitud fallida (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return { res, data };
  } catch (e) {
    if (e?.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado. Revisa tu conexión o el servidor.');
    }
    if (e instanceof TypeError) {
      throw new Error('No se pudo conectar con el backend. Verifica que esté corriendo en la URL configurada.');
    }
    throw e;
  } finally {
    cleanup();
  }
}

export async function getJson(path, options = {}) {
  const { data } = await apiFetch(path, options);
  return data;
}

export async function postJson(path, body, options = {}) {
  const { data } = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(body ?? {}),
    ...options,
  });
  return data;
}
