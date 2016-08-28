# pcm-util [![Build Status](https://travis-ci.org/audiojs/pcm-util.svg?branch=master)](https://travis-ci.org/audiojs/pcm-util) [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

Utils to tamper with PCM formats/buffers.


[![npm install pcm-util](https://nodei.co/npm/pcm-util.png?mini=true)](https://npmjs.org/package/pcm-util/)


```js
var pcm = require('pcm-util');


/** Default PCM format to use for any operations */
pcm.defaults === {
	channels: 2,
	sampleRate: 44100,
	interleaved: true,
	float: false,
	signed: true,
	bitDepth: 16,
	byteOrder: 'LE',
	max: 32767,
	min: -32768,
	sampleSize: 4,
	samplesPerFrame: 1024,
	id: 'S_16_LE_2_44100_I'
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
 */
pcm.convert(buffer, fromFormat, toFormat);
```


### Related

> [audio-buffer](https://npmjs.org/package/audio-buffer) — high-level audio data container.<br/>
> [audio-buffer-utils](https://npmjs.org/package/audio-buffer-utils) — utils for audio buffers.<br/>
> [audio-pcm-format](https://npmjs.org/package/audio-pcm-format) — pcm format converter stream.<br/>
> [audio-node](https://npmjs.org/package/audio-node) — stream-based AudioNode implementation for node/browser.
