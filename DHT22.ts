/* This class builds heavily off of the dht11.js example in the rpio repository 
    https://github.com/jperkin/node-rpio.git
*/

import rpio from 'rpio';

const LED_PIN = 16;
const DHT_PIN = 7;
const BUFFER_SIZE = 20000;  // Increase this value on faster raspberry PIs
const START_SIGNAL_TIME = 10;  // The time in ms that we drive the pin to start the process
const RETRIES = 10;  // read retries before giving up

export interface Reading {
    temp: number;
    rh: number;
}

export class DHT22 {
    pin = DHT_PIN;

    readDht22(values: number[]) {
        const buf = Buffer.alloc(BUFFER_SIZE);
        const data = new Array(40);
        // readbuf seems to work slower the first time around so do a dummy read
        rpio.open(this.pin, rpio.INPUT, rpio.PULL_OFF);
        rpio.readbuf(this.pin, buf);
        
        // pull the pin low to signal the DHT we want to read it
        rpio.mode(this.pin, rpio.OUTPUT);
        rpio.write(this.pin, rpio.LOW);
        rpio.msleep(START_SIGNAL_TIME);

        // read the pin as quick as possible into the buffer 
        rpio.mode(DHT_PIN, rpio.INPUT);
        rpio.readbuf(DHT_PIN, buf);
        rpio.close(DHT_PIN);

        let dLen = 0;
        buf.join('').replace(/0+/g, '0').split('0').forEach(function (bits, n) {
            // skip over the start signals
            if (n < 2 || n > 41) {
                return;
            }

            data[dLen++] = bits.length;
        });

        // check to make sure there's 40 bits
        if (dLen !== 40) {
            console.log(`The bit length is ${dLen} and should be 40`);
            return false;
        }
    
    	/*
        * Calculate the low and high water marks.  As each model of Raspberry
        * Pi will run at different speeds, the length of each high bit will
        * vary, so calculate the average and use that to determine what is
        * "high" and "low".
        *
        * The longest "low" seen on a Raspberry Pi 4 is around 135, so the
        * default low here should be more than sufficient.
        */
        let low = 10000;
        let high = 0;
        for (let i = 0; i < 32; i++) {  // only the data bits
                if (data[i] < low)
                low = data[i];
            if (data[i] > high)
                high = data[i];
        }
        const avg = (low + high) / 2;

    	/*
        * The data received from the DHT11 is in 5 groups of 8-bits:
        *
        *	[0:7] integral relative humidity
        *	[8:15] decimal relative humidity
        *	[16:23] integral temperature
        *	[24:31] decimal temperature
        *	[32:39] checksum
        *
        * Parse the bit stream into the supplied "values" buffer.
        */
        values.fill(0);
        for (let i = 0; i < dLen; i++) {
            const group = Math.trunc(i / 8);

            /* The data is in big-endian format, shift it in. */
            values[group] <<= 1;

            /* This should be a high bit, based on the average. */
            if (data[i] >= avg)
                values[group] |= 1;
        }

        /*
        * Validate the checksum and return whether successful or not.  The
        * checksum is simply the value of the other 4 groups combined, masked
        * off to 8-bits.
        */
        return (values[4] == ((values[0] + values[1] + values[2] + values[3]) & 0xFF));
    }

    convertReadings(v: number[]): Reading {
        // console.log('Raw values:', v);
        let rh = v[0] << 8 | v[1];
        rh *= 0.1;
    
        let temp = (v[2] & 0x7F) << 8 | v[3];
        temp *= 0.1;
        temp = temp * (9 / 5) + 32;
    
        // console.log(`Converted values, temp = ${ temp } RH = ${ rh }`);
        return { temp, rh };
    }

    getTempAndRH(): Reading | null {
        this.ledOn(LED_PIN);
        let count = 0;
        while (count < RETRIES) {
            count++;
            const values: number[] = new Array(5);
            if (this.readDht22(values)) {
                const result = this.convertReadings(values);
                this.ledOff(LED_PIN);
                return result;
            }
            // The DHT22 requires a delay between read attempts
            rpio.sleep(5);
        }
        console.log('Retry limit exceeded');
        this.ledOff(LED_PIN);
        return null;
    }

    ledOn(pin: number): void {
        rpio.open(pin, rpio.OUTPUT, rpio.HIGH);
    }

    ledOff(pin: number): void {
        rpio.write(pin, rpio.LOW);
        rpio.close(pin);
    }
}