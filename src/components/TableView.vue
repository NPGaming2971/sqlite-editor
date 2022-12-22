<script lang="ts">
import { useMainStore } from '@/stores/main';
import { isJsonLike } from '@/utils';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
const SPECIAL_COLUMN_NAME = ['$sqlite_editor_readonly']

export default defineComponent({
	name: 'TableView',
	setup() {
		const store = useMainStore();

		return { store };
	},
	methods: {
		onCellClick(i: Event, e: any, g: number) {
			if (!(i.target instanceof HTMLTableCellElement)) return;
			if (i.target.tagName !== 'TD') return;
			if (e.$sqlite_editor_readonly) return;

			const el = document.querySelector('.editor-container')! as HTMLDivElement;
			el.style.height = '100%';

			console.log([g, i.target.cellIndex])

			this.store.$patch({
				session: {
					//@ts-ignore
					location: [g, i.target.cellIndex],
					content: i.target.textContent!,
					isJsonCell: isJsonLike(i.target.textContent!)
				}
			});
		}
	},
	computed: {
		...mapState(useMainStore, ['queryString', 'data']),
		columns() {
			//@ts-ignore
			return Object.keys(this.data[0] ?? []);
		},
		SPECIAL_COLUMN_NAME: () => SPECIAL_COLUMN_NAME,
	}
});
</script>

<template>
	<QTable
		:rows="data"
		:columns="columns.map((i) => ({ name: i, label: i, field: i, align: 'left', sortable: true }))"
		:pagination="{ rowsPerPage: 50 }"
		:dark="store.session.inDarkMode"
		:rows-per-page-options="[0]"
		:visible-columns="columns.filter(i => !SPECIAL_COLUMN_NAME.includes(i))"
		@row-click="onCellClick"
	>
		<template v-slot:body-cell="scope">
			<QTd :class="{ cell: true }">
				<template v-slot>{{ scope.value }}</template>
			</QTd>
		</template>
		<template v-slot:no-data>Không có dữ liệu.</template>
	</QTable>
</template>

<style>
td.cell {
	max-width: 400px;
	overflow: hidden;
	text-overflow: ellipsis;
	text-overflow: ellipsis !important;
	white-space: nowrap !important;
	cursor: pointer;
}
</style>
