const URL = {
	query: 'http://wamvn.net:1120/execute/',
	bulkQuery: 'http://wamvn.net:1120/bulkExecute/'
};

export async function execute(i: string[]): Promise<any[]>;
export async function execute(i: string): Promise<any>;
export async function execute(i: string | string[]): Promise<any | any[]> {
	if (Array.isArray(i)) {
		return await request(URL.bulkQuery, {
			method: 'POST',
			body: JSON.stringify({
				query: i
			})
		})
			.then((i) => i.json())
			.then((e) => e.data);
	} else
		return request(URL.query, { params: { query: i } }).then((i) => i.json()).then((e) => e.data);
}

export function request(
	url: string,
	i: Parameters<typeof fetch>[1] & { params?: { [key: string]: any } }
): Promise<Response> {
	let param = '';

	if (i.params && Object.keys(i.params).length) {
		param = `?${new URLSearchParams(makeCompatible(i.params))};`;
		Reflect.deleteProperty(i, 'params');
	}
	return new Promise((res, rej) => {
		fetch(url + param, {
			...i,
			headers: { 'content-type': 'application/json', ...i.headers, authorization: '1254' },
		})
			.then(async (e) => {
				if (!e.ok || [403, 400].includes(e.status)) rej((await e.json()).error);
				res(e);
			})
			.catch(rej);
	});
}
function makeCompatible(data: object) {
	const objIterable = Object.entries(data);

	const resolved: any = {};
	for (const [key, val] of objIterable) {
		Object.assign(resolved, {
			[key]: serializeDatabaseData(val)
		});
	}
	return resolved;
}

function serializeDatabaseData(data: any) {
	switch (typeof data) {
		case 'string':
		case 'number':
			return data;
		case null:
			return null;
		case 'boolean':
		case 'bigint':
			return String(data);
		case 'object':
			return JSON.stringify(data);
		default: {
			return null;
		}
	}
}
