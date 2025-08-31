<template>
	<div class="grid place-items-center py-12 md:py-24">
		<div class="flex flex-col items-center gap-y-4 md:gap-y-8">
			<p class="text-green-500 font-semibold">
				404
			</p>
			<div class="text-center space-y-3">
				<h1 class="text-3xl font-bold tracking-tight" sm="text-5xl">
					Page not found
				</h1>
				<p class="text-base text-muted-foreground leading-7">
					Sorry, we couldn't find the page you're looking for.
				</p>
			</div>
			<Button as-child variant="outline" size="lg">
				<NuxtLink to="/"> Go home </NuxtLink>
			</Button>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { Button } from '@/components/ui/button'
	definePageMeta({
		layout: "blank" as any
	});
</script>
