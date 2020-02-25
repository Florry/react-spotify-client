export default class Utils {

	static duration(milliseconds) {
		const minutes = milliseconds / (1000 * 60);
		const m = Math.floor(minutes);

		const absoluteSeconds = Math.floor((minutes - m) * 60);
		const s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;

		return `${m}:${s}`;
	}

	static durationHours(milliseconds) {
		const hours = milliseconds / (1000 * 60 * 60);
		const h = Math.floor(hours);

		const minutes = (hours - h) * 60;
		const m = Math.floor(minutes);

		const seconds = (minutes - m) * 60;
		const s = Math.floor(seconds);

		return `${h ? h + "h" : ""} ${m}m ${s}s`;
	}

	static shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	static sortBy = (propertyName) => (a, b) => {
		if (a[propertyName] < b[propertyName])
			return -1;
		else if (a[propertyName] > b[propertyName])
			return 1;

		return 0;
	}

}
