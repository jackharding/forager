import {
  createMachine,
  State,
  actions,
  assign,
  send,
  sendParent,
  interpret,
  spawn
} from 'xstate';
import { fetchFromLocalStorage, saveToLocalStorage } from '../utils/storage';

const context = {
	logs: [],
}

export const LOG_STORAGE_KEY = 'forager-logs';

export const logMachine = createMachine({
	id: 'log',
	context,
	entry: ['fetchLogs', 'renderLogs'],
	on: {
		LOG: {
			actions: ['logItem', 'logSuccessFeedback', 'saveLogs'],
		}
	},
	states: {}
}, {
	actions: {
		logItem: assign({
			logs: (ctx, e) => [
				...ctx.logs,
				e.item,
			]
		}),
		logSuccessFeedback: () => {
			window.navigator.vibrate(200);
		},
		fetchLogs: assign({
			logs: () => fetchFromLocalStorage(LOG_STORAGE_KEY) || [],
		}),
		renderLogs: (ctx) => {
			const $logList = document.querySelector('[data-id="log-list"]');
			
			$logList.innerHTML = ctx.logs
				.reverse()
				.slice(0, 5)
				.map(log => `
					<li>
						<p>${log.loggedAt}</p>
						<p>Lat: ${log.userPosition.lat} Lng: ${log.userPosition.lng}</p>
					</li>
				`)
				.join('');
		},
		saveLogs:(ctx) => {
			saveToLocalStorage(LOG_STORAGE_KEY, ctx.logs);
		}
	}
});