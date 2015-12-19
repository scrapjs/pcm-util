var util = require('./');
var assert = require('assert');
var AudioSink = require('audio-sink');

describe('Method suffix', function () {

});

describe('Normalize/get format', function () {
	it('Keep prototype values', function () {
		var A = function(){};
		A.prototype = Object.create({samplesPerFrame: 1});
		var a = new A();
		util.normalizeFormat(a);
		assert.equal(a.samplesPerFrame, 1);
	});

	it('Obtain format from the audio node', function () {
		var aStream = AudioSink();
		var aStreamFormat = util.getFormat(aStream);
		var defaultFormat = util.getFormat(util.defaultFormat);

		assert.notEqual(aStream, aStreamFormat);
		assert.deepEqual(aStreamFormat, defaultFormat)
	});

	it('Return default format if none passed', function () {
		assert(util.getFormat());
	});
});

describe('Frame length', function () {
	it('Float', function () {
		var buf = new Buffer(8);
		buf.writeFloatLE(1.0, 0);
		buf.writeFloatLE(-0.5, 4);

		assert(util.getFrameLength(buf, {float: true, channels:1}), 2);
		assert(util.getFrameLength(buf, {float: true, channels:2}), 1);
	});
});

describe('Sample conversions', function () {
	it('FloatLE → Int16BE', function () {
		var buf = new Buffer(8);
		buf.writeFloatLE(1.0, 0);
		buf.writeFloatLE(-0.5, 4);

		var newBuf = util.convertFormat(buf, { float: true }, { float: false, signed: true, bitDepth: 16, byteOrder: 'BE' });
		var val1 = newBuf.readInt16BE(0);
		var val2 = newBuf.readInt16BE(2);

		assert.equal(Math.pow(2, 15) - 1, val1);
		assert.equal(-Math.pow(2, 14), val2);
	});

	it('Irrevertibility', function () {
		assert.equal(util.convertSample(32767), 32767);
		assert.equal(util.convertSample(0), 0);
		assert.equal(util.convertSample(-32767), -32767);
		assert.equal(util.convertSample(1, {float: true}, {float: true}), 1);
	});

	it('Float align', function () {
		assert.equal(util.convertSample(2, {float: true}), 32767);
	});
});

describe('Map samples', function () {
	it('Float', function () {
		var buf = new Buffer(8);
		buf.writeFloatLE(1.0, 0);
		buf.writeFloatLE(-0.5, 4);

		var newBuf = util.mapSamples(buf, function (value) { return -1 * value;}, { float: true });
		var val1 = newBuf.readFloatLE(0);
		var val2 = newBuf.readFloatLE(4);

		assert.equal(-1, val1);
		assert.equal(0.5, val2);
	});

	it('Int', function () {
		var buf = new Buffer(16);
		buf.writeInt16LE(20001, 0);
		buf.writeInt16LE(-10001, 4);
		buf.writeInt16LE(32767, 8);
		buf.writeInt16LE(-32768, 12);

		var newBuf = util.mapSamples(buf, function (value) { return -0.5 * value;});
		var val1 = newBuf.readInt16LE(0);
		var val2 = newBuf.readInt16LE(4);
		var val3 = newBuf.readInt16LE(8);
		var val4 = newBuf.readInt16LE(12);

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
		var data = util.getChannelsData(buf, {channels: 2, float: true});
		assert.deepEqual(data, [[1],[-0.5]])
	});

	it('getChannelsData(from, to)', function () {
		var buf = new Buffer(8);
		buf.writeFloatLE(1, 0);
		buf.writeFloatLE(-0.5, 4);
		var data = util.getChannelsData(buf, {float: true}, {float: false});
		assert.deepEqual(data, [[32767],[-16384]])
	});
});