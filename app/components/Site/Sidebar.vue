<template>
	<Sheet :open="showSidebar" @update:open="showSidebar = false">
		<SheetContent>
			<SheetHeader>
				<SheetTitle>
					<div class="flex gap-x-3">
						<Icon name="local:logo" class="size-6" />
						<span class="uppercase">{{ name }}</span>
					</div>
				</SheetTitle>
				<SheetDescription>
					<VisuallyHidden>Description</VisuallyHidden>
				</SheetDescription>
			</SheetHeader>
			<NavigationMenu
				orientation="vertical"
				:items="items"
			/>
		</SheetContent>
	</Sheet>
</template>

<script lang="ts" setup>
	import {
		Sheet,
		SheetContent,
		SheetDescription,
		SheetHeader,
		SheetTitle,
	} from '@/components/ui/sheet'
	import {
		NavigationMenu,
	} from '@/components/ui/navigation-menu'
	const { app: { name } } = useAppConfig();
	const { pages } = usePages();
	const { showSidebar } = useSidebar();
	const tauriVersion = await useTauriAppGetTauriVersion();

	const items = ref<any[]>([
		pages,
		[
			{
				label: `v${tauriVersion}`,
				disabled: true
			}
		]
	]);
</script>
