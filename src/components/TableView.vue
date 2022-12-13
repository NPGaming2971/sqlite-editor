<script lang="ts">
import { useMainStore } from '@/stores/main';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
export default defineComponent({
	name: 'TableView',
	setup() {
		const store = useMainStore();

		return { store };
	},
	methods: {
		onCellClick(i: MouseEvent) {
			if (!(i.target instanceof HTMLTableCellElement)) return;
			if (i.target.tagName !== 'TD') return;

			const el = document.querySelector('.editor-container')! as HTMLDivElement
			el.style.height = '40%'

			this.store.$patch({
				session: {
					location: [i.target.closest('tr')!.rowIndex, i.target.cellIndex],
					content: i.target.textContent!
				}
			});
		}
	},
	computed: {
		...mapState(useMainStore, ['queryString', 'data']),
		columns() {
			//@ts-ignore
			return Object.keys(this.data[0] ?? []);
		}
	}
});
</script>

<template>
	<div class="tableview">
		<table @click="(i) => onCellClick(i)">
			<thead>
				<tr>
					<th v-for="column in columns" :key="column">{{ column }}</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="obj in data">
					<td v-for="val in Object.values(obj)">{{ val }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style scoped>
table > thead > * > th {
	font-weight: bold;
	cursor: pointer;
	border-bottom: 2px solid #ddd;
}

.tableview {
	overflow-y: auto;
}

table > * > * > th,
tr > td {
	border: 1px solid #ddd;
	padding: 5px;
	font-size: 15px;
	max-width: 200px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	cursor: pointer;
}

table {
	border-collapse: collapse;
	overflow: hidden;
	height: max-content;
	width: 100%;
	height: 100%;
	overflow-x: auto;
}
</style>
