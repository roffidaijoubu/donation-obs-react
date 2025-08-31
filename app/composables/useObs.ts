import { z } from 'zod';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import OBSWebSocket from 'obs-websocket-js';
import { Store } from '@tauri-apps/plugin-store';

const obsStateSchema = z.object({
  url: z.string().default('ws://127.0.0.1:4455'),
  password: z.string().default(''),
  duration: z.number().default(5),
  isConnected: z.boolean().default(false),
  isLoading: z.boolean().default(false),
  scenes: z.array(z.string()).default([]),
  targetScene: z.string().optional()
});

type ObsState = z.infer<typeof obsStateSchema>;

const state = useState<ObsState>('obs', () => obsStateSchema.parse({}));
const obs = new OBSWebSocket();
let store: Store | null = null;

export const useObs = () => {
  const { addLog } = useLog();
  const toast = useToast();

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
    store = await useTauriStoreLoad('obs.dat');
    const url = await store.get<string>('url');
    const password = await store.get<string>('password');
    const duration = await store.get<number>('duration');
    const targetScene = await store.get<string>('targetScene');

    if (url) state.value.url = url;
    if (password) state.value.password = password;
    if (duration) state.value.duration = duration;
    if (targetScene) state.value.targetScene = targetScene;
  };

  onMounted(initializeStore);

  const connect = async () => {
    state.value.isLoading = true;
    try {
      await obs.connect(state.value.url, state.value.password);
      state.value.isConnected = true;
      addLog('Connected to OBS.');
      showNotification('Connected to OBS', 'Successfully connected to the OBS WebSocket.');

      const data = await obs.call('GetSceneList');
      // Clear the array by setting its length to 0 (mutation)
      state.value.scenes.length = 0;
      // Push the new items into the array (mutation)
      for (const scene of data.scenes as { sceneName: string }[]) {
        state.value.scenes.push(scene.sceneName);
      }

      // Save settings on successful connection
      if (store) {
        await store.set('url', state.value.url);
        await store.set('password', state.value.password);
        await store.save();
      }
    } catch (error: any) {
      addLog(`Failed to connect to OBS: ${error.message}`);
      showNotification('Failed to connect to OBS', error.message);
    } finally {
      state.value.isLoading = false;
    }
  };

  const disconnect = async () => {
    await obs.disconnect();
    state.value.isConnected = false;
    addLog('Disconnected from OBS.');
    showNotification('Disconnected from OBS', 'The connection to the OBS WebSocket has been closed.');
  };
  
  watch(() => state.value.duration, async (duration) => {
    if (store) {
      await store.set('duration', duration);
      await store.save();
    }
  });
  
  watch(() => state.value.targetScene, async (targetScene) => {
    if (store) {
      await store.set('targetScene', targetScene);
      await store.save();
    }
  });

  const triggerSceneSwitch = async () => {
    if (!state.value.isConnected || !state.value.targetScene) {
      return;
    }

    try {
      const { currentProgramSceneName } = await obs.call('GetCurrentProgramScene');
      await obs.call('SetCurrentProgramScene', { sceneName: state.value.targetScene });
      addLog(`Switched to scene: ${state.value.targetScene}`);
      showNotification('Scene Switched', `Switched to ${state.value.targetScene}`);

      setTimeout(async () => {
        await obs.call('SetCurrentProgramScene', { sceneName: currentProgramSceneName });
        addLog(`Switched back to scene: ${currentProgramSceneName}`);
        showNotification('Scene Switched Back', `Switched back to ${currentProgramSceneName}`);
      }, state.value.duration);
    } catch (error: any) {
      addLog(`Failed to switch scene: ${error.message}`);
      showNotification('Failed to switch scene', error.message);
    }
  };

  return {
    state,
    connect,
    disconnect,
    triggerSceneSwitch
  };
};