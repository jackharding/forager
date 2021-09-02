import {
  createMachine,
  assign,
  send,
  spawn
} from 'xstate';
import { mapMachine } from './map.machine';
import { logMachine } from './log.machine';

const context = {
	logMachine: undefined,
	mapMachine: undefined,
	userPosition: {
		lat: null,
		lng: null,
	},
}

// Tell map.machine and log.machine each time the location changes?
export const appMachine = createMachine({
	id: 'app',
	// initial: 'pending',
	context,
	entry: ['spawnActors'],
	on: {
		LOG: {
			actions: ['forwardLogEvent']
		},
		POSITION_CHANGE: {
			actions: ['updateUserPosition', 'updateMap']
		},
	},
	states: {},
}, {
	actions: {
		updateMap: send(
			(ctx) => ({
				type: 'UPDATE_USER_POSITION',
				userPosition: ctx.userPosition,
			}),
			{ to: 'mapMachine' }
		),
		updateUserPosition: assign({
			userPosition: (ctx, e) => ({
				lat: e.coords.latitude,
				lng: e.coords.longitude,
			})
		}),
		forwardLogEvent: send(
			(ctx, e) => ({
				...e,
				item: {
					...e.item,
					userPosition: ctx.userPosition,
				}
			}),
			{ to: 'logMachine' }
		),
		forwardLogMachineEvent: send(
			(ctx, e) => e,
			{ to: 'logMachine' }
		),
		forwardMapMachineEvent: send(
			(ctx, e) => e,
			{ to: 'mapMachine' }
		),
		spawnActors: assign({
			logMachine: () => spawn(logMachine, 'logMachine'),
			mapMachine: () => spawn(mapMachine, 'mapMachine'),
		}),
		updateUserPosition: assign({
			userPosition: (ctx, e) => {
				return {
					lat: e.coords.latitude,
					lng: e.coords.longitude,
				}
			}
		}),
	},
});