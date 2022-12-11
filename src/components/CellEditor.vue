<script lang="ts">
import { isJsonLike } from '@/utils';
import { defineComponent, type PropType } from 'vue';
import { highlight, languages } from 'prismjs';
import 'prismjs/themes/prism.css';

export default defineComponent({
	name: 'FieldEditor',
	emits: ['popupclose'],
	data() {
		return { content: '' };
	},
	props: {
		text: {
			type: String,
			default: ''
		},
		position: {
			type: Array as unknown as PropType<[number, number]>,
			default: []
		},
		tableName: {
			type: String
		}
	},
	methods: {
		onClose: function () {
			this.$emit('popupclose');
		},
		format(t: string) {
			const formatted = JSON.stringify(JSON.parse(t), null, 4);
			this.content = formatted;
		},
		isJsonLike,
		onDatabaseUpdate(param: string) {
			this.content = param;
			console.log(this.content);
		},
		retrieveColumnName(column: number) {
			return document.querySelectorAll('div.tableview table th').item(column).textContent!;
		},
		highlight(i: string) {
			return highlight(i, languages.javascript, 'javascript');
		}
	},
	watch: {
		text(val) {
			this.content = val;
		}
	}
});
</script>

<template>
	<div class="editor-container" ref="editor">
		<div @click="onClose">[x]</div>
		{{ text }}
	</div>
</template>

<style scoped>
div.editor-container > div {
	background-color: #555555;
}
div.editor-container {
	position: fixed;
	width: 100%;
    display: initial;
	text-align: center;
	bottom: 0px;
	background-color: grey;
	transition: 0.09s ease-out;
}
</style>
