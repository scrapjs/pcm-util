/**
 * Utils to deal with pcm-buffers
 *
 * @module  pcm-util
 */

var os = require('os');


/**
 * Default pcm format values
 */
var defaultFormat = {
	signed: true,
	float: false,
	bitDepth: 16,
	byteOrder: os.endianness instanceof Function ? os.endianness() : 'LE',
	channels: 2,
	sampleRate: 44100,
	interleaved: true,
	samplesPerFrame: 1024
};

var defaultFormatId = stringifyFormat(defaultFormat);


/**
 * Just a list of reserved property names of format
 */
var formatProperties = Object.keys(defaultFormat);


/**
 * Additional properties added during normalization
 */
var calculatedProperties = [
	'id',
	'sampleSize',
	'methodSuffix',
	'readMethodName',
	'writeMethodName',
	'maxInt'
];


/**
 * Return buffer method suffix for the format
 */
function getMethodSuffix (format) {
	return (format.float ? 'Float' : ((format.signed ? '' : 'U') + 'Int' + format.bitDepth)) + format.byteOrder;
};


/**
 * Get format info from any object, unnormalized.
 */
function getFormat (obj) {
	if (!obj) return {};

	//if is string - parse format
	if (typeof obj === 'string' || obj.id) {
		return parseFormat(obj.id || obj);
	}

	//if is array - detect format
	else if (ArrayBuffer.isView && ArrayBuffer.isView(obj) || obj.buffer instanceof ArrayBuffer) {
		return getArrayFormat(obj);
	}

	//else retrieve format properties from object
	var format = {};

	formatProperties.forEach(function (key) {
		if (obj[key] != null) format[key] = obj[key];
	});

	return format;
};


/**
 * Get format id string.
 * Inspired by https://github.com/xdissent/node-alsa/blob/master/src/constants.coffee
 */
function stringifyFormat (format) {
	//TODO: extend possible special formats
	var result = [];

	//(S|U)(8|16|24|32)_(LE|BE)?
	result.push(format.float ? 'F' : (format.signed ? 'S' : 'U'));
	result.push(format.bitDepth);
	result.push(format.byteOrder);
	result.push(format.channels);
	result.push(format.sampleRate);
	result.push(format.interleaved ? 'I' : 'N');

	return result.join('_');
};


/**
 * Return format object from the format ID.
 * Returned format is not normalized for performance purposes (~10 times)
 * http://jsperf.com/parse-vs-extend/4
 */
function parseFormat (str) {
	var params = str.split('_');
	return {
		float: params[0] === 'F',
		signed: params[0] === 'S',
		bitDepth: parseInt(params[1]),
		byteOrder: params[2],
		channels: parseInt(params[3]),
		sampleRate: parseInt(params[4]),
		interleaved: params[5] === 'I',

		//TODO: is it important?
		samplesPerFrame: 1024
	};
}


/**
 * Whether one format is equal to another
 */
function isEqualFormat (a, b) {
	return (a.id || stringifyFormat(a)) === (b.id || stringifyFormat(b));
}


/**
 * Normalize format, mutable.
 * Precalculate format params: sampleSize, methodSuffix, id, maxInt.
 * Fill absent params.
 */
function normalizeFormat (format) {
	if (!format) format = {};

	//bring default format values
	formatProperties.forEach(function (key) {
		if (format[key] == null) {
			format[key] = defaultFormat[key];
		}
	});

	//ensure float values
	if (format.float) {
		format.bitDepth = 32;
		format.signed = true;
	}

	if(format.bitDepth <= 8) format.byteOrder = '';

	//precalc other things
	//NOTE: same as TypedArray.BYTES_PER_ELEMENT
	format.sampleSize = format.bitDepth / 8;

	//method suffix/names
	//FIXME: remove this, in 2.0
	format.methodSuffix = getMethodSuffix(format);
	format.readMethodName = 'read' + getMethodSuffix(format);
	format.writeMethodName = 'write' + getMethodSuffix(format);

	//max integer, e.g. 32768
	format.maxInt = Math.pow(2, format.bitDepth-1);

	//calc id
	format.id = stringifyFormat(format);

	return format;
};


/**
 * Check whether format is normalized, at least once
 */
function isNormalized (format) {
	return format && format.id;
}


/**
 * Create typed array for the format, filling with the data (ArrayBuffer)
 */
function createArray (format, data) {
	if (!isNormalized(format)) format = normalizeFormat(format);

	if (data == null) data = format.samplesPerFrame * format.channels;

	if (format.float) {
		if (format.bitDepth > 32) {
			return new Float64Array(data);
		}
		else {
			return new Float32Array(data);
		}
	}
	else {
		if (format.bitDepth === 32) {
			return format.signed ? new Int32Array(data) : new Uint32Array(data);
		}
		else if (format.bitDepth === 8) {
			return format.signed ? new Int8Array(data) : new Uint8Array(data);
		}
		//default case
		else {
			return format.signed ? new Int16Array(data) : new Uint16Array(data);
		}
	}
};


