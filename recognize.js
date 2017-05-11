'use strict';

const fs = require('fs');

const googleTTS = require('google-tts-api');
const request = require('request');

const record = require('node-record-lpcm16');
const Speech = require('@google-cloud/speech');
const speech = Speech();

const player = require('play-sound')();

const Gpio = require('onoff').Gpio;
//const ledBlue = new Gpio(21, 'out');
//const ledGreen = new Gpio(22, 'out');
const ledButton = new Gpio(23, 'out');
const button = new Gpio(4, 'in', 'both');
let start = 1;
let doubleHit = 0;


ledButton.writeSync(1);


button.watch(function(err, value) {
  console.log(value);

  if(start == 1) {
    start = 0;
    ledButton.writeSync(0);
    streamingMicRecognize();
  }  
});

process.on('SIGINT', function () {
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
  var mp3_file = fs.createWriteStream('./resources/' + mp3File);
  record.stop();
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
      ledButton.writeSync(1);
      start = 1;
      resolve();
    });
  });
}


const streamingMicRecognize = () => {
  const recognizeStream = speech.createRecognizeStream(config)
    .on('error', console.error)
    .on('data', data => {
	record.stop();
	console.log(data.results);
    	playback(data);
  }).on('end', () => { console.log('end stream');});


  record.start({
    sampleRateHertz: 16000, threshold: 0,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: true,
   recordProgram: 'arecord', // Try also "arecord" or "sox"
    silence: '2.0',
    device: 'plughw:0'
  }).on('error', console.error).pipe(recognizeStream);

}

const playback = data => {
  let counter = 0;
  let saveFile = false;
  let curseWords = {
    'ass': 'tushy',
    'shit': 'sugar',
    'fuck': 'toast',
    'damn': 'shazam',
    'bitch': 'nutcrack',
    'piss': 'piddle',
    'dick': 'fishstick',
    'cock': 'collywobble',
    'pussy': 'cougar',
    'bastard': 'barnacle',
    'slut': 'nope',
    'douche': 'donut',
    'hell': 'hullabaloo'
  };
  let soundsArr = data.results.split(" ");

  let censoredArr = soundsArr.map(word => {
   console.log(word);
   for(let key in curseWords) {
    if(word.includes(key)) {

      saveFile = true;  
      return word.replace(key, curseWords[key]);
    } 
   } 
   return word;
  });

console.log(censoredArr);

  if(saveFile) {
    let soundString = censoredArr.join(" ").toString();
  
    googleTTS(soundString, 'en', 1). // speed normal = 1 (default), slow = 0.24
    then((url) => {
      save(url, `highlight${counter}`);
      counter++;
    })
    .then(() => {
      console.log('AFTER SAVE');
      player.play('./resources/highlight0.mp3', function(err) {
  	console.log("Hey");
      });
    })
    .catch(err => {
      console.error(err.stack);
    });
  } else {
    ledButton.writeSync(1);
    start = 1;
  }
}

