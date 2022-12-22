<script setup lang="ts">
import { useMainStore } from './stores/main';
import MainViewVue from './views/MainView.vue';

const store = useMainStore();
store.setup();
store.session.inDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
</script>

<template>
	<MainViewVue></MainViewVue>
</template>
