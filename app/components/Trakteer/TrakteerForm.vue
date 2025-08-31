<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Trakteer Connection</CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit="onSubmit">
        <section class="space-y-4" :class="{ hidden: state.isConnected }">
          <FormField v-slot="{ componentField }" name="pageId">
            <FormItem>
              <FormLabel>Page ID</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g. roffi_daijoubu"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                Your trakteer username without "@" e.g. roffi_daijoubu
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="streamApiKey">
            <FormItem>
              <FormLabel>Stream API Key</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter your Stream API Key"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                Get your trakteer stream key at
                <a
                  href="https://trakteer.id/manage/stream-settings/settings"
                  target="_blank"
                  class="text-primary"
                >
                  trakteer.id </a
                >.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        </section>

        <div class="flex w-full justify-end mt-4">
          <Button
            v-if="!state.isConnected"
            :disabled="state.isLoading"
            type="submit"
            class=""
          >
            Connect
          </Button>
          <Button
            v-else
            variant="destructive"
            :disabled="state.isLoading"
            type="button"
            class="w-full"
            @click="disconnect"
          >
            Disconnect
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// @ts-ignore
const { state, connect, disconnect } = useTrakteer();

const formSchema = toTypedSchema(
  z.object({
    pageId: z.string().min(1, { message: "Page ID is required." }).max(50),
    streamApiKey: z
      .string()
      .min(1, { message: "Stream API Key is required." })
      .max(50),
  })
);

const { handleSubmit, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    pageId: state.value.pageId,
    streamApiKey: state.value.streamApiKey,
  },
});

watch(
  () => [state.value.pageId, state.value.streamApiKey],
  ([newPageId, newStreamApiKey]) => {
    setValues({
      pageId: newPageId,
      streamApiKey: newStreamApiKey,
    });
  }
);

const onSubmit = handleSubmit((values) => {
  state.value.pageId = values.pageId;
  state.value.streamApiKey = values.streamApiKey;
  connect();
});
</script>
