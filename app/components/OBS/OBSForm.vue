<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>OBS Connection</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit.prevent="toggleObsConnection">
        <div class="form-group" v-if="!obsState.isConnected">
          <Label for="obsUrl">OBS WebSocket URL</Label>
          <Input
            id="obsUrl"
            v-model="obsState.url"
            :disabled="obsState.isConnected"
            placeholder="ws://127.0.0.1:4455"
            class="w-full"
          />
          <p class="help-text">The URL of your OBS WebSocket server.</p>
        </div>

        <div class="form-group" v-if="!obsState.isConnected">
          <Label for="obsPassword">OBS WebSocket Password</Label>
          <Input
            id="obsPassword"
            v-model="obsState.password"
            type="password"
            :disabled="obsState.isConnected"
            placeholder="Enter your OBS WebSocket password"
            class="w-full"
          />
          <p class="help-text">
            The password for your OBS WebSocket server.
          </p>
        </div>

        <div v-if="obsState.isConnected" class="form-group">
          <Label for="duration">Scene Switch Duration (ms)</Label>
          <Input
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
          <Label for="targetScene">Target Scene</Label>
          <Select
            id="targetScene"
            v-model="obsState.targetScene"
            class="w-full"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a scene" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="scene in obsState.scenes"
                :key="scene"
                :value="scene"
              >
                {{ scene }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="help-text">
            The scene to switch to when a donation is received.
          </p>
        </div>

        <div v-if="obsState.isConnected" class="form-group">
          <Label for="targetTextSource">Target Text Source</Label>
          <Select
            id="targetTextSource"
            v-model="obsState.targetTextSource"
            class="w-full"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a text source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="source in obsState.textSources"
                :key="source"
                :value="source"
              >
                {{ source }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="help-text">
            The text source to update with the donation message.
          </p>
        </div>

        <div class="flex gap-2">
          <Button
            v-if="obsState.isConnected"
            variant="secondary"
            class="w-full"
            @click="testDonationTrigger"
          >
            Test Donation Trigger
          </Button>

          <Button
            :variant="obsState.isConnected ? 'destructive' : 'default'"
            :disabled="obsState.isLoading"
            type="submit"
            class="w-full"
          >
            {{
              obsState.isConnected ? "Disconnect from OBS" : "Connect to OBS"
            }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script lang="ts" setup>
import { useObs } from "~/composables/useObs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const {
  state: obsState,
  connect: connectObs,
  disconnect: disconnectObs,
} = useObs();

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