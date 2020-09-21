import axios from 'axios';
import { Reading } from '../DHT22';

export async function drawGauge(element: Element | HTMLElement | null) {

    if (!element) {
        console.log('Element must be defined');
        return;
    }

    const gauge = new google.visualization.Gauge(element);
    let temp: number = 0;
    let rh: number = 0;

    let gauge_data;
    let gauge_options
    try {
        const res = await axios.get<Reading>('./temp-rh');
        temp = Number(res.data.temp);
        rh = Number(res.data.rh);
        console.log(`Temperature: ${temp} and Relative Humidity: ${rh}`)

        gauge_data = google.visualization.arrayToDataTable([
            ['Label', 'Value'],
            ['Temperature', temp],
            ['Humidity', rh]
        ]);

        gauge_options = {
            // width: 400, height: 100,
            redFrom: 0, redTo: 20,
            yellowFrom: 80, yellowTo: 100,
            majorTicks: ['0', '', '20', '', '40', '', '60', '', '80', '', '100'],
            minorTicks: 2
        };
        gauge.draw(gauge_data, gauge_options);

    } catch (error) {
        console.log(error)
    }
}
