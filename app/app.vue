<script lang="ts" setup>
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
	<Html class="overflow-x-hidden dark">
		<Body class="font-sans antialiased">
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
			<Toaster />
		</Body>
	</Html>
</template>
