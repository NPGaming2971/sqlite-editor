<script lang="ts">
import { isJsonLike, locateCell, locateHead, parseData, tryParseJSONObject } from '@/utils';
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';
import { useMainStore } from '@/stores/main';
import { request } from '@/utils/communicator';
import { format } from 'quasar';

export default defineComponent({
	name: 'FieldEditor',
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
		async onDatabaseUpdate() {
			if (this.$store.session.isJsonCell) {
				if (!this.isJsonString(this.session.content)) {
					if (!confirm('JSON không hợp lệ.\nBạn vẫn muốn lưu chứ?')) return;
				} else this.format(this.session.content, 0);
			}

			const tableName = this.$store.tableName;
			if (!tableName) throw new Error('Unknown table.');

			const tablePrimaryKeyData = this.$store.currentTable?.primaryKey;
			if (!tablePrimaryKeyData) throw new Error('Unknown primary key.');

			const tablePrimaryKey = tablePrimaryKeyData;

			const table = document.querySelector('table.q-table') as HTMLTableElement;
			if (!table) throw new Error('Unknown table.');
			const targetId = this.$store.session.row[tablePrimaryKey];
			const currentColumnHeadCell = locateHead(table, this.session.location[1]);
			// Cell element đã click
			const cell = locateCell(table, this.$store.session.location);

			if (!currentColumnHeadCell || !cell) return;

			// Tên của cell đã click
			const columnName = currentColumnHeadCell.childNodes.item(0).textContent!;

			// Data của column này.
			const columnData = this.$store.currentTable!.columns.find((i) => i.name === columnName)!;
			const serialized = this.serialize(this.$store.session.content, columnData.type);

			const data = tryParseJSONObject(serialized as any);

			await request(`http://wamvn.net:1120/update/${tableName}/${targetId}/`, {
				method: 'PATCH',
				body: JSON.stringify({
					change: parseData({
						[columnName]: data
					})
				})
			})
				.then(() => {
					cell.textContent = data;
					this.onClose();
				})
				.catch((err) => {
					console.log(err);
					this.$store.$patch({ session: { error: err }, status: 1 });
				});
		},
		serialize(i: any, type: string) {
			switch (type) {
				case 'INTEGER':
				case 'REAL':
					return Number(i);
				case 'TEXT':
					return JSON.stringify(i);
				case 'NULL':
					return null;
				case 'BLOB':
				default:
					return new TextEncoder().encode(i);
			}
		}
	},

	computed: {
		...mapWritableState(useMainStore, ['session', 'queryString'])
	}
});
</script>

<template>
	<div class="editor-container" ref="editor">
		<div>
			<button :disabled="session.row?.$sqlite_editor_readonly" @click="onDatabaseUpdate()">Lưu</button>
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
