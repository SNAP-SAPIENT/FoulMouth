'use strict';

const fs = require('fs');
// const path = require('path');

const googleTTS = require('google-tts-api');
const request = require('request');

const record = require('node-record-lpcm16');
const Speech = require('@google-cloud/speech');
const speech = Speech();

const player = require('play-sound')();

const Gpio = require('onoff').Gpio;
const button = new Gpio(4, 'in');

// Instantiates a client

button.watch(function(err, value) {
  if (value == 0) {
     streamingMicRecognize();
  }
});

process.on('SIGING', function() {
button.unexport();
});

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
//record.stop();
  // Make API request
  return new Promise((resolve, reject) => {
    request.get(url).on('error', function(err) {
      console.log(err);
      reject();
    }).on('data', function(data) {
      //console.log("writing");
      mp3_file.write(data);
    }).on('end', function() {
      mp3_file.end();

      console.log("saved");
      resolve();
    });
  });
}


const streamingMicRecognize = () => {
  //player.play('./test.mp3');
 // console.log("Stream");
  // console.dir(recognizeStream);

  const recognizeStream = speech.createRecognizeStream(config)
    .on('error', console.error)
    .on('data', data => {
    //console.log('recongizeStream > data');
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
    device: 'plughw:0'
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
    //console.log(url);
  })
  .then(() => {
    console.log('AFTER SAVE');
    player.play('test.mp3', function(err) {
	console.log("Hey");
});
    //record.stop();
  })
  .then(() => {
    // streamingMicRecognize();
  })
  .catch(err => {
    console.error(err.stack);
  });
}





var ws281x = require('rpi-ws281x-native');


var NUM_LEDS = 7,
    pixelData = new Uint32Array(NUM_LEDS);

ws281x.init(NUM_LEDS);              

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});

function color(r, g, b) {
  r = r * 128 / 255;
  g = g * 128 / 255;
  b = b * 128 / 255;
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
} 

function renderIt() {
  for (var i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = color(255, 255, 255);
  }


  ws281x.render(pixelData);
}

