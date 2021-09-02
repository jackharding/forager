export const saveToLocalStorage = (key, val) => {
	localStorage.setItem(key, JSON.stringify(val));
}

export const fetchFromLocalStorage = (key) => {
	const data = localStorage.getItem(key);
	console.log('fetchyyy;', data)
	return data ? JSON.parse(data) : null;
}