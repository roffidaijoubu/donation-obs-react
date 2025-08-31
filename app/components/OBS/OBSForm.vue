<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>OBS Connection</CardTitle>
    </CardHeader>
    <CardContent>
      <form  @submit="onSubmit">
        <section class="space-y-4" :class="{ hidden: obsState.isConnected }">
          <FormField v-slot="{ componentField }" name="url">
            <FormItem>
              <FormLabel>OBS WebSocket URL</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="ws://127.0.0.1:4455"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                The URL of your OBS WebSocket server.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>OBS WebSocket Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your OBS WebSocket password"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                The password for your OBS WebSocket server.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        </section>

        <section class="space-y-4" :class="{ 'hidden': !obsState.isConnected }">
          <FormField v-slot="{ componentField }" name="duration">
            <FormItem>
              <FormLabel>Scene Switch Duration (ms)</FormLabel>
              <FormControl>
                <Input type="number" v-bind="componentField" />
              </FormControl>
              <FormDescription>
                How long to stay on the target scene before switching back (in
                milliseconds). Set to 0 for an indefinite switch.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="targetScene">
            <FormItem>
              <FormLabel>Target Scene</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scene" />
                  </SelectTrigger>
                </FormControl>
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
              <FormDescription>
                The scene to switch to when a donation is received.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="targetTextSource">
            <FormItem>
              <FormLabel>Target Text Source</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a text source" />
                  </SelectTrigger>
                </FormControl>
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
              <FormDescription>
                The text source to update with the donation message.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        </section>

        <div class="flex gap-2 mt-4 justify-end">
          <Button
            v-if="obsState.isConnected"
            variant="secondary"
            class=""
            type="button"
            @click="testDonationTrigger"
          >
            Test Donation Trigger
          </Button>

          <Button
            v-if="!obsState.isConnected"
            :disabled="obsState.isLoading"
            type="submit"
            class=""
          >
            Connect to OBS
          </Button>
          <Button
            v-else
            variant="destructive"
            :disabled="obsState.isLoading"
            type="button"
            class=""
            @click="disconnectObs"
          >
            Disconnect from OBS
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { useObs } from '~/composables/useObs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const {
  state: obsState,
  connect: connectObs,
  disconnect: disconnectObs,
  triggerSceneSwitch,
  updateTextSource,
} = useObs()

const formSchema = toTypedSchema(
  z.object({
    url: z.string().min(1, { message: 'OBS WebSocket URL is required.' }),
    password: z.string().optional(),
    duration: z.number(),
    targetScene: z.string().optional(),
    targetTextSource: z.string().optional(),
  })
)

const { handleSubmit, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    url: obsState.value.url,
    password: obsState.value.password,
    duration: obsState.value.duration,
    targetScene: obsState.value.targetScene,
    targetTextSource: obsState.value.targetTextSource,
  },
})

watch(
  () => [
    obsState.value.url,
    obsState.value.password,
    obsState.value.duration,
    obsState.value.targetScene,
    obsState.value.targetTextSource,
  ],
  ([newUrl, newPassword, newDuration, newTargetScene, newTargetTextSource]) => {
    setValues({
      url: String(newUrl),
      password: String(newPassword),
      duration: Number(newDuration),
      targetScene: String(newTargetScene),
      targetTextSource: String(newTargetTextSource),
    })
  }
)

const onSubmit = handleSubmit((values) => {
  obsState.value.url = values.url
  obsState.value.password = values.password || ''
  connectObs()
})

function testDonationTrigger() {
  updateTextSource('Test donation from Roo!')
  triggerSceneSwitch()
}
</script>