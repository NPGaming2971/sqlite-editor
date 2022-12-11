<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useMainStore } from './stores/main';

const store = useMainStore();
store.setup();
</script>

<template>
	<header>
		<RouterLink to="/">Home</RouterLink>
	</header>

	<RouterView />
</template>

<style scoped></style>

