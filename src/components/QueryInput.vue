<script lang="ts">
import { useMainStore } from '@/stores/main';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
export default defineComponent({
	name: 'QueryInput',
	setup: () => {
		const store = useMainStore();
		return { store };
	},
	methods: {
		onQueryExecute() {
			this.store.exec();
		},
		onQueryUpdate(i: Event) {
			console.log(i)
			const elem = i.target as HTMLInputElement;
			this.store.queryString = elem.value;
			console.log(elem.value);
		}
	},

	mounted() {
		this.store.$subscribe((_, state) => {
		});
	},

	computed: {
		...mapState(useMainStore, ['queryString'])
	}
});
</script>

<template>
	<div class="controller" @keydown.ctrl.enter="onQueryExecute()">
		<span>Thanh nhập query</span>
		<div class="input-field">
			<textarea ref="text" type="text" id="queryBar" @input="(i) => onQueryUpdate(i)">{{ queryString }}</textarea>
			<button @click="onQueryExecute()">Chạy query</button>
		</div>
	</div>
</template>

<style scoped>
#queryBar {
	border-radius: 6px;
	padding: 10px;
	table-layout: fixed;
	max-height: 150px;
	width: 80%;
	font: 16px / normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
	margin: 0px 5px 0px 0px;
}

.input-field {
	display: flex;
}

textarea {
	resize: none;
	height: min-content;
}

.controller {
	width: 100%;
	height: 20%;
	background-color: grey;
	padding: 9px;
}
</style>
