import Leaflet, { marker } from 'leaflet';
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

const MAPBOX_API_TOKEN = 'pk.eyJ1IjoiamFjay1oYXJkaW5nIiwiYSI6ImNrdDF1Y3VqYjBlMDEybm1tYjhkMmxkdXgifQ.KjFGdXxDqlT-bt1sZ8dXQQ';
const ZOOM_LEVEL = 20;

const context = {
	mapElements: {
		map: null,
		user: null,
	},
	userPosition: {
		lat: null,
		lng: null,
	},
}

export const mapMachine = createMachine({
	id: 'map',
	initial: 'pending',
	context,
	states: {
		pending: {
			on: {
				UPDATE_USER_POSITION: {
					target: 'initialising',
				},
				ERROR: 'error',
			}
		},
		initialising: {
			invoke: {
				id: 'initialiseMap',
				src: 'initialiseMap',
			},
			on: {
				INITIALISED: {
					target: 'active',
					actions: ['addMapElementsToContext']
				} 
			}
		},
		active: {
			on: {
				UPDATE_USER_POSITION: {
					actions: ['updateMap']
				} 
			},
		},
		error: {},
	}
}, {
	actions: {
		addMapElementsToContext: assign({
			mapElements: (ctx, e) => ({
				marker: e.marker,
				map: e.map,
			}),
		}),
		updateMap: (ctx, e) => {
			const { mapElements: { map, marker } } = ctx;
			const { userPosition } = e;

			const newPos = [userPosition.lat, userPosition.lng];
			map.setView(newPos, ZOOM_LEVEL);
			marker.setLatLng(newPos);
		},
	},
	services: {
		initialiseMap: (ctx, e) => (send, onReceive) => {
			const userPosition = [e.userPosition.lat, e.userPosition.lng];

			const map = Leaflet.map('map').setView(userPosition, ZOOM_LEVEL);

			Leaflet.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
				maxZoom: 18,
				id: 'mapbox/streets-v11',
				tileSize: 512,
				zoomOffset: -1,
				accessToken: MAPBOX_API_TOKEN
			}).addTo(map);

			const marker = Leaflet.marker(userPosition).addTo(map);

			send({ type: 'INITIALISED', map, marker });
    }
	}
});