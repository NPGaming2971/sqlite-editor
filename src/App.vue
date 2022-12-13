<script setup lang="ts">
import { useMainStore } from './stores/main';
import MainViewVue from './views/MainView.vue';

const store = useMainStore();
store.setup();
</script>

<template>
	<MainViewVue></MainViewVue>
</template>