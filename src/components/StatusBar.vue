<script lang="ts">
import { useMainStore } from '@/stores/main';
import { mapWritableState, MutationType } from 'pinia';
import { defineComponent } from 'vue';
import CheckIcon from '@/components/icons/Check.vue';
import CrossIcon from '@/components/icons/Cross.vue';
import BusyIcon from '@/components/icons/Busy.vue';

const mapper = {
	0: ['grey', 'Unavailable'],
	1: ['#ff5b5b', 'Error'],
	2: ['#22bb33', 'Success'],
	3: ['#ff5b5b', 'Fatal'],
	4: ['grey', 'Busy']
};
export default defineComponent({
	mounted() {
		this.$store.$subscribe((_) => {
			if (_.type === MutationType.patchObject) {
				if (_.payload.status) this.update(_.payload.status);
			}
		});
	},
	name: 'TableRow',
	components: { CheckIcon, CrossIcon, BusyIcon },
	methods: {
		update(val: number) {
			const [color, text] = mapper[val as keyof typeof mapper];
			const elem = this.$refs.footer as HTMLDivElement;

			elem.style.backgroundColor = color ?? 'grey';
			elem.querySelector('span')!.textContent = text ?? 'Success';
		},
		switchTable(i: MouseEvent) {
			if (!(i.target instanceof HTMLSpanElement)) return;
			if (i.target.id || !i.target.textContent || this.$store.status === 4) return;

			this.$store.$patch({ queryString: `SELECT * FROM ${i.target.textContent} LIMIT 50` });
			this.$store.exec();
		},
		tableInfo(i: MouseEvent) {
			if (!(i.target instanceof HTMLSpanElement)) return;
			if (i.target.id || !i.target.textContent || this.$store.status === 4) return;

			this.$store.$patch({ queryString: `PRAGMA table_info(${i.target.textContent})` });
			this.$store.exec();
		}
	},
	computed: {
		...mapWritableState(useMainStore, ['status'])
	}
});
</script>

<template>
	<div class="footer" ref="footer" @click="switchTable" @contextmenu.prevent="tableInfo">
		<div class="status">
			<CheckIcon v-if="status === 2" /><BusyIcon v-else-if="status === 4" /><CrossIcon
				v-else-if="[1, 3].includes(status)"
			/>
			<span id="status">Unknown</span>
		</div>
		<div class="table">
			<span v-for="[table] in $store.meta.tables" :key="table">{{ table }}</span>
		</div>
	</div>
</template>

<style scoped>
div.status,
div.table {
	align-items: center;
	display: inline-flex;
}

span #reload {
	background-color: red;
}
div.status:first-child {
	padding-left: 5px;
}
div.status {
	width: 130px;
}

div.table:first-child {
	background-color: black;
}
.table > span:hover {
	cursor: pointer;
	color: black;
	background-color: white;
}

.table > span {
	padding: 0px 7px;
}

span {
	padding: 0px 4px;
}

.footer {
	display: inline-flex;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: gray;
	transition: background-color 0.2s;
	color: white;
	overflow-y: hidden;
	overflow-x: auto;
	user-select: none;
}
</style>
