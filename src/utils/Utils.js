export default class Utils {

	static duration(milliseconds) {
		const minutes = Math.floor(milliseconds / 60000);
		/** @type {Number|String}*/
		let seconds = ((milliseconds - minutes * 60000) / 1000).toFixed(0);

		if (seconds < 10)
			seconds = "0" + seconds;

		return `${minutes}:${seconds}`;
	}

	static shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

}
