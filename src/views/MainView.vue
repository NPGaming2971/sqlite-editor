<script lang="ts">
import CellEditorVue from '@/components/CellEditor.vue';
import QueryInputVue from '@/components/QueryInput.vue';
import StatusBar from '@/components/StatusBar.vue';
import TableViewVue from '@/components/TableView.vue';
import { defineComponent } from 'vue';

export default defineComponent({
	data: () => ({
		text: ''
	}),
	components: { StatusBar, QueryInputVue, TableViewVue, CellEditorVue }
});
</script>
<template>
	<QueryInputVue></QueryInputVue>
	<TableViewVue></TableViewVue>
	<CellEditorVue ref="editor" :text="text" :hidden="true"></CellEditorVue>
	<StatusBar></StatusBar>
</template>
<style></style>

