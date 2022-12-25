<script lang="ts">
import { useMainStore } from '@/stores/main';
import { isJsonLike } from '@/utils';
import { mapState } from 'pinia';
import { QInnerLoading } from 'quasar';
import { defineComponent } from 'vue';
const SPECIAL_COLUMN_NAME = ['$sqlite_editor_readonly'];

export default defineComponent({
	name: 'TableView',
	methods: {
		onCellClick(i: Event, e: any, g: number) {
			if (!(i.target instanceof HTMLTableCellElement)) return;
			if (i.target.tagName !== 'TD') return;
			if (e.$sqlite_editor_readonly) {
				this.$q.dialog({
					title: 'Lưu ý',
					message: 'Bạn không thể chỉnh sửa bảng này.',
					dark: this.$store.views.inDarkMode,
					style: {
						color: this.$store.views.inDarkMode ? 'white' : 'black'
					}
				});
				return;
			}

			const el = document.querySelector('.editor-container')! as HTMLDivElement;
			el.style.height = '100%';

			this.session.row = e;

			this.$store.$patch({
				session: {
					location: [g, i.target.cellIndex],
					content: i.target.textContent!,
					isJsonCell: isJsonLike(i.target.textContent!),
				}
			});
		}
	},
	components: { QInnerLoading },
	computed: {
		...mapState(useMainStore, ['queryString', 'session', 'status']),
		columns() {
			return Object.keys(this.$store.session.data[0] ?? []);
		},
		SPECIAL_COLUMN_NAME: () => SPECIAL_COLUMN_NAME
	}
});
</script>

<template>
	<QTable
		:rows="session.data"
		:columns="
			columns.map((i) => ({
				name: i,
				label: i,
				field: i,
				align: 'left',
				sortable: true
			}))
		"
		:loading="$store.status === 4"
		:pagination="{ rowsPerPage: 50 }"
		:dark="$store.views.inDarkMode"
		:rows-per-page-options="[0]"
		:visible-columns="columns.filter((i) => !SPECIAL_COLUMN_NAME.includes(i))"
		@row-click="onCellClick"
	>
		<template v-slot:body-cell="scope">
			<QTd :class="{ cell: true }">
				<template v-slot>{{ scope.value }}</template>
			</QTd>
		</template>
		<template v-slot:no-data>Không có dữ liệu.</template>
		<template v-slot:loading><QInnerLoading :showing="$store.status === 4" /></template>
	</QTable>
</template>

<style>
td.cell {
	max-width: 400px;
	overflow: hidden;
	text-overflow: ellipsis !important;
	white-space: nowrap !important;
	cursor: pointer;
}
</style>
