import type { useMainStore } from '@/stores/main';
import type { execute } from './communicator';

export interface TableColumnPragma {
	cid: number;
	name: string;
	type: string;
	notnull: 0 | 1;
	dflt_value: any;
	pk: 0 | 1;
}

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$store: ReturnType<typeof useMainStore>;
		$execute: typeof execute
	}
}

export {};
