<template>
	<header class="top-0 z-10">
		<div class="container mx-auto px-4 md:py-2">
			<NavigationMenu :items="mobileItems" class="md:hidden" />
			<NavigationMenu :items="desktopItems" class="hidden md:flex" />
		</div>
	</header>
</template>

<script lang="ts" setup>
	import {
		NavigationMenu,
	} from '@/components/ui/navigation-menu'
	const { pages } = usePages();
	const { showSidebar } = useSidebar();
	const tauriVersion = await useTauriAppGetTauriVersion();

	const mobileItems = ref<any[]>([
		[
			{
				avatar: {
					icon: "local:logo",
					size: "xl",
					ui: {
						root: "bg-transparent"
					}
				},
				to: "/"
			}
		],
		[
			{
				icon: "lucide:menu",
				onSelect: () => showSidebar.value = true
			}
		]
	]);

	const desktopItems = ref<any[]>([
		[
			{
				avatar: {
					icon: "local:logo",
					size: "3xl",
					ui: {
						root: "group bg-transparent",
						icon: "opacity-70 group-hover:opacity-100"
					}
				},
				to: "/"
			}
		],
		pages,
		[
			{
				label: `v${tauriVersion}`,
				disabled: true
			}
		]
	]);
</script>
