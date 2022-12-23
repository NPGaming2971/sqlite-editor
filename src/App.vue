<script setup lang="ts">
import { MutationType } from 'pinia';
import { useMainStore } from './stores/main';
import MainViewVue from './views/MainView.vue';

const store = useMainStore();
store.setup();

const media = window.matchMedia('(prefers-color-scheme: dark)');
store.session.inDarkMode = media.matches;

media.addEventListener('change', (i) => {
	store.session.inDarkMode = i.matches;
});
</script>

<template>
	<KeepAlive><MainViewVue></MainViewVue></KeepAlive>
</template>
