var pcm = require('./');
var assert = require('assert');
var AudioBiquad = require('audio-biquad');


describe('Formats', function () {
	it('Parse/stringify', function () {
		var format = pcm.getFormat(pcm.defaultFormat);
		var formatId = pcm.stringifyFormat(format);
		var result = pcm.parseFormat(formatId);

		assert.deepEqual(format, result);
	});

	it('Keep prototype values', function () {
		var A = function(){};
		A.prototype = Object.create({samplesPerFrame: 1});
		var a = new A();
		pcm.normalizeFormat(a);
		assert.equal(a.samplesPerFrame, 1);
	});

	it('Obtain format from the audio node', function () {
		var aStream = AudioBiquad();
		var aStreamFormat = pcm.getFormat(aStream);
		var defaultFormat = pcm.getFormat(pcm.defaultFormat);

		assert.notEqual(aStream, aStreamFormat);
		assert.deepEqual(aStreamFormat, defaultFormat)
	});

	it('Do not return defaults', function () {
		assert.deepEqual(pcm.getFormat(), {});
	});

	it('Normalize changed and normalized', function () {
		var floatFormat = pcm.normalizeFormat(pcm.getFormat(pcm.defaultFormat));
		floatFormat.float = true;
		var floatFormat = pcm.normalizeFormat(floatFormat);

		assert.deepEqual(pcm.normalizeFormat({float: true}), floatFormat);
	});

	it('Create typed array for the format', function () {
		assert(pcm.createArray() instanceof Int16Array);
		assert(pcm.createArray({float: true}) instanceof Float32Array);
		assert(pcm.createArray({float: false}) instanceof Int16Array);
		assert(pcm.createArray({float: false, bitDepth: 32}) instanceof Int32Array);
		// assert(pcm.createArray({float: false, bitDepth: 32, signed: false}) instanceof UInt32Array);
		assert(pcm.createArray({float: false, signed: false}) instanceof Uint16Array);
	});

	it('Infer format from the typed array', function () {
		assert.deepEqual(pcm.getFormat(new Float32Array), pcm.getFormat({
			float: true,
			signed: false,
			bitDepth: 32
		}));
		assert.deepEqual(pcm.getFormat(new Int16Array), pcm.getFormat({
			float: false,
			signed: true,
			bitDepth: 16
		}));
	});
});


describe('Frame length', function () {
	it('Float', function () {
		var buf = new Buffer(8);
		buf.writeFloatLE(1.0, 0);
		buf.writeFloatLE(-0.5, 4);

		assert(pcm.getFrameLength(buf, {float: true, channels:1}), 2);
		assert(pcm.getFrameLength(buf, {float: true, channels:2}), 1);
	});
});

describe('Sample conversions', function () {
	it('FloatLE → Int16BE', function () {
		var buf = new Buffer(8);
		buf.writeFloatLE(1.0, 0);
		buf.writeFloatLE(-0.5, 4);

		var newBuf = pcm.convertFormat(buf, { float: true }, { float: false, signed: true, bitDepth: 16, byteOrder: 'BE' });
		var val1 = newBuf.readInt16BE(0);
		var val2 = newBuf.readInt16BE(2);

		assert.equal(Math.pow(2, 15) - 1, val1);
		assert.equal(-Math.pow(2, 14), val2);
	});

	it('Irrevertibility', function () {
		assert.equal(pcm.convertSample(32767), 32767);
		assert.equal(pcm.convertSample(0), 0);
		assert.equal(pcm.convertSample(-32767), -32767);
		assert.equal(pcm.convertSample(1, {float: true}, {float: true}), 1);
	});

	it('Float align', function () {
		assert.equal(pcm.convertSample(2, {float: true}), 32767);
	});
});

describe('Map samples', function () {
	it('Float', function () {
		var buf = new Buffer(8);
		buf.writeFloatLE(1.0, 0);
		buf.writeFloatLE(-0.5, 4);

		var newBuf = pcm.mapSamples(buf, function (value) { return -1 * value;}, { float: true });
		var val1 = newBuf.readFloatLE(0);
		var val2 = newBuf.readFloatLE(4);

		assert.equal(-1, val1);
		assert.equal(0.5, val2);
	});

	it('Int', function () {
		var buf = new Buffer(16);
		buf.writeInt16LE(20001, 0);
		buf.writeInt16LE(-10001, 2);
		buf.writeInt16LE(32767, 4);
		buf.writeInt16LE(-32768, 6);

		var newBuf = pcm.mapSamples(buf, function (value) { return -0.5 * value;});
		var val1 = newBuf.readInt16LE(0);
		var val2 = newBuf.readInt16LE(2);
		var val3 = newBuf.readInt16LE(4);
		var val4 = newBuf.readInt16LE(6);

		assert.equal(-10000, val1);
		assert.equal(5001, val2);
		assert.equal(-16383, val3);
		assert.equal(16384, val4);
	});
});

describe('Get channel data', function () {
	it('getChannelsData(from)', function () {
		var buf = new Buffer(8);
		buf.writeFloatLE(1.0, 0);
		buf.writeFloatLE(-0.5, 4);
		var data = pcm.getChannelsData(buf, {channels: 2, float: true});
		assert.deepEqual(data, [[1],[-0.5]])
	});

	it('getChannelsData(from, to)', function () {
		var buf = new Buffer(8);
		buf.writeFloatLE(1, 0);
		buf.writeFloatLE(-0.5, 4);
		var data = pcm.getChannelsData(buf, {float: true}, {float: false});
		assert.deepEqual(data, [[32767],[-16384]])
	});
});