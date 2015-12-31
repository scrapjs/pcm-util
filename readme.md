Utils to tamper with PCM formats/buffers.


[![npm install pcm-util](https://nodei.co/npm/pcm-util.png?mini=true)](https://npmjs.org/package/pcm-util/)


```js
var pcm = require('pcm-util');


/** Default PCM format to use for any operations */
pcm.defaults === {
	signed: true,
	float: false,
	bitDepth: 16,
	byteOrder: 'LE',
	sampleSize: 4,
	channels: 2,
	sampleRate: 44100,
	interleaved: true,
	samplesPerFrame: 1024,
	id: 'S_16_LE_2_44100_I',
	max: 32678,
	min: -32768
};


/**
 * Normalize passed format:
 * ensure all the properties are present and do not contradict.
 */
pcm.normalize(format);


/** Retrieve format-related properties from any object, return not normalized format */
pcm.format(audioBuffer);


/** Compare whether two formats are equal to each other */
pcm.equal(a, b);


/** Convert buffer of the `format` to audio buffer */
pcm.toAudioBuffer(buffer, format);


/** Convert audio buffer to buffer of the `format` */
pcm.toBuffer(audioBuffer, format);


/**
 * Convert buffer from one format to another.
 * Does interleaving/deinterleaving, converting data type.
 * TODO: resampling, up/downmixing, zero-padding for `samplesPerFrame` property
 */
pcm.convert(buffer, fromFormat, toFormat);
```


> **Related**<br/>
> [audio-buffer](https://npmjs.org/package/audio-buffer) — high-level audio data container.<br/>
> [audio-buffer-utils](https://npmjs.org/package/audio-buffer-utils) — utils for audio buffers.<br/>
> [audio-pcm-format](https://npmjs.org/package/audio-pcm-format) — pcm format converter stream.<br/>
> [audio-node](https://npmjs.org/package/audio-node) — stream-based AudioNode implementation for node/browser.