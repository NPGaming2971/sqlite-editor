<script lang="ts">
import { useMainStore } from '@/stores/main';
import { isJsonLike } from '@/utils';
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

			const el = document.querySelector('.editor-container')! as HTMLDivElement;
			el.style.height = '100%';

			this.store.$patch({
				session: {
					//@ts-ignore
					location: [i.target.parentNode!.rowIndex, i.target.cellIndex],
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

@keyframes flash {
	0% {
		background-color: initial;
	}

	100% {
		background-color: rgba(0, 255, 128, 0.856);
	}
}

.tableview {
	overflow-y: auto;
}

table tbody tr:hover {
	background-color: rgba(255, 255, 255, 0.644);
}

table tbody tr > *:hover {
	box-shadow: 0 0 3px cyan inset;
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
