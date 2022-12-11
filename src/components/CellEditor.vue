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
            console.log(this.content)
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
	<div class="editor-container">
		<div class="container">
			<div class="title"><span>Chỉnh sửa ô</span><a @click="onClose">x</a></div>

			<div class="content-editor">
				<code class="field" contenteditable="true" placeholder="null" ref="field" v-html="highlight(content)">
				</code>
				<button :disabled="!isJsonLike(content)" @click="format(content)">Format</button>
				<button @click="onDatabaseUpdate(($refs.field as any).textContent)">Lưu</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
@import '../../node_modules/prismjs/themes/prism-funky.css';
div.editor-container {
	position: fixed;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	background-color: #999999;
	height: 50%;
	width: 50%;
	overflow: hidden;
}

.field {
	padding: 3px;
	display: flex;
	height: 100%;
	white-space: pre;
	background-color: white;
	max-height: 300px;
	overflow: auto;
}

div.content-editor {
	padding: 7px;
}

div.container {
	overflow: auto;
}

button,
button:disabled {
	margin-top: 6px;
	margin-right: 3px;
}

button:disabled {
	background-color: #b33030;
}

div.title > a {
	float: right;
}

div.title > a:hover {
	cursor: pointer;
}
div.title {
	padding: 3px;
	width: 100%;
	background-color: #555555;
	color: white;
}
</style>
