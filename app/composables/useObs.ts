import { z } from 'zod';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import OBSWebSocket, { type OBSResponseTypes } from 'obs-websocket-js';
import { Store } from '@tauri-apps/plugin-store';

const obsStateSchema = z.object({
  url: z.string().default('ws://127.0.0.1:4455'),
  password: z.string().default(''),
  duration: z.number().default(5),
  isConnected: z.boolean().default(false),
  isLoading: z.boolean().default(false),
  scenes: z.array(z.string()).default([]),
  targetScene: z.string().optional(),
  textSources: z.array(z.string()).default([]),
  targetTextSource: z.string().optional()
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
    const targetTextSource = await store.get<string>('targetTextSource');
    if (targetTextSource) state.value.targetTextSource = targetTextSource;
  };

  onMounted(initializeStore);

  const connect = async () => {
    state.value.isLoading = true;
    try {
      await obs.connect(state.value.url, state.value.password);
      state.value.isConnected = true;
      addLog('Connected to OBS.');
      showNotification('Connected to OBS', 'Successfully connected to the OBS WebSocket.');

      const { scenes } = await obs.call('GetSceneList') as OBSResponseTypes['GetSceneList'];
      state.value.scenes.length = 0;
      for (const scene of scenes) {
        if (scene.sceneName) {
          state.value.scenes.push(String(scene.sceneName));
        }
      }

      const { inputKinds } = await obs.call('GetInputKindList') as OBSResponseTypes['GetInputKindList'];
      state.value.textSources.length = 0;

      if (inputKinds) {
        for (const kind of inputKinds) {
          if (kind && kind.toLowerCase().includes('text')) {
            const { inputs } = await obs.call('GetInputList', { inputKind: kind }) as OBSResponseTypes['GetInputList'];
            if (inputs) {
              for (const input of inputs) {
                if (input.inputName) {
                  state.value.textSources.push(String(input.inputName));
                }
              }
            }
          }
        }
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

  watch(() => state.value.targetTextSource, async (targetTextSource) => {
    if (store) {
      await store.set('targetTextSource', targetTextSource);
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

      if (state.value.duration > 0) {
        setTimeout(async () => {
          await obs.call('SetCurrentProgramScene', { sceneName: currentProgramSceneName });
          addLog(`Switched back to scene: ${currentProgramSceneName}`);
          showNotification('Scene Switched Back', `Switched back to ${currentProgramSceneName}`);
        }, state.value.duration);
      }
    } catch (error: any) {
      addLog(`Failed to switch scene: ${error.message}`);
      showNotification('Failed to switch scene', error.message);
    }
  };

  const updateTextSource = async (text: string) => {
    if (!state.value.isConnected || !state.value.targetTextSource) {
      return;
    }

    try {
      await obs.call('SetInputSettings', {
        inputName: state.value.targetTextSource,
        inputSettings: {
          text
        }
      });
    } catch (error: any) {
      showNotification('Failed to update text source', error.message);
    }
  };

  return {
    state,
    connect,
    disconnect,
    triggerSceneSwitch,
    updateTextSource
  };
};