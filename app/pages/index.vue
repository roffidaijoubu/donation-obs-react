<template>
    <div class="max-w-screen flex gap-5 py-2">
      <UCard class="w-full">
        <h2 class="text-xl font-bold mb-4">Trakteer Connection</h2>
        <UForm :state="state" class="space-y-4" @submit="toggleConnection">
          <div class="form-group" v-if="!state.isConnected">
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

          <div class="form-group" v-if="!state.isConnected">
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

      <UCard class="w-full">
        <h2 class="text-xl font-bold mb-4">OBS Connection</h2>
        <UForm
          :state="obsState"
          class="space-y-4"
          @submit="toggleObsConnection"
        >
          <div class="form-group" v-if="!obsState.isConnected">
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

          <div class="form-group" v-if="!obsState.isConnected">
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
              milliseconds). Set to 0 for an indefinite switch.
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

          <div v-if="obsState.isConnected" class="form-group">
            <label for="targetTextSource">Target Text Source</label>
            <USelect id="targetTextSource" v-model="obsState.targetTextSource" :items="obsState.textSources" class="w-full" />
            <p class="help-text">
              The text source to update with the donation message.
            </p>
          </div>

          <div class="flex gap-2">
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
          </div>
        </UForm>
      </UCard>
    </div>
    <div class="mt-2 w-full">
      <h2 class="text-lg font-semibold mb-2">Logs</h2>
      <UCard>
        <div class="h-64 overflow-y-auto p-2 font-mono text-sm">
          <p v-for="(log, index) in logState.logs" :key="index">
            {{ log }}
          </p>
        </div>
      </UCard>
    </div>
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
  const { triggerSceneSwitch, updateTextSource } = useObs();
  updateTextSource('Test donation from Roo!');
  triggerSceneSwitch();
}
</script>
