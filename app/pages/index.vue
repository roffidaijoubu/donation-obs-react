<template>
  <UContainer class="py-8">
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold mb-4">
        Trakteer Connection
      </h1>
      <UCard>
        <UForm :state="state" class="space-y-4" @submit="toggleConnection">
          <UFormGroup label="Page ID" name="pageId" help='Your trakteer username without "@" e.g. roffi_daijoubu'>
            <UInput v-model="state.pageId" :disabled="state.isConnected" placeholder="e.g. roffi_daijoubu" class="w-full" />
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
            <UInput v-model="state.streamApiKey" type="password" :disabled="state.isConnected" placeholder="Enter your Stream API Key" class="w-full" />
          </UFormGroup>

          <UButton :color="state.isConnected ? 'error' : 'primary'" :loading="state.isLoading" type="submit" block>
            {{ state.isConnected ? 'Disconnect' : 'Connect' }}
          </UButton>
        </UForm>
      </UCard>

      <div v-if="state.logs.length > 0" class="mt-8">
        <h2 class="text-lg font-semibold mb-2">
          Logs
        </h2>
        <UCard>
          <div class="h-64 overflow-y-auto p-2 font-mono text-sm">
            <p v-for="(log, index) in state.logs" :key="index">
              {{ log }}
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
const { state, connect, disconnect } = useTrakteer();

function toggleConnection() {
  if (state.value.isConnected) {
    disconnect();
  } else {
    connect();
  }
}
</script>
