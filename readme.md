Utils to tamper with PCM buffers.


[![npm install pcm-util](https://nodei.co/npm/pcm-util.png?mini=true)](https://npmjs.org/package/pcm-util/)


```js
var pcm = require('pcm-util');

/** Default PCM format to use for any operations */
pcm.defaultFormat === {
	signed: true,
	float: false,
	bitDepth: 16,
	byteOrder: 'LE',
	channels: 2,
	sampleRate: 44100,
	interleaved: true,
	samplesPerFrame: 1024
};


/** Normalize passed format - align values and precalculate params */
var format = pcm.normalizeFormat(format);
format === {
	//...all the default values

	//precalculated params:
	sampleSize: 4,
	methodSuffix: 'Int16LE',
	readMethodName: 'readInt16LE',
	writeMethodName: 'writeInt16LE',
	maxInt: 32678,
	id: 'S_16_LE_2_44100_I'
};


/** Whether format is normalized, at least once */
pcm.isNormalized(format);


/** Retrieve format from any object, returns not normalized object */
var format = pcm.getFormat(audioNode);


/** Stringify/parse format identifier */
var formatId = pcm.stringifyFormat(format);
var format = pcm.parseFormat(formatId);


/** Compare whether two formats are equal to each other */
pcm.isEqualFormat(formatA, formatB);


/** Create typed array of a type, according to the format */
var array = pcm.createArray(format);

/** Ger format from typed array */
var format = pcm.getArrayFormat(new Float32Array);


/** Get channel data from the buffer */
var channelData = pcm.getChannelData(buffer, channel, fromFormat?, toFormat?);


/** Get all channels data, in form: [[LLLL...], [RRRR...], ...] */
var channelsData = pcm.getChannelsData(buffer, fromFormat?, toFormat?);


/** Copy channel data to buffer */
pcm.copyToChannel(buffer, data, channel, format?);


/** Convert buffer from format A to format B */
var newBuffer = pcm.convertFormat(buffer, fromFormat, toFormat?);


/** Convert value from format A to format B */
var value = pcm.convertSample(value, fromFormat, toFormat?);


/** Return buffer method suffix for the format, e.g. `UInt16LE` */
var suffix = pcm.getMethodSuffix(format);


/** Map buffer sample values, preserving the format. */
var newBuffer = pcm.mapSamples(buffer, function (value) { return value/2 }, format?);


/** Get channel frame length, i. e. number of samples per channel */
var len = pcm.getFrameLength(buffer, format);


/** Get offset in the buffer for the specific format, pass optionally frame length */
var offset = getOffset(channel, idx, format, length?);
```

> **Related**<br/>
> [audio-pcm-format](https://npmjs.org/package/audio-pcm-format) — converts audio pcm stream format.