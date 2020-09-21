import { drawGauge } from './Gauges';
import { drawLineChart } from './LineChart';

const UPDATE_INTERVAL = 5 * 60 * 1000;
const FILTER = true;  // set to true to filter out invalid sensor readings

google.charts.load('current', {'packages':['corechart', 'annotationchart', 'gauge']});
google.charts.setOnLoadCallback(chartUpdater);

async function drawChart() {
    // create gauges
    drawGauge(document.getElementById('gauge_div'));
    // create Annotation Chart
    drawLineChart(document.getElementById('chart_div'), FILTER);
}

function chartUpdater() {
    // draw charts immediately
    drawChart();

    setInterval(drawChart, UPDATE_INTERVAL);
}
