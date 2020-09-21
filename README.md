# Raspberry PI Temperature and Humidity monitor

This project is build with a DHT22 temperature and humidity sensor attached to a
Raspberry PI 1 Model B.

Specs for the DHT22 can be found at:  
 https://cdn-shop.adafruit.com/datasheets/Digital+humidity+and+temperature+sensor+AM2302.pdf

This project was inspired by and modified from the following instructable.  
 https://www.instructables.com/id/Raspberry-Pi-Temperature-Humidity-Network-Monitor/

Instead of using the wiringPI package (which is now deprecated
http://wiringpi.com/wiringpi-deprecated/) this project uses the
rpio npm package.

The dht11.js example in the rpio npm package has been used significantly as an
example of how to read a DHT sensor.  The sensor used for this project is the
DHT22 which is a little different from the DHT11.

## Instructions for building and setting the Raspberry PI

 - First go to the Raspberry PI site and down load the Raspberry PI Imager app.  
 `https://www.raspberrypi.org/downloads/`  
   - Using the Imager app write "RASPBERRY PI OS LITE (32-BIT)" to your SD Card.  

- Initializing Raspbian
    - Attach a keyboard and monitor to your pi.
    - plug the SD card in the pi and start it up
    - login with user pi and password raspberry
    - Run the rasp-config tool
    (https://www.raspberrypi.org/documentation/configuration/raspi-config.md)  
    `sudo raspi-config`  
    - Using this tool configure password, network, localization, and time zone.
    - Important - select option 5 Interfacing Options and enable SSH
    - After rebooting check the network connection with ifconfig and get the IP
    address of the pi
- For convenience you can use ssh-copy-id to set the pi up so a password is not
needed to ssh in.  
`ssh-copy-id pi@192.168.1.111`
- Update raspbian  
`sudo apt update`  
`sudo apt upgrade`  

## Install nodejs on your pi
Here's a good set of instructions 
https://www.instructables.com/id/Install-Nodejs-and-Npm-on-Raspberry-Pi/  
Basically go to the nodejs distribution download page
https://nodejs.org/dist/latest-v10.x/ and find the most current version for
your hardware.  e.g. node-v10.22.1-linux-armv6l.tar.gz (or what ever the latest
arm61 file is)  
- Download to your pi  
`wget https://nodejs.org/dist/latest-v10.x/node-v10.22.1-linux-armv6l.tar.gz`
> Note if you have a newer Raspberry PI you may need to chose a different version.
- Untar the package  
`tar -xzf node-v10.22.1-linux-armv6l.tar.gz`  
- Copy node an execution path directory  
`cd node-v10.22.1-linux-armv6l/`  
`sudo cp -r * /usr/local`  
- Check out the installs  
`node -v`  
`npm -v`  

## Set up the application
- copy the rpi-temperature sources from github  
`wget https://github.com/ericmvaughn/rpi-temperature/archive/master.zip`
- unzip the file  
`unzip master.zip`
- Go into the source directory  
`cd rpi-temperature`
- Install the npm modules  
`npm install`
- Run the typescript and webpack compiles  
`npm run build`

## Test that everything works
- Run node from the rpi-temperature directory  
`sudo node out/app.js`  
- Using a browser on another machine go to the rpi IP address
- The page should come up and the current temperature and relative humidity should
be displayed on the gauges.
- The LED connected to the rpi should turn on briefly every ten minutes indicating
that a new reading is being taken.

## Setting up the RPI to automatically run the app on boot up

Using pm2 (Process Manager 2)

- Install pm2  
`sudo npm install pm2 -g`

- Start the app with pm2  
`sudo pm2 start out/app.js`

- Create a service so that it will automatically start  
`sudo pm2 startup`

### Some useful pm2 commands

- Get a list of the current apps  
`sudo pm2 list`  
- Get more details on the app  
`sudo pm2 describe app`  
- Check out the apps log  
`sudo pm2 logs app --lines 20`  
- Restart the app after a code change  
`sudo pm2 restart app`  
- Delete the app to start over with pm2  
`sudo pm2 delete app`  
- Look at the environment variables used by pm2  
`sudo pm2 env 0`  
- Start a handy monitoring dashboard for pm2  
`sudo pm2 monit`  
