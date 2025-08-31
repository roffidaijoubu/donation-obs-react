<template>
  <UContainer class="py-8">
    <div class="max-w-xl flex gap-5">
      <UCard class="w-full shrink-0">
        <h2 class="text-xl font-bold mb-4">Trakteer Connection</h2>
        <UForm :state="state" class="space-y-4" @submit="toggleConnection">
          <div class="form-group">
            <label for="pageId">Page ID</label>
            <UInput
              id="pageId"
              v-model="state.pageId"
              :disabled="state.isConnected"
              placeholder="e.g. roffi_daijoubu"
              class="w-full"
            />
            <p class="help-text">
              Your trakteer username without "@" e.g. roffi_daijoubu
            </p>
          </div>

          <div class="form-group">
            <label for="streamApiKey">Stream API Key</label>
            <UInput
              id="streamApiKey"
              v-model="state.streamApiKey"
              type="password"
              :disabled="state.isConnected"
              placeholder="Enter your Stream API Key"
              class="w-full"
            />
            <p class="help-text">
              Get your trakteer stream key at
              <ULink
                to="https://trakteer.id/manage/stream-settings/settings"
                external
                target="_blank"
                class="text-primary"
              >
                trakteer.id </ULink
              >.
            </p>
          </div>

          <UButton
            :color="state.isConnected ? 'error' : 'primary'"
            :loading="state.isLoading"
            type="submit"
            block
          >
            {{ state.isConnected ? "Disconnect" : "Connect" }}
          </UButton>
        </UForm>
      </UCard>

      <UCard class="w-full shrink-0">
        <h2 class="text-xl font-bold mb-4">OBS Connection</h2>
        <UForm
          :state="obsState"
          class="space-y-4"
          @submit="toggleObsConnection"
        >
          <div class="form-group">
            <label for="obsUrl">OBS WebSocket URL</label>
            <UInput
              id="obsUrl"
              v-model="obsState.url"
              :disabled="obsState.isConnected"
              placeholder="ws://127.0.0.1:4455"
              class="w-full"
            />
            <p class="help-text">The URL of your OBS WebSocket server.</p>
          </div>

          <div class="form-group">
            <label for="obsPassword">OBS WebSocket Password</label>
            <UInput
              id="obsPassword"
              v-model="obsState.password"
              type="password"
              :disabled="obsState.isConnected"
              placeholder="Enter your OBS WebSocket password"
              class="w-full"
            />
            <p class="help-text">The password for your OBS WebSocket server.</p>
          </div>

          <div v-if="obsState.isConnected" class="form-group">
            <label for="duration">Scene Switch Duration (ms)</label>
            <UInput
              id="duration"
              v-model.number="obsState.duration"
              type="number"
              class="w-full"
            />
            <p class="help-text">
              How long to stay on the target scene before switching back (in
              milliseconds).
            </p>
          </div>

          <div v-if="obsState.isConnected" class="form-group">
            <label for="targetScene">Target Scene</label>
            <USelect
              id="targetScene"
              v-model="obsState.targetScene"
              :items="obsState.scenes"
              class="w-full"
            />
            <p class="help-text">
              The scene to switch to when a donation is received.
            </p>
          </div>

          <UButton
            v-if="obsState.isConnected"
            color="secondary"
            block
            @click="testDonationTrigger"
          >
            Test Donation Trigger
          </UButton>

          <UButton
            :color="obsState.isConnected ? 'error' : 'primary'"
            :loading="obsState.isLoading"
            type="submit"
            block
          >
            {{
              obsState.isConnected ? "Disconnect from OBS" : "Connect to OBS"
            }}
          </UButton>
        </UForm>
      </UCard>
    </div>
    <div class="mt-8 w-full">
      <h2 class="text-lg font-semibold mb-2">Logs</h2>
      <UCard>
        <div class="h-64 overflow-y-auto p-2 font-mono text-sm">
          <p v-for="(log, index) in logState.logs" :key="index">
            {{ log }}
          </p>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
import { useObs } from "~/composables/useObs";

import { useLog } from '~/composables/useLog';

// @ts-ignore
const { state, connect, disconnect } = useTrakteer();
const {
  state: obsState,
  connect: connectObs,
  disconnect: disconnectObs,
} = useObs();
const { state: logState } = useLog();

function toggleConnection() {
  if (state.value.isConnected) {
    disconnect();
  } else {
    connect();
  }
}

function toggleObsConnection() {
  if (obsState.value.isConnected) {
    disconnectObs();
  } else {
    connectObs();
  }
}

function testDonationTrigger() {
  const { triggerSceneSwitch } = useObs();
  triggerSceneSwitch();
}
</script>
