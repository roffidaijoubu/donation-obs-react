<template>
	<div>
		<SiteNavbar class="sticky bg-background/75 backdrop-blur" />
		<SiteSidebar />

		<div class="container mx-auto px-4">
			<slot />
		</div>
	</div>
</template>
