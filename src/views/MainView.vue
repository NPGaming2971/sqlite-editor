<script lang="ts">
import CellEditorVue from '@/components/CellEditor.vue';
import QueryInputVue from '@/components/QueryInput.vue';
import StatusBar from '@/components/StatusBar.vue';
import TableViewVue from '@/components/TableView.vue';
import { useMainStore } from '@/stores/main';
import { defineComponent } from 'vue';

export default defineComponent({
	components: { StatusBar, QueryInputVue, TableViewVue, CellEditorVue },
	mounted() {
		const main = useMainStore();
		const lastQuery = localStorage.getItem('last_query');

		if (lastQuery) main.$patch({ queryString: lastQuery });
	}
});
</script>
<template>
	<QueryInputVue></QueryInputVue>
	<TableViewVue></TableViewVue>
	<StatusBar></StatusBar>
	<CellEditorVue :hidden="true"></CellEditorVue>
</template>
<style></style>

