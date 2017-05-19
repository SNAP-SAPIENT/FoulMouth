# FoulMouth

A digital swear jar that records and monitors the entirety of a game from the fanatics perspective capturing any and all curse words. For every curse word in the jar a certain amount of money is sent to a charity. At the end of the game, the jar is opened and what was said throughout the game is spit back out at the fanatic using substitutions for curse words.

# How to run the program

- Plug in Raspberry pi
- Connect the ethernet cord (or connect to a fast wifi)
- Connect a mouse, keyboard, and an HDMI cable to a monitor

### Make sure there is an active Google API account:

- visit [Google API Dashboard](https://console.developers.google.com/apis/dashboard?project=iron-tea-166414&duration=PT1H)
- Go to API Manager -> Credentials
    - Click "New Credentials", and create a service account or [click here](https://console.cloud.google.com/project/_/apiui/credential/serviceaccount)
    - Download the JSON for this service account
- For this prototype example I saved mine as My-project.json to my home directory


### Once the pi is booted:

- Open up a terminal window (top bar 3 icon to the right of the Raspberry pi logo)
- Once the terminal is open. type `cd /media/pi/8765-4321/FoulMouth` and then enter
- Manually set up the time by typing `sudo date -s "Day Month Year Time(24hours)"` and then enter
  - For example (May 19th 2017 1:03:30PM) `sudo date -s "19 May 2017 13:03:30"`
- Set the Google Application Credentials by typing `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service_account_file.json`
  - For this prototype example I typed ` export GOOGLE_APPLICATION_CREDENTIALS=/home/pi/My-Project.json`

### Now to run the program

- Type in `node recognize.js`
  - if you receive any binding errors on startup `Ctrl+C` and type `node recognize.js` again
- Once the blue lights and blue light button turn on the program is ready to GO!


Press the button and begin recording. Once you are down with your game or recording, hit the button again to get your replay!
