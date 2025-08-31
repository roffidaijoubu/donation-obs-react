import { z } from 'zod';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { Store } from '@tauri-apps/plugin-store';

const trakteerStateSchema = z.object({
  pageId: z.string().default(''),
  streamApiKey: z.string().default(''),
  isConnected: z.boolean().default(false),
  isLoading: z.boolean().default(false),
});

type TrakteerState = z.infer<typeof trakteerStateSchema>;

const state = useState<TrakteerState>('trakteer', () => trakteerStateSchema.parse({}));
export const useTrakteer = () => {
  const toast = useToast();
  let store: Store | null = null;
  const { triggerSceneSwitch } = useObs();
  const { addLog } = useLog();

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
      const ws = new WebSocket("wss://socket.trakteer.id/app/2ae25d102cc6cd41100a?protocol=7&client=js&version=5.1.1&flash=false");
      let pingInterval: NodeJS.Timeout | null = null;

      ws.onopen = async () => {
        try {
          const response = await fetch(`https://trakteer.id/${state.value.pageId}/stream?key=${state.value.streamApiKey}`);
          const text = await response.text();
          const result = /creator-stream\.(.*?)\./gi.exec(text);

          if (!result || !result) {
            throw new Error("Failed to get user ID. Invalid Page ID or Stream API Key?");
          }

          const userId = result;

          ws.send(JSON.stringify({
            event: "pusher:subscribe",
            data: {
              auth: "",
              channel: `creator-stream.${userId}.${state.value.streamApiKey}`,
            },
          }));

          ws.send(JSON.stringify({
            event: "pusher:subscribe",
            data: {
              auth: "",
              channel: `creator-stream-test.${userId}.${state.value.streamApiKey}`,
            },
          }));

          pingInterval = setInterval(() => {
            ws.send(JSON.stringify({
              data: {},
              event: "pusher:ping",
            }));
          }, 5000);

          state.value.isConnected = true;
          state.value.isLoading = false;
          addLog('Successfully connected to Trakteer.');
          showNotification('Trakteer Connected', 'Successfully connected to the Trakteer donation stream.');
        } catch (error: any) {
          addLog(`Error: ${error.message}`);
          disconnect(false);
        }
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.event === "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated") {
          const data = JSON.parse(msg.data);
          const logMessage = `New donation from ${data.supporter_name}! Message: ${data.supporter_message}`;
          addLog(logMessage);
          showNotification('New Donation!', logMessage);
          triggerSceneSwitch();
        }
      };

      ws.onclose = () => {
        if (pingInterval) {
          clearInterval(pingInterval);
        }
        addLog('Trakteer connection closed.');
        disconnect(false);
      };

      ws.onerror = (error) => {
        if (pingInterval) {
          clearInterval(pingInterval);
        }
        addLog(`Trakteer error: ${error}`);
        disconnect(false);
      };

      (window as any).__TRAKTEER_WEBSOCKET__ = ws;
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      disconnect(false);
    } finally {
      state.value.isLoading = false;
    }
  };

  const disconnect = (log = true) => {
    const ws = (window as any).__TRAKTEER_WEBSOCKET__;
    if (ws) {
      ws.close();
      (window as any).__TRAKTEER_WEBSOCKET__ = null;
    }
    if (state.value.isConnected) {
      state.value.isConnected = false;
      if (log) {
        addLog('Disconnected.');
        showNotification('Trakteer Disconnected', 'The Trakteer connection has been closed.');
      }
    }
  };

  return {
    state,
    connect,
    disconnect
  };
};