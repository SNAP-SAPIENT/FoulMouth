'use strict';

const fs = require('fs');
// const path = require('path');

const googleTTS = require('google-tts-api');
const request = require('request');

const record = require('node-record-lpcm16');
const Speech = require('@google-cloud/speech');
const speech = Speech();

const player = require('play-sound')();

// Instantiates a client

const config = {
  config: {
    encoding: 'LINEAR16',
    languageCode: 'en-US',
    sampleRateHertz: 16000
  },
  interimResults: false // If you want interim results, set this to true
};

const save = (url, filename) => {
  // File to save audio to
  var mp3File = filename + '.mp3';
  var mp3_file = fs.createWriteStream(mp3File);
	console.log(url);
  // Make API request
  return new Promise((resolve, reject) => {
    request.get(url).on('error', function(err) {
      console.log(err);
      reject();
    }).on('data', function(data) {
	console.log("writing");
      mp3_file.write(data);
    }).on('end', function() {
      mp3_file.end();
	console.log("saved");
      player.play(mp3File, (err) => {
	if (err) {
	  console.log("err");
	}
	console.log("complete");
      });
      resolve();
    });
  });
}


const streamingMicRecognize = () => {
  console.log("Stream");
  // console.dir(recognizeStream);

  const recognizeStream = speech.createRecognizeStream(config)
    .on('error', console.error)
    .on('data', data => {
    console.log('recongizeStream > data');
    record.stop();

    console.log(data.results);
playback(data);
  }).on('end', () => { console.log('end stream');});
  // console.dir(recognizeStream);

  record.start({
    sampleRateHertz: 16000, threshold: 0,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: true,
    recordProgram: 'arecord', // Try also "arecord" or "sox"
    silence: '10.0',
    device: 'plughw:1'
  }).on('error', console.error).pipe(recognizeStream);

  console.log('Listening, press Ctrl+C to stop.');
  // [END speech_streaming_mic_recognize]
}

const playback = data => {
  console.log('TEST');
  let soundsArr = data.results.split(" ");
  soundsArr.forEach((elem, index) => {
    if (elem.includes('fuck')) {
      soundsArr[index] = soundsArr[index].replace('fuck', 'toast');
    }
  });

  let soundString = soundsArr.join(" ").toString();
  googleTTS(soundString, 'en', 1). // speed normal = 1 (default), slow = 0.24
  then((url) => {
    save(url, 'test');
    console.log(url);
  })
  .then(() => {
    console.log('AFTER SAY');
    record.stop();
  })
  .then(() => {
    // streamingMicRecognize();
  })
  .catch(err => {
    console.error(err.stack);
  });
}

streamingMicRecognize(); 



var ws281x = require('rpi-ws281x-native');


var NUM_LEDS = 7,
    pixelData = new Uint32Array(NUM_LEDS);

ws281x.init(NUM_LEDS);              

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});


// ---- animation-loop
var offset = 0;
setInterval(function () {
  for (var i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = colorwheel((offset + i) % 256);
  }

  offset = (offset + 1) % 256;
  ws281x.render(pixelData);
}, 1000 / 30);

console.log('Press <ctrl>+C to exit.');


// rainbow-colors, taken from http://goo.gl/Cs3H0v
function colorwheel(pos) {
  pos = 255 - pos;
  if (pos < 85) { return rgb2Int(255 - pos * 3, 0, pos * 3); }
  else if (pos < 170) { pos -= 85; return rgb2Int(0, pos * 3, 255 - pos * 3); }
  else { pos -= 170; return rgb2Int(pos * 3, 255 - pos * 3, 0); }
}

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
} 
