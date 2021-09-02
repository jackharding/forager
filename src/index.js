import { interpret } from 'xstate';
import { appMachine } from './machines/app.machine';
import "leaflet/dist/leaflet.css";

const $accuracy = document.querySelector('[data-id="accuracy"]');
const $lat = document.querySelector('[data-id="lat"]');
const $lng = document.querySelector('[data-id="lng"]');

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


const handleLogItem = () => {
	appService.send({
		type: 'LOG',
		item: {
			type: 'TODO',
			loggedAt: new Date().toISOString(),
		},
	});
}

const handleSwitchMode = () => {
	const modes = {
		listing: 'listing',
		logging: 'logging',
	}

	const { mode: currentMode } = document.body.dataset;
	// const newMode = currentMode === 'listing' ? 'logging' : 'listing';
	document.body.dataset.mode = currentMode === 'listing' ? 'logging' : 'listing';
}

const handleClearLogs = () => {
	localStorage.clear();
}

document.querySelector('[data-id="log-button"]').addEventListener('click', handleLogItem);
document.querySelector('[data-id="switch-mode"]').addEventListener('click', handleSwitchMode);
document.querySelector('[data-id="clear-logs"]').addEventListener('click', handleClearLogs);