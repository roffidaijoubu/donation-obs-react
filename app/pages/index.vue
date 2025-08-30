<template>
  <UContainer class="py-8">
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold mb-4">
        Trakteer Connection
      </h1>
      <UCard>
        <UForm :state="state" class="flex flex-col gap-4" @submit="toggleConnection">
          <UFormGroup label="Page ID" name="pageId" help='Your trakteer username without "@" e.g. roffi_daijoubu'>
            <UInput v-model="state.pageId" :disabled="isConnected" placeholder="e.g. roffi_daijoubu" class="w-full" />
          </UFormGroup>

          <UFormGroup label="Stream API Key" name="streamApiKey">
            <template #help>
              Get your trakteer stream key at
              <ULink
                to="https://trakteer.id/manage/stream-settings/settings"
                external
                target="_blank"
                class="text-primary"
              >
                trakteer.id
              </ULink>.
            </template>
            <UInput v-model="state.streamApiKey" type="password" :disabled="isConnected" placeholder="Enter your Stream API Key" class="w-full" />
          </UFormGroup>

          <UButton :color="isConnected ? 'error' : 'primary'" :loading="isLoading" type="submit" block>
            {{ isConnected ? 'Disconnect' : 'Connect' }}
          </UButton>
        </UForm>
      </UCard>

      <div v-if="logs.length > 0" class="mt-8">
        <h2 class="text-lg font-semibold mb-2">
          Logs
        </h2>
        <UCard>
          <div class="h-64 overflow-y-auto p-2 font-mono text-sm">
            <p v-for="(log, index) in logs" :key="index">
              {{ log }}
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
const state = reactive({
  pageId: '',
  streamApiKey: ''
});

const logs = ref<string[]>([]);
const isConnected = ref(false);
const isLoading = ref(false);
let abortController: AbortController | null = null;

function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push(`[${timestamp}] ${message}`);
}

async function connect() {
  if (!state.pageId || !state.streamApiKey) {
    addLog('Error: Page ID and Stream API Key are required.');
    return;
  }

  isLoading.value = true;
  addLog('Connecting to Trakteer...');
  abortController = new AbortController();

  try {
    const response = await fetch('/api/trakteer/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pageId: state.pageId,
        streamApiKey: state.streamApiKey
      }),
      signal: abortController.signal
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || 'Failed to connect');
    }

    isConnected.value = true;
    isLoading.value = false;

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get stream reader');
    }

    const decoder = new TextDecoder();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
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
      addLog('Connection aborted by user.');
    } else {
      addLog(`Error: ${error.message}`);
    }
    disconnect();
  } finally {
    isLoading.value = false;
  }
}

function disconnect() {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  isConnected.value = false;
  const lastLog = logs.value[logs.value.length - 1];
  if (lastLog && !lastLog.includes('Disconnected')) {
    addLog('Disconnected.');
  }
}

function toggleConnection() {
  if (isConnected.value) {
    disconnect();
  } else {
    connect();
  }
}

onUnmounted(() => {
  disconnect();
});
</script>
