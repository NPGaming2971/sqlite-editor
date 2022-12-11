import { defineStore } from 'pinia';
import initSqlJs, { type Database } from 'sql.js';
import { extractTables, formatDatabaseQueryResult } from '@/utils';
const SQL = await initSqlJs({
	locateFile: (url) => `https://sql.js.org/dist/${url}`
});

export const useMainStore = defineStore('main', {
	state: () => ({
		queryString: '',
		//@ts-expect-error
		database: null as Database,
		tables: [] as string[],
		status: 0,
		data: [] as object[]
	}),
	getters: {},
	actions: {
		async setup() {
			try {
				const buffer = await fetch(
					'https://cdn.discordapp.com/attachments/856125690726580224/1038305734263308328/data.sqlite'
				).then((i) => i.arrayBuffer());
				this.database = new SQL.Database(new Uint8Array(buffer));
				this.$patch({ tables: extractTables(this.database), status: 2 });
			} catch {
				this.setStatus(3);
			}
		},

		exec(sql?: string) {
			if (!this.database) throw new Error('Database unavailable.');
			try {
				const data = this.database.exec(sql ?? this.queryString);
				this.setStatus(2);
				const formatted = formatDatabaseQueryResult(data[0]);
				this.data = formatted;
				return formatted
			} catch {
				this.setStatus(1);
			}
		},

		setStatus(n: number) {
			this.$patch({ status: n })
		}
	}
});

