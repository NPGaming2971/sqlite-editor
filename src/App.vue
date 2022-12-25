<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import { useMainStore } from './stores/main';
import { execute } from './utils/communicator';
import MainViewVue from './views/MainView.vue';
const app = getCurrentInstance()!;

const store = useMainStore();
store.prepare();

app.appContext.app.config.globalProperties.$store = store;
app.appContext.app.config.globalProperties.$execute = execute

const media = window.matchMedia('(prefers-color-scheme: dark)');
store.views.inDarkMode = media.matches;

media.addEventListener('change', (i) => {
	store.views.inDarkMode = i.matches;
});
</script>

<template>
	<KeepAlive><MainViewVue></MainViewVue></KeepAlive>
</template>
