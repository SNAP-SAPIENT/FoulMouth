'use strict';

const fs = require('fs');

const googleTTS = require('google-tts-api');
const request = require('request');

const record = require('node-record-lpcm16');
const Speech = require('@google-cloud/speech');
const speech = Speech();

const player = require('play-sound')();

const Gpio = require('onoff').Gpio;
const ledBlue = new Gpio(21, 'out');
const ledGreen = new Gpio(22, 'out');
const ledRed = new Gpio(23, 'out');
const button = new Gpio(4, 'in', 'both');


ledBlue.writeSync(ledBlue.readSync() ^ 0);
ledGreen.writeSync(ledGreen.readSync() ^ 0);
ledRed.writeSync(ledRed.readSync() ^ 0);


button.watch(function(err, value) {
  console.log(value);
  if (value == 0) {
    streamingMicRecognize();
  }
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
  let soundsArr = data.results.split(" ");

  soundsArr.forEach((elem, index) => {
   if (elem.includes('fuck')) {
      soundsArr[index] = soundsArr[index].replace('fuck', 'toast');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }

   else if (elem.includes('ass')) {
      soundsArr[index] = soundsArr[index].replace('ass', 'tushy');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }

   else if (elem.includes('shit')) {
      soundsArr[index] = soundsArr[index].replace('shit', 'sugar');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }

   else if (elem.includes('damn')) {
      soundsArr[index] = soundsArr[index].replace('damn', 'shazam');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }

   else if (elem.includes('bitch')) {
      soundsArr[index] = soundsArr[index].replace('bitch', 'nutcrack');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }

   else if (elem.includes('piss')) {
      soundsArr[index] = soundsArr[index].replace('piss', 'piddle');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }

   else if (elem.includes('dick')) {
      soundsArr[index] = soundsArr[index].replace('dick', 'fishstick');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }

   else if (elem.includes('cock')) {
      soundsArr[index] = soundsArr[index].replace('cock', 'collywobble');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }

   else if (elem.includes('pussy')) {
      soundsArr[index] = soundsArr[index].replace('pussy', 'cougar');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }

   else if (elem.includes('bastard')) {
      soundsArr[index] = soundsArr[index].replace('bastard', 'barnacle');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }

   else if (elem.includes('slut')) {
      soundsArr[index] = soundsArr[index].replace('slut', 'nope');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }

   else if (elem.includes('douche')) {
      soundsArr[index] = soundsArr[index].replace('douche', 'donut');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }

   else if (elem.includes('hell')) {
      soundsArr[index] = soundsArr[index].replace('hell', 'hullabaloo');
      ledGreen.writeSync(1);  
      saveFile = true;  
   }
  });

  if(saveFile) {
    let soundString = soundsArr.join(" ").toString();
  
    googleTTS(soundString, 'en', 1). // speed normal = 1 (default), slow = 0.24
    then((url) => {
      save(url, `highlight${counter}`);
      counter++;
    })
    .then(() => {
      console.log('AFTER SAVE');
      //player.play('test.mp3', function(err) {
  	//console.log("Hey");
    // });
    })
    .catch(err => {
      console.error(err.stack);
    });
  }
}

