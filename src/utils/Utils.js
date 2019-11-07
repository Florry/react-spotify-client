export default class Utils {

	static duration(milliseconds) {
		const minutes = Math.floor(milliseconds / 60000);
		/** @type {Number|String}*/
		let seconds = ((milliseconds - minutes * 60000) / 1000).toFixed(0);

		if (seconds < 10)
			seconds = "0" + seconds;

		return `${minutes}:${seconds}`;
	}

}
