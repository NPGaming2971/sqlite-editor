<script lang="ts">
import CellEditorVue from '@/components/CellEditor.vue';
import QueryInputVue from '@/components/QueryInput.vue';
import StatusBar from '@/components/StatusBar.vue';
import TableViewVue from '@/components/TableView.vue';
import ViewPagination from '@/components/ViewPagination.vue';
import { defineComponent } from 'vue';
import { QDialog, QCard, QCardSection, QBtn } from 'quasar';
import { ALLOWED_USERS, OAUTH2_LINK } from '@/utils';
import { useMainStore } from '@/stores/main';
import { MutationType } from 'pinia';
import ErrorDialog from '@/components/ErrorDialog.vue';

export default defineComponent({
	data() {
		return { authorized: false };
	},
	components: {
		StatusBar,
		QueryInputVue,
		TableViewVue,
		CellEditorVue,
		ViewPagination,
		QDialog,
		QCard,
		QCardSection,
		QBtn
	},
	setup() {
		const main = useMainStore();
		const lastQuery = localStorage.getItem('last_query');

		if (lastQuery) main.$patch({ queryString: lastQuery });
		return { store: main };
	},
	async mounted() {
		let accessToken = undefined,
			tokenType = undefined;
		//@ts-ignore
		let stored = localStorage.getItem('token_string');
		localStorage.removeItem('token_string');

		const blockAccess = () => {
			this.$q
				.dialog({
					dark: this.store.session.inDarkMode,
					title: 'Lưu ý',
					message: 'Bạn không có quyền truy cập nội dung này.',
					persistent: true,
					cancel: false,
					style: {
						color: this.store.session.inDarkMode ? 'white' : 'black'
					},
					html: true,
					ok: 'Đăng nhập'
				})
				.onOk((i) => {
					location.assign(OAUTH2_LINK);
				});
		};

		if (!stored) {
			const fragment = new URLSearchParams(window.location.hash.slice(1));
			[accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

			if (!accessToken || !tokenType) return blockAccess();
			//@ts-expect-error
			window.history.replaceState(null, null, window.location.pathname);
			stored = `${tokenType} ${accessToken}`;
		}
		const authUser = await fetch('https://discord.com/api/users/@me', {
			headers: {
				authorization: stored
			}
		})
			.then((result) => result.json())
			.catch(console.error);

		if (!authUser || !ALLOWED_USERS.includes(authUser.id)) return blockAccess();

		this.store.session.token = stored;
		this.authorized = true;
		localStorage.removeItem('token_string');

		this.store.$subscribe((_) => {
			if (_.type === MutationType.patchObject && _.payload.session?.error) {
				this.$q.dialog({
					component: ErrorDialog,
					componentProps: { error: _.payload.session.error },
				});
			}
		});

		window.onbeforeunload = () => {
			localStorage.setItem('token_string', this.store.session.token!);
		};
	}
});
</script>
<template>
	<div v-if="authorized">
		<QueryInputVue />
		<ViewPagination v-if="store.session.data.length > 1"></ViewPagination>
		<TableViewVue />
		<StatusBar />
		<CellEditorVue :hidden="true"></CellEditorVue>
	</div>
</template>
<style></style>
