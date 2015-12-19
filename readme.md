Utils to tamper with PCM buffers.


[![npm install pcm-util](https://nodei.co/npm/pcm-util.png?mini=true)](https://npmjs.org/package/pcm-util/)


```js
var pcm = require('pcm-util');

/** Default PCM format to use for any operations */
pcm.defaultFormat === {
	channels: 2,
	byteOrder: 'LE',
	bitDepth: 16,
	signed: true,
	float: false,
	sampleRate: 44100,
	interleaved: true,
	samplesPerFrame: null
};


/** Normalize passed format or return default format */
var format = pcm.normalizeFormat(format);
format === {
	//...
	//all the default format params plus precalculated params:
	sampleSize: 4,
	methodSuffix: 'Int16LE',
	readMethodName: 'readInt16LE',
	writeMethodName: 'writeInt16LE',
	maxInt: 32678
};


/** Retrieve copied & normalized format info from any object */
var format = pcm.getFormat(audioNode);


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