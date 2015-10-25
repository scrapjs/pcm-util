var os = require('os');


/**
 * Default input/output format
 */
var defaultFormat = {
	channels: 2,
	sampleRate: 44100,
	byteOrder: os.endianness instanceof Function ? os.endianness() : 'LE',
	bitDepth: 16,
	signed: true,
	float: false,
	interleaved: true,
	samplesPerFrame: 1024
};


/**
 * Return buffer method suffix for the format
 */
function getMethodSuffix (format) {
	return (format.float ? 'Float' : ((format.signed ? '' : 'U') + 'Int' + format.bitDepth)) + format.byteOrder;
};


/**
 * Normalize format, mutable.
 * Precalculate format params: sampleSize, suffix.
 */
function normalizeFormat (format) {
	if (!format) format = {};

	//ignore already normalized format
	if (format.sampleSize) return format;

	//bring default format values
	for (var key in defaultFormat) {
		if (format[key] === undefined) {
			format[key] = defaultFormat[key];
		}
	}

	//ensure float values
	if (format.float) {
		format.bitDepth = 32;
		format.signed = true;
	}

	if(format.bitDepth <= 8) format.byteOrder = '';

	//precalc other things
	format.sampleSize = format.bitDepth / 8;

	//method suffix/names
	format.methodSuffix = getMethodSuffix(format);
	format.readMethodName = 'read' + getMethodSuffix(format);
	format.writeMethodName = 'write' + getMethodSuffix(format);

	//max integer, e.g. 32768
	format.maxInt = Math.pow(2, format.bitDepth-1);


	return format;
}


/**
 * Return parsed channel data for a buffer
 */
function getChannelData (buffer, channel, format) {
	format = normalizeFormat(format);

	var method = format.readMethodName;
	var frameLength = getFrameLength(buffer, format);
	var data = [];
	var offset;

	for (var i = 0; i < frameLength; i++) {
		offset = format.interleaved ? channel + i * format.channels : channel * frameLength + i;
		data.push(buffer[method](offset * format.sampleSize));
	}

	return data;
};


/**
 * Get parsed buffer data, separated by channel arrays [[LLLL], [RRRR]]
 */
function getChannelsData (buffer, format) {
	normalizeFormat(format);

	var data = [];

	for (var channel = 0; channel < format.channels; channel++) {
		data.push(getChannelData(buffer, channel, format));
	}

	return data;
}


/**
 * Copy data to the buffer’s channel
 */
function copyToChannel (buffer, data, channel, format) {
	format = normalizeFormat(format);

	data.forEach(function (value, i) {
		var offset = format.interleaved ? channel + i * format.channels : channel * data.length + i;
		if (!format.float) value = Math.round(value);
		buffer[format.writeMethodName](value, offset * format.sampleSize);
	});

	return buffer;
};


/**
 * Convert buffer from format A to format B.
 */
function convertFormat (buffer, from, to) {
	var value, channel, offset;

	from = normalizeFormat(from);
	to = normalizeFormat(to);

	//ignore needless conversion
	if ((from.methodSuffix === to.methodSuffix) &&
		(from.channels === to.channels) &&
		(from.interleaved === to.interleaved)) {
		return buffer;
	}

	var chunk = new Buffer(buffer.length * to.sampleSize / from.sampleSize);

	//get normalized data for channels
	getChannelsData(buffer, from).forEach(function (channelData, channel) {
		copyToChannel(chunk, channelData.map(function (value) {
			return convertSample(value, from, to);
		}), channel, to);
	});

	return chunk;
};


/**
 * Convert sample from format A to format B
 */
function convertSample (value, from, to) {
	normalizeFormat(from);

	//normalize value to float form -1..1
	if (!from.float) {
		if (!from.signed) {
			value -= from.maxInt;
		}
		value /= from.maxInt;
	}

	normalizeFormat(to);

	//convert value to needed form
	if (!to.float) {
		if (to.signed) {
			value = value * (to.maxInt - 1);
		} else {
			value = (value + 1) * to.maxInt;
		}
		value = Math.floor(value);
	}

	return value;
}


/**
 * Transform from inverleaved form to planar
 */
function deinterleave (buffer, format) {
	xxx
};


/**
 * Convert buffer from planar to interleaved form
 */
function interleave (buffer, format) {
	xxx
};


/**
 * Downmix channels
 */
function downmix (buffer, format) {
	xxx
};


/**
 * Upmix channels
 */
function upmix (buffer, format) {
	xxx
};


/**
 * Resample buffer
 */
function resample (buffer, rateA, rateB, format) {
	xxx
};


/**
 * Remap channels not changing the format
 */
function mapChannels (buffer, channels, format) {
	xxx
};


/**
 * Map samples not changing the format
 */
function mapSamples (buffer, fn, format) {
	format = normalizeFormat(format);

	var samplesNumber = Math.floor(buffer.length / format.sampleSize);
	var value, offset;

	//don’t mutate the initial buffer
	var buf = new Buffer(buffer.length);

	for (var i = 0; i < samplesNumber; i++) {
		offset = i * format.sampleSize;

		//read value
		value = buffer[format.readMethodName](offset);

		//transform value
		value = fn(value);

		//avoid int outofbounds error
		if (!format.float) value = Math.round(value);

		//write value
		buf[format.writeMethodName](value, offset);
	}

	return buf;
}


/** Get frame size from the buffer, for a channel */
function getFrameLength (buffer, format) {
	format = normalizeFormat(format);

	return Math.floor(buffer.length / format.sampleSize / format.channels);
}


module.exports = {
	defaultFormat: defaultFormat,
	getMethodSuffix: getMethodSuffix,
	convertFormat: convertFormat,
	convertSample: convertSample,
	normalizeFormat: normalizeFormat,
	getChannelData: getChannelData,
	copyToChannel: copyToChannel,
	mapSamples: mapSamples,
	getFrameLength: getFrameLength
};