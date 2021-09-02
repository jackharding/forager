import { interpret } from 'xstate';
import { mapMachine } from './map.machine';
import { logMachine } from './log.machine';
import { appMachine } from './app.machine';
import "leaflet/dist/leaflet.css";

const $accuracy = document.querySelector('[data-id="accuracy"]');
const $lat = document.querySelector('[data-id="lat"]');
const $lng = document.querySelector('[data-id="lng"]');
const $update = document.querySelector('[data-id="update"]');

const appService = interpret(appMachine).onTransition(state => console.log('TRANSITION', state))
appService.start();
// const mapService = interpret(mapMachine).onTransition(state => console.log('TRANSITION', state))
// mapService.start();

const handlePositionChange = ({ coords, timestamp }) => {
	appService.send({
		type: 'POSITION_CHANGE',
		coords,
		timestamp,
	})

	$lng.textContent = coords.longitude;
	$lat.textContent = coords.latitude;
	$accuracy.textContent = coords.accuracy;
	console.log({coords, timestamp})
}

const handleGeolocationError = ({ code, message }) => {
	// TODO: Implement this
	appService.send({
		type: 'GEO_ERROR',
		code,
		message,
	})
	console.log({code, message})
}

navigator.geolocation.watchPosition(handlePositionChange, handleGeolocationError);

$update.addEventListener('click', () => {
	appService.send({
		type: 'POSITION_CHANGE',
		coords: {
			latitude: 51.8,
			longitude: 0.8466,
		},
		timestamp: 123,
	})
});

const handleLogItem = () => {
	appService.send({
		type: 'LOG',
		item: {
			type: 'TODO',
			loggedAt: new Date().toISOString(),
		},
	});
}

document.querySelector('[data-id="log"]').addEventListener('click', handleLogItem);