'use strict';

const fs = require('fs');

const googleTTS = require('google-tts-api');
const request = require('request');

const record = require('node-record-lpcm16');
const Speech = require('@google-cloud/speech');
const speech = Speech();

const play = require('play').Play();
play.usePlayer('mplayer');

const Gpio = require('onoff').Gpio;
const ledRed = new Gpio(22, 'out');
const ledBlue = new Gpio(20, 'out');
const ledGreen = new Gpio(21, 'out');
const ledButton = new Gpio(23, 'out');
const button = new Gpio(4, 'in', 'both');

let start = 1;
let highlightNum = 0;
let curseCount = 0;
let curseWordCount = {};

ledButton.writeSync(1);

button.watch(function(err, value) {
 if(value == 0) {
   if(start == 1) {
     ledButton.writeSync(0);
     recordStreaming();
     start = 0;
   } else {
     textToSpeech(`Holy sugar, you cursed ${curseCount} times`, 'summary');
   }
 }
});

process.on('SIGINT', function () {
  button.unexport();
  ledButton.unexport();
  ledBlue.unexport();
  ledGreen.unexport();
  ledRed.unexport();
});

const config = {
  config: {
    encoding: 'LINEAR16',
    languageCode: 'en-US',
    sampleRateHertz: 16000
  },
  interimResults: false // If you want interim results, set this to true
};

const colors = {
   'red': 'ledRed',
   'green': 'ledGreen',
   'blue': 'ledBlue',
   'yellow': ['ledRed', 'ledGreen'],
   'cyan': ['ledGreen', 'ledBlue'],
   'purple': [ledBlue, ledRed],
   'white': [ledBlue, ledRed, ledGreen]
};

const blink = (color, time) => {
 const led = colors[color];
 const light = eval(led);

 const blinkInterval = setInterval(() => {
    if(typeof led === 'object') {
       led.forEach((value) => {
         light.writeSync(light.readSync() ^ 1);
       });
    } else {
       light.writeSync(light.readSync() ^ 1);
    }
  }, time);

  setTimeout(() => {
   clearInterval(blinkInterval);
    if(typeof led === 'object') {
       led.forEach((value) => {
         light.writeSync(0);
       });
    } else {
       light.writeSync(0);
    }   
  }, 3000);
}

const sequence = () => {
 const first = setInterval(() => {
         ledBlue.writeSync(ledBlue.readSync() ^ 1);
  }, 200);

 const second = setInterval(() => {
         ledRed.writeSync(ledRed.readSync() ^ 1);
  }, 300);
}

const save = (url, filename) => {
  // File to save audio to
  var mp3File = filename + '.mp3';
  var mp3_file = fs.createWriteStream('./resources/' + mp3File);

  // Make API request
  return new Promise((resolve, reject) => {
    request.get(url).on('error', function(err) {
      console.log(err);
      reject();
    }).on('data', function(data) {
      mp3_file.write(data);
    }).on('end', function() {
      mp3_file.end();
      console.log("saved");
      if(filename === 'summary') {
        record.stop();
	play.sound(`./resources/summary.mp3`, () => {
          playback();
	});
      }
      resolve();
    });
  });
}


const recordStreaming = () => {
  const recognizeStream = speech.createRecognizeStream(config)
    .on('error', console.error)
    .on('data', data => {
	record.stop();
	console.log(data.results);
    	processing(data);
  }).on('end', () => { console.log('end stream');});


  record.start({
    sampleRateHertz: 16000, threshold: 0,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: false,
    recordProgram: 'arecord', // Try also "arecord" or "sox"
    silence: '2.0',
    device: 'plughw:0'
  }).on('error', console.error).pipe(recognizeStream);

}

const processing = data => {
  let saveFile = false;
  const curseWords = {
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
      curseCount++;

      if(curseWordCount[key]) {
 	curseWordCount[key]++;
      } else {
        curseWordCount[key] = 1;
      } 

      return word.replace(key, curseWords[key]);
    } 
   } 
   return word;
  });

  if(saveFile) {
    blink('red', 100);
    let soundString = censoredArr.join(" ").toString();
    textToSpeech(soundString, `highlight${highlightNum}`);
  }

  recordStreaming();
}

const textToSpeech = (string, fileName) => {

  googleTTS(string, 'en', 1). // speed normal = 1 (default), slow = 0.24
    then((url) => {
      save(url, fileName);
    })
    .catch(err => {
      console.error(err.stack);
    });

  if(fileName === `highlight${highlightNum}`) {
    highlightNum++;
  }
}

const playback = (i = 0) => {
console.log(highlightNum);
  if (i >= highlightNum) {
    play.sound('./resources/end.mp3');
    return;
  }

  setTimeout(() => {
    play.sound(`./resources/highlight${i}.mp3`, () => {
      playback(++i);
    });
  }, 1000);
};



