<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Trakteer Connection</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit.prevent="toggleConnection">
        <div class="form-group" v-if="!state.isConnected">
          <Label for="pageId">Page ID</Label>
          <Input
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
          <Label for="streamApiKey">Stream API Key</Label>
          <Input
            id="streamApiKey"
            v-model="state.streamApiKey"
            type="password"
            :disabled="state.isConnected"
            placeholder="Enter your Stream API Key"
            class="w-full"
          />
          <p class="help-text">
            Get your trakteer stream key at
            <a
              href="https://trakteer.id/manage/stream-settings/settings"
              target="_blank"
              class="text-primary"
            >
              trakteer.id
            </a>.
          </p>
        </div>

        <Button
          :variant="state.isConnected ? 'destructive' : 'default'"
          :disabled="state.isLoading"
          type="submit"
          class="w-full"
        >
          {{ state.isConnected ? "Disconnect" : "Connect" }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>

<script lang="ts" setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// @ts-ignore
const { state, connect, disconnect } = useTrakteer();

function toggleConnection() {
  if (state.value.isConnected) {
    disconnect();
  } else {
    connect();
  }
}
</script>