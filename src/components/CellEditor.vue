<script lang="ts">
import { isJsonLike } from '@/utils';
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';
import { useMainStore } from '@/stores/main';

export default defineComponent({
	name: 'FieldEditor',
	methods: {
		onClose: function () {
			const el = this.$refs.editor as HTMLDivElement;

			el.style.height = '0%';
		},
		format(t: string) {
			const formatted = JSON.stringify(JSON.parse(t), null, 4);
			this.session.content = formatted;
		},
		isJsonLike,
		onDatabaseUpdate(param: string) {
			this.session.content = param;
			console.log(this.session.content);
		},
		retrieveColumnName(column: number) {
			return document.querySelectorAll('div.tableview table th').item(column).textContent!;
		}
	},

	computed: {
		...mapWritableState(useMainStore, ['session'])
	}
});
</script>

<template>
	<div class="editor-container opened" ref="editor">
		<div>
			<button @click="onDatabaseUpdate(session.content)">Lưu</button>
			<button :disabled="!isJsonLike(session.content)" @click="format(session.content)">Format</button>
			<button @click="onClose">Đóng</button>
		</div>
		<codemirror :style="{ height: '100%' }" v-model="session.content" />
	</div>
</template>

<style scoped>
div.editor-container > div:first-of-type {
	background-color: #555555;
	text-align: left;
	padding: 3px;
}

div.editor-container > div:first-of-type > *:not(button:last-of-type) {
	margin-right: 3px;
}

button:disabled {
	background-color: #555555;
}

div.editor-container {
	position: fixed;
	width: 100%;
	display: initial;
	height: 50%;
	bottom: 0px;
	height: 0px;
	background-color: grey;
	transition: 0.09s ease-out;
	z-index: 0;
}
</style>
