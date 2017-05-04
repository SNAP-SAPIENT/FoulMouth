'use strict';

const fs = require('fs');
// const path = require('path');

const googleTTS = require('google-tts-api');
const request = require('request');

const record = require('node-record-lpcm16');
const Speech = require('@google-cloud/speech');
const speech = Speech();

const play = require('play');

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

  // Make API request
  return new Promise((resolve, reject) => {
    request.get(url).on('error', function(err) {
      console.log(err);
      reject();
    }).on('data', function(data) {
      mp3_file.write(data);
    }).on('end', function() {
      mp3_file.end();
      play.sound(mp3File);
      resolve();
    });
  });
}

// const say = function (url) {
//   // Pipe to Lame to convert to PCM, then pipe to speakers
//   return new Promise((resolve, reject) => {
//     request
//     .get(url)
//     .on('error', function (err) {
//       console.log(err);
//     })
//     .pipe(new lame.Decoder())
//     .on('format', function (format) {
//       //console.log(format);
//
//
//       // const mySpeaker = new speaker(format);
//       // mySpeaker.on('finish', () => {
//       //   streamingMicRecognize();
//       //   console.log('Speaker');
//       // });
//       //const mySpeaker = Speaker(format);
//       var playing = this.pipe(Speaker(format));
//       playing.on('done', console.log);
//
//       resolve();
//
//       // playing.on('error', function (err) {
//       //   console.log('SAY > ERROR', err);
//       //   reject();
//       // });
//     });
//   });
// }

const streamingMicRecognize = () => {
  console.log("Stream");
  // console.dir(recognizeStream);

  const recognizeStream = speech.createRecognizeStream(config).on('error', console.error).on('data', data => {
    console.log('recongizeStream > data');
    record.stop();
    playback(data);
    process.stdout.write(data.results);
  }).on('end', () => {
    console.log("end stream")
  });
  // console.dir(recognizeStream);

  record.start({
    sampleRateHertz: 16000, threshold: 0,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: false,
    recordProgram: 'rec', // Try also "arecord" or "sox"
    silence: '10.0'
  }).on('error', console.error).pipe(recognizeStream);

  //console.log('Listening, press Ctrl+C to stop.');
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
    // console.log(url);
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
