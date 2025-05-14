import { browser } from '$app/environment';

export async function load() {
  if (browser) {
    try {
      const { worker } = await import('../../mocks/browser');

      await worker.start({
        onUnhandledRequest: 'bypass',
        quiet: true
      });
    } catch (error) {
    }
  }

  return {};
} 