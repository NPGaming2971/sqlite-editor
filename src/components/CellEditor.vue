<script lang="ts">
import { isJsonLike } from '@/utils';
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';
import { useMainStore } from '@/stores/main';

export default defineComponent({
	name: 'FieldEditor',
	setup() {
		return { store: useMainStore() };
	},
	methods: {
		onClose: function () {
			const el = this.$refs.editor as HTMLDivElement;

			el.style.height = '0%';
		},
		format(t: string, i: number = 4) {
			const formatted = JSON.stringify(JSON.parse(t), null, i);
			this.session.content = formatted;
		},
		isJsonLike,
		isJsonString(str: string) {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		},
		onDatabaseUpdate() {
			if (this.store.session.isJsonCell) {
				if (!this.isJsonString(this.session.content)) {
					if (!confirm('JSON không hợp lệ.\nBạn vẫn muốn lưu chứ?')) return;
				} else this.format(this.session.content, 0);
			}

			const column = this.retrieveColumn(this.session.location[1]);

			const tableName = this.queryString.match(/(?<=from|join)\s+(\w+)/gi)?.at(0);
			if (!tableName) throw new Error('Unknown table.');
			const table = this.store.table()!.find(
				//@ts-ignore
				(i) => i.pk === 1
			);

			const determineTarget = Array.from(document.querySelectorAll('div.tableview table th')).findIndex(
				//@ts-ignore
				(i) => i.textContent === table.name
			);

			const row = document.querySelector(
				`div.tableview > table > tbody > tr:nth-child(${this.session.location[0]})`
			)! as HTMLTableRowElement;

			const serialize = (i: any, type: any) => {
				type = type.toLowerCase();
				if (type === 'number') return Number(i);
				return i;
			};

			const el = row.children.item(determineTarget);
			const content = el!.textContent!;

			const serialized = serialize(
				this.session.content,
				//@ts-ignore
				this.store.table().find((i) => i.name === column.textContent).type
			);

			this.store.exec(
				`UPDATE ${tableName} SET ${column.textContent!} = ${
					typeof serialized === 'number' ? serialized : `'${serialized}'`
				} WHERE ${table.name} = '${content}'`,
				true
			);

			row.children.item(this.session.location[1])!.textContent = String(serialized);

			this.onClose();
		},
		retrieveColumn(columnLoc: number) {
			return document.querySelectorAll('div.tableview table th').item(columnLoc);
		},
		retrieveRow() {}
	},

	computed: {
		...mapWritableState(useMainStore, ['session', 'queryString'])
	}
});
</script>

<template>
	<div class="editor-container" ref="editor">
		<div>
			<button @click="onDatabaseUpdate()">Lưu</button>
			<button :disabled="!session.isJsonCell" @click="format(session.content)">Format</button>
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
	transition: 0.1s ease;
	z-index: 0;
}
</style>
