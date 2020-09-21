import axios from 'axios';

const DIFF_LIMIT = 25; // The allowed percentage difference between the current reading and the average of the previous three readings

export async function drawLineChart(element: Element | HTMLElement | null, filter: boolean) {
    if (!element) {
        console.log('Element must be defined');
        return;
    }

    const chart = new google.visualization.AnnotationChart(element as Element);
    const options = {
        title: 'Temperature and Relative Humidity over Time',
        // width: 900,
        // height: 600,
        mas: 100,
        displayZoomButtons: true,

        series: {
            0: { color: 'blue', lineWidth: 1 },
            1: { color: 'green', lineWidth: 1 },
        },
        vAxis: { title: "Temperature (F) and Humidity (%) ", viewWindow: { max: 100, min: 0 }, gridlines: { count: 11 } },
        hAxis: { title: "Date and Time" },
        chartArea: { 'width': '100%', 'height': '80%' },
    }
    const response = await axios.get('/readings');
    const readingsCsv = response.data;
    let view = formatReadingsData(readingsCsv, filter);
    chart.draw(view, options);
}

function formatReadingsData(csvData: string, filter: boolean): google.visualization.DataTable {
    let readings: google.visualization.DataTable;
    // console.log(csvData);
    let csvRows = csvData.split('\n');

    let readingsArray = [];
    for (let i = 1; i < csvRows.length; i++) {  // skip the header row
        const rowString = csvRows[i];
        if (rowString.length > 0) {
            const row = rowString.split(',');
            const date = new Date(+row[0]);
            if (filter && validReading(row, readingsArray.slice(-3))) {
                readingsArray.push([date, Number(row[1]), Number(row[2])]);
            }
        }
    }
    // console.log(readingsArray);

    readings = new google.visualization.DataTable();
    readings.addColumn('date', 'Time');
    readings.addColumn('number', 'Temperature');
    readings.addColumn('number', 'RH');
    readings.addRows(readingsArray);
    return readings;
}

function validReading(reading: string[], previous: (Date | number)[][]): boolean {
    if (+reading[2] > 100) {
        return false;
    }
    if (previous.length > 0) {
        let tempTotal = 0;
        let rhTotal = 0;
        for (const row of previous) {
            tempTotal += +row[1];
            rhTotal += +row[2];
        }
        const tempAvg = tempTotal / previous.length;
        const rhAvg = rhTotal / previous.length;
        const tempDiff = Math.abs((+reading[1] - tempAvg) / tempAvg) * 100;  // percent difference between the current reading and the average of the previous three
        const rhDiff = Math.abs((+reading[2] - rhAvg) / rhAvg) * 100;
        if (tempDiff > DIFF_LIMIT || rhDiff > DIFF_LIMIT) {
            return false;
        }
    }
    return true;
}
