<script lang="ts">
import { formatDatabaseQueryResult, isJsonLike } from '@/utils';
import { defineComponent } from 'vue';
import { mapState, mapWritableState } from 'pinia';
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
			const column = this.retrieveColumn(this.session.location[1]);

			const tableName = this.queryString.match(/(?<=from|join)\s+(\w+)/gi)?.at(0);
			if (!tableName) throw new Error('Unknown table.');
			const store = useMainStore();
			//@ts-ignore
			const table = formatDatabaseQueryResult(store.database.exec(`PRAGMA table_info(${tableName})`)![0])?.find(
				//@ts-ignore
				(i) => i.pk === 1
			);

			const determineTarget = Array.from(document.querySelectorAll('div.tableview table th')).findIndex(
				//@ts-ignore
				(i) => i.textContent === table.name
			);

			const content = document.querySelector(
				`div.tableview > table > tbody > tr:nth-child(${this.session.location[0]}) > td:nth-child(${
					determineTarget + 1
				})`
			)!.textContent!;

			const preparedStatement = store.database.prepare(
				//@ts-expect-error
				`UPDATE ${tableName} SET ${column.textContent!} = ? WHERE ${table.name} = ?`
			);
			preparedStatement.bind([this.session.content, content]);

			console.log(preparedStatement.get());
			console.log(store.database.getRowsModified());

			console.log(
				`UPDATE ${tableName} SET ${column.textContent!} = '${this.session.content}' WHERE ${
					//@ts-ignore
					table.name
				} = ${content}`
			);

			preparedStatement.free();
			preparedStatement.freemem();
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
	transition: 0.1s ease;
	z-index: 0;
}
</style>
