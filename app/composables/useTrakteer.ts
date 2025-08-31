import { z } from 'zod';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { Store } from '@tauri-apps/plugin-store';

const trakteerStateSchema = z.object({
  pageId: z.string().default(''),
  streamApiKey: z.string().default(''),
  isConnected: z.boolean().default(false),
  isLoading: z.boolean().default(false),
  logs: z.array(z.string()).default([])
});

type TrakteerState = z.infer<typeof trakteerStateSchema>;

const state = useState<TrakteerState>('trakteer', () => trakteerStateSchema.parse({}));
export const useTrakteer = () => {
  const toast = useToast();
  let store: Store | null = null;

  const showNotification = async (title: string, body?: string) => {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }

    if (permissionGranted) {
      sendNotification({ title, body });
    } else {
      toast.add({
        title: 'Error',
        description: 'Missing notifications permission',
        color: 'error'
      });
    }
  };

  const initializeStore = async () => {
    if (store) {
      return;
    }
    store = await useTauriStoreLoad('trakteer.dat');
    const pageId = await store.get<string>('pageId');
    const streamApiKey = await store.get<string>('streamApiKey');
    if (pageId) {
      state.value.pageId = pageId;
    }
    if (streamApiKey) {
      state.value.streamApiKey = streamApiKey;
    }
  };

  // Initialize the store when the composable is first used
  onMounted(initializeStore);
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    state.value.logs.push(logMessage);
    console.log(logMessage);
  };

  const connect = async () => {
    if (state.value.isConnected) {
      return;
    }

    if (!state.value.pageId || !state.value.streamApiKey) {
      addLog('Error: Page ID and Stream API Key are required.');
      return;
    }

    state.value.isLoading = true;
    addLog('Connecting to Trakteer...');

    try {
      // Using a POST request to initiate the SSE connection is not directly
      // supported by EventSource. We'll use fetch to initiate and then
      // handle the stream, but the core logic remains the same.
      // For simplicity, we'll assume the server is adapted to handle this,
      // or we switch to a GET request if possible.
      // Let's stick to the fetch-based approach for now to keep server compatibility.
      // A true EventSource would look like:
      // eventSource = new EventSource(`/api/trakteer/connect?pageId=${state.value.pageId}&streamApiKey=${state.value.streamApiKey}`);
      // But this requires changing the server endpoint to GET and passing credentials in URL.

      // Re-implementing with a persistent fetch stream is complex to manage globally.
      // A better approach is to use WebSockets or manage the fetch AbortController globally.
      // Given the current structure, let's stick to the EventSource API and adjust the server.
      // It's a cleaner long-term solution.

      // Let's assume for now we can't change the server. We need a global AbortController.
      const abortController = new AbortController();
      (window as any).__TRAKTEER_ABORT_CONTROLLER__ = abortController;

      const response = await fetch('/api/trakteer/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: state.value.pageId,
          streamApiKey: state.value.streamApiKey
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.statusMessage || 'Failed to connect');
      }

      // Save credentials on successful connection
      if (store) {
        await store.set('pageId', state.value.pageId);
        await store.set('streamApiKey', state.value.streamApiKey);
        await store.save();
      }

      state.value.isConnected = true;
      state.value.isLoading = false;
      addLog('Successfully connected to Trakteer stream.');
      showNotification('Trakteer Connected', 'Successfully connected to the Trakteer donation stream.');

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader');
      }

      const decoder = new TextDecoder();
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          addLog('Stream ended.');
          disconnect();
          break;
        }
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter(line => line.startsWith('data:'));
        for (const line of lines) {
          const data = JSON.parse(line.replace('data: ', ''));
          addLog(data);
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        addLog('Connection aborted.');
      } else {
        addLog(`Error: ${error.message}`);
      }
      disconnect(false); // Don't log disconnect message if it was an error
    } finally {
      state.value.isLoading = false;
    }
  };

  const disconnect = (log = true) => {
    const abortController = (window as any).__TRAKTEER_ABORT_CONTROLLER__;
    if (abortController) {
      abortController.abort();
      (window as any).__TRAKTEER_ABORT_CONTROLLER__ = null;
    }
    if (state.value.isConnected) {
      state.value.isConnected = false;
      if (log) {
        addLog('Disconnected.');
        showNotification('Trakteer Disconnected', 'The connection to the Trakteer stream has been closed.');
      }
    }
  };

  return {
    state,
    connect,
    disconnect
  };
};