/**
 * Get format info from the array type
 */
function getArrayFormat (array) {
	if (array instanceof Int8Array) {
		return {
			float: false,
			signed: true,
			bitDepth: 8
		};
	};
	if ((array instanceof Uint8Array) || (array instanceof Uint8ClampedArray)) {
		return {
			float: false,
			signed: false,
			bitDepth: 8
		};
	};
	if (array instanceof Int16Array) {
		return {
			float: false,
			signed: true,
			bitDepth: 16
		};
	};
	if (array instanceof Uint16Array) {
		return {
			float: false,
			signed: false,
			bitDepth: 16
		};
	};
	if (array instanceof Int32Array) {
		return {
			float: false,
			signed: true,
			bitDepth: 32
		};
	};
	if (array instanceof Uint32Array) {
		return {
			float: false,
			signed: false,
			bitDepth: 32
		};
	};
	if (array instanceof Float32Array) {
		return {
			float: true,
			signed: false,
			bitDepth: 32
		};
	};
	if (array instanceof Float64Array) {
		return {
			float: true,
			signed: false,
			bitDepth: 64
		};
	};
}


/**
 * Calculate offset for the format
 */
function getOffset(channel, idx, format, len) {
	if (!len) len = format.samplesPerFrame;
	var offset = format.interleaved ? channel + idx * format.channels : channel * len + idx;
	return offset * format.sampleSize;
};


/**
 * Return parsed channel data for a buffer
 */
function getChannelData (buffer, channel, fromFormat, toFormat) {
	if (!isNormalized(fromFormat)) fromFormat = normalizeFormat(fromFormat);

	var method = fromFormat.readMethodName;
	var frameLength = getFrameLength(buffer, fromFormat);

	var data = [];
	var offset;

	for (var i = 0, value; i < frameLength; i++) {
		value = buffer[method](getOffset(channel, i, fromFormat, frameLength));
		if (toFormat) value = convertSample(value, fromFormat, toFormat);

		data.push(value);
	}

	return data;
};


/**
 * Get parsed buffer data, separated by channel arrays [[LLLL], [RRRR]]
 */
function getChannelsData (buffer, fromFormat, toFormat) {
	if (!isNormalized(fromFormat)) fromFormat = normalizeFormat(fromFormat);

	var data = [];

	for (var channel = 0; channel < fromFormat.channels; channel++) {
		data.push(getChannelData(buffer, channel, fromFormat, toFormat));
	}

	return data;
}


/**
 * Copy data to the buffer’s channel
 */
function copyToChannel (buffer, data, channel, toFormat) {
	if (!isNormalized(toFormat)) toFormat = normalizeFormat(toFormat);

	data.forEach(function (value, i) {
		var offset = getOffset(channel, i, toFormat, data.length)
		if (!toFormat.float) value = Math.round(value);
		buffer[toFormat.writeMethodName](value, offset);
	});

	return buffer;
};


/**
 * Convert buffer from format A to format B.
 */
function convert (buffer, from, to) {
	var value, channel, offset;

	if (!isNormalized(from)) from = normalizeFormat(from);
	if (!isNormalized(to)) to = normalizeFormat(to);

	//ignore needless conversion
	if (isEqualFormat(from ,to)) {
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
	if (!isNormalized(from)) from = normalizeFormat(from);
	if (!isNormalized(to)) to = normalizeFormat(to);

	//ignore not changed suffix
	if (from.methodSuffix === to.methodSuffix) return value;

	//normalize value to float form -1..1
	if (!from.float) {
		if (!from.signed) {
			value -= from.maxInt;
		}
		value = value / (from.maxInt - 1);
	}

	//clamp
	value = Math.max(-1, Math.min(1, value));

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
 * Slice audio buffer
 */
function slice (buffer, format) {
	xxx
};


/**
 * Map samples not changing the format
 */
function mapSamples (buffer, fn, format) {
	if (!isNormalized(format)) format = normalizeFormat(format);

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
};


/** Get frame size from the buffer, for a channel */
function getFrameLength (buffer, format) {
	if (!isNormalized(format)) format = normalizeFormat(format);

	return Math.floor(buffer.length / format.sampleSize / format.channels);
};


module.exports = {
	//format utils
	defaultFormat: defaultFormat,
	getFormat: getFormat,
	normalizeFormat: normalizeFormat,
	stringifyFormat: stringifyFormat,
	parseFormat: parseFormat,
	isEqualFormat: isEqualFormat,
	isNormalized: isNormalized,
	createArray: createArray,

	//buffers utils
	getMethodSuffix: getMethodSuffix,
	convertFormat: convert,
	convertSample: convertSample,
	getChannelData: getChannelData,
	getChannelsData: getChannelsData,
	copyToChannel: copyToChannel,
	mapSamples: mapSamples,
	getFrameLength: getFrameLength,
	getOffset: getOffset
};