import { afterEach, describe, expect, it, vi } from 'vitest';

import { API_PREFIX, ApiError, apiFetch, resolveApiBase } from './api';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('resolveApiBase', () => {
  it('uses the relative prefix in the browser', () => {
    expect(resolveApiBase({ isServer: false })).toBe(API_PREFIX);
  });

  it('uses API_INTERNAL_URL on the server', () => {
    expect(resolveApiBase({ isServer: true, internalUrl: 'http://nginx/' })).toBe(
      'http://nginx/api/v1',
    );
  });

  it('fails on the server without API_INTERNAL_URL', () => {
    expect(() => resolveApiBase({ isServer: true })).toThrow(
      'API_INTERNAL_URL is required on the server',
    );
  });
});

describe('apiFetch', () => {
  it('calls the relative API path with credentials in the browser', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch<{ status: string }>('/health')).resolves.toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/health',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('throws an ApiError with Problem Details', async () => {
    const fetchMock = vi.fn().mockImplementation(
      async () =>
        new Response(JSON.stringify({ status: 404, detail: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/problem+json' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch('/unknown')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'Not found',
    });
    await expect(apiFetch('/unknown')).rejects.toBeInstanceOf(ApiError);
  });
});
