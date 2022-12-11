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
	methods: {
		closePopup: function () {
			((this.$refs.editor as any).$el as HTMLElement).style.height = '0%';
		},
		openPopup: function (i: string) {
			this.text = i;
			const el = document.querySelector('.editor-container')! as HTMLDivElement;
			el.style.height = '40%';
		}
	},
	components: { StatusBar, QueryInputVue, TableViewVue, CellEditorVue }
});
</script>
<template>
	<QueryInputVue></QueryInputVue>
	<TableViewVue @dataaccess="(i) => openPopup(i)"></TableViewVue>
	<CellEditorVue ref="editor" :text="text" :hidden="true" @popupclose="closePopup"></CellEditorVue>
	<StatusBar></StatusBar>
</template>
<style></style>

