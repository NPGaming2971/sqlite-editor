import { createApp } from 'vue';
import { createPinia } from 'pinia';

import { defaultKeymap, historyKeymap, history } from '@codemirror/commands';
import { bracketMatching, foldGutter, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import VueCodemirror from 'vue-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap, highlightSpecialChars, highlightActiveLine, lineNumbers } from '@codemirror/view';
import { Quasar, Dialog } from 'quasar'
import App from './App.vue';

import './assets/main.css';
import 'quasar/src/css/index.sass';
import '@quasar/extras/material-icons/material-icons.css'

const app = createApp(App);

app.use(createPinia());
app.use(Quasar, { plugins: {
	Dialog
} });

app.mount('#app');
app.use(VueCodemirror, {
	autofocus: true,
	disabled: false,
	indentWithTab: true,
	tabSize: 4,
	style: {
		'caret-color': 'black !important'
	},
	extensions: [
		javascript(),
		oneDark,
		bracketMatching(),
		closeBrackets(),
		history(),
		syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
		keymap.of([...lintKeymap, ...defaultKeymap, ...historyKeymap]),
		foldGutter(),
		highlightActiveLine(),
		highlightSpecialChars(),
		lineNumbers()
	]
});
