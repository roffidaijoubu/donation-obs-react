<template>
    <div class="max-w-screen flex gap-5 py-2">
      <TrakteerForm />
      <OBSForm />
    </div>
    <div class="mt-2 w-full">
      <h2 class="text-lg font-semibold mb-2">Logs</h2>
      <Card>
        <CardContent class="h-64 overflow-y-auto p-2 font-mono text-sm">
          <p v-for="(log, index) in logState.logs" :key="index">
            {{ log }}
          </p>
        </CardContent>
      </Card>
    </div>
</template>

<script lang="ts" setup>
import { useLog } from '~/composables/useLog';
import { Card, CardContent } from '@/components/ui/card'
import TrakteerForm from '~/components/Trakteer/TrakteerForm.vue';
import OBSForm from '~/components/OBS/OBSForm.vue';

const { state: logState } = useLog();
</script>
