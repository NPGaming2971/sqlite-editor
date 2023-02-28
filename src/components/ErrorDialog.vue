<template>
	<QDialog class="dialog" ref="dialog" full-width full-height @hide="onDialogHide">
		<QCard class="q-dialog-plugin">
			<QCardSection class="row items-center q-pb-none">
				<div class="text-h6">{{ error.name }}</div>
				<QSpace />
                <QBtn icon="close" flat round dense v-close-popup></QBtn>
			</QCardSection>

			<QCardSection>
                Có lỗi đã xảy ra. Nhấn bên ngoài thông báo hoặc esc để đóng.
				<div class="pre"><pre>{{ message }}</pre></div>
			</QCardSection>
		</QCard>
	</QDialog>
</template>

<script lang="ts">
import { QCard, QCardSection, QDialog, QSpace, QBtn } from 'quasar';

export default {
	props: {
		error: {
			type: Error,
			required: true
		}
	},
	emits: ['ok', 'hide'],
	components: {
		QCard,
		QCardSection,
		QDialog,
		QSpace,
        QBtn
	},
	computed: {
		message() {
			return this.error?.stack;
		}
	},
	methods: {
		show() {
			//@ts-expect-error
			this.$refs.dialog.show();
		},
		hide() {
			//@ts-expect-error
			this.$refs.dialog.hide();
		},
		onDialogHide() {
			this.$emit('hide');
		},
		onOKClick() {
			this.$emit('ok');
			this.hide();
		},
		onCancelClick() {
			this.hide();
		}
	}
};
</script>
<style>
@import '@/assets/main.css';

@media (prefers-color-scheme: dark) {
	.dialog {
		color: black;
	}
}

.pre {
    overflow: auto;
}


</style>
