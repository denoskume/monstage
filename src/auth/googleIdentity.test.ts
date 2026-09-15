import { afterEach, describe, expect, test, vi } from 'vitest';
import { disableGoogleAutoSelect, renderGoogleSignInButton } from './googleIdentity';

describe('Google Identity wrapper', () => {
  afterEach(() => {
    delete (window as any).google;
    document.querySelectorAll('script[data-monstage-gis]').forEach((node) => node.remove());
    vi.restoreAllMocks();
  });

  test('initializes GIS and renders a standard Google sign-in button', async () => {
    const initialize = vi.fn();
    const renderButton = vi.fn();
    (window as any).google = { accounts: { id: { initialize, renderButton, disableAutoSelect: vi.fn() } } };
    const target = document.createElement('div');
    const onCredential = vi.fn();

    await renderGoogleSignInButton(target, 'client-id.apps.googleusercontent.com', onCredential);

    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({
      client_id: 'client-id.apps.googleusercontent.com',
      auto_select: false,
      callback: expect.any(Function),
    }));
    expect(renderButton).toHaveBeenCalledWith(target, expect.objectContaining({
      type: 'standard',
      theme: 'outline',
      size: 'large',
    }));

    const callback = initialize.mock.calls[0][0].callback;
    callback({ credential: 'google-id-token' });
    expect(onCredential).toHaveBeenCalledWith('google-id-token');
  });

  test('disables Google auto-select when signing out', () => {
    const disableAutoSelect = vi.fn();
    (window as any).google = { accounts: { id: { initialize: vi.fn(), renderButton: vi.fn(), disableAutoSelect } } };

    disableGoogleAutoSelect();

    expect(disableAutoSelect).toHaveBeenCalledOnce();
  });
});
