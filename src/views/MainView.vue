<script lang="ts">
import CellEditorVue from '@/components/CellEditor.vue';
import QueryInputVue from '@/components/QueryInput.vue';
import StatusBar from '@/components/StatusBar.vue';
import TableViewVue from '@/components/TableView.vue';
import ViewPagination from '@/components/ViewPagination.vue';
import { defineComponent } from 'vue';
import { QDialog, QCard, QCardSection, QBtn } from 'quasar';
import { ALLOWED_USERS } from '@/utils';
import { useMainStore } from '@/stores/main';

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
		return { session: main.session };
	},
	async mounted() {
		let accessToken = undefined,
			tokenType = undefined;
		//@ts-ignore
		let stored = localStorage.getItem('token_string');

		const blockAccess = () => {
			this.$q.dialog({
				dark: this.session.inDarkMode,
				title: 'Lưu ý',
				message:
					'Bạn không có quyền truy cập nội dung này.<br>Nhấn vào link <a href="https://discord.com/oauth2/authorize?client_id=891163758351745044&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2F&response_type=token&scope=identify">này<a/> để đăng nhập.',
				persistent: true,
				cancel: false,
				ok: false,
				style: {
					color: this.session.inDarkMode ? 'white' : 'black'
				},
				html: true
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

		this.session.token = stored;
		this.authorized = true;

		window.onbeforeunload = () => {
			localStorage.setItem('token_string', this.session.token!);
		};
	}
});
</script>
<template>
	<div v-if="authorized">
		<QueryInputVue></QueryInputVue>
		<ViewPagination v-if="session.data.length > 1"></ViewPagination>
		<KeepAlive><TableViewVue /></KeepAlive>
		<KeepAlive><StatusBar /></KeepAlive>
		<CellEditorVue :hidden="true"></CellEditorVue>
	</div>
</template>
<style></style>
