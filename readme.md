[![npm install pcm-util](https://nodei.co/npm/pcm-util.png?mini=true)](https://npmjs.org/package/pcm-util/)


```js
var util = require('pcm-util');

/** Default PCM format to use for any operations */
util.defaultFormat === {
	channels: 2,
	byteOrder: 'LE',
	bitDepth: 16,
	signed: true,
	float: false,
	sampleRate: 44100,
	interleaved: true,
	samplesPerFrame: undefined
};


/** Normalize passed format or return default format */
util.normalizeFormat(format) === {
	//...
	//all the default format params plus precalculated params:
	sampleSize: 4,
	methodSuffix: 'Int16LE',
	readMethodName: 'readInt16LE',
	writeMethodName: 'writeInt16LE',
	maxInt: 32678
};


/** Get channel data from the buffer [LLLL...] */
util.getChannelData(buffer, channel, format);


/** Get all channels data, [[LLLL...], [RRRR...], ...] */
util.getChannelsData(buffer, format);


/** Copy channel data to buffer */
util.copyToChannel(buffer, data, channel, format);


/** Convert buffer from format A to format B */
util.convertFormat(buffer, formatA, formatB?);


/** Convert value from format A to format B */
util.convertSample(value, formatA, formatB?);


/** Return buffer method suffix for the format, e.g. `UInt16LE` */
util.getMethodSuffix(format);
```

> **Related**<br/>
> [audio-pcm-format](https://npmjs.org/package/audio-pcm-format) — converts audio pcm stream format.