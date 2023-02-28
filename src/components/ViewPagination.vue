<script lang="ts">
import { useMainStore } from '@/stores/main';
import { mapWritableState } from 'pinia';
import { QInnerLoading } from 'quasar';
import { defineComponent } from 'vue';

export default defineComponent({
	setup() {
		return { store: useMainStore() };
	},
	methods: {
		next() {
			if (this.$store.status === 4) return;
			this.session.index++;

			this.$store.exec();
		},
		previous() {
			if (this.$store.status === 4) return;
			this.session.index--;

			this.$store.exec();
		},
		input() {
			if (this.$store.status === 4) return;
			const result = prompt('Nhập số trang muốn đi tới:');
			if (!result) return;

			const i = Number(result);
			if (!Number.isSafeInteger(i)) return alert('Số yêu cầu là số nguyên dương.');

			let [min, max] = [1, this.session.maxIndex];

			if (i < min || i > max) return alert(`Số phải nằm trong khoảng ${min}-${max}.`);
			this.session.index = i - 1;
			this.$store.exec();
		}
	},
	computed: {
		...mapWritableState(useMainStore, ['session'])
	},
	components: {
		QInnerLoading
	}
});
</script>

<style scoped>
.pagination_row {
	background-color: black;
	align-items: center;
	text-align: center;
}

.pagination_row > * {
	margin: 5px;
	display: inline-block;
}
</style>

<template>
	<div class="pagination_row">
		<button @click="previous" :disabled="session.index <= 0">Trước</button>
		<pre @click="input">{{ session.index + 1 }} / {{ session.maxIndex }}</pre>
		<button :disabled="session.index + 1 >= session.maxIndex" @click="next">Tiếp</button>
	</div>
</template>
