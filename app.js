const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

let csvData = {
    altarr: [],
    spdarr: [],
    vltarr: [],
    prearr: [],
    latarr: [],
    longarr: [],
    satsarr: [],
    statearr: [],
    timearr: [],
    packet_arr: [],
    tiltx: [],
    tilty: [],
    tempArr: [],
    gyroArr: [],
    teamIdArr: [],
    modeArr: [],
    hsDeployedArr: [],
    pcDeployedArr: [],
    gpsTimeArr: [],
    gpsAltitudeArr: [],
    cmdEchoArr: []
};

async function writeCSVData(rows, timestamp) {
  const outputFilePath = path.join(__dirname, `/public/${timestamp}.csv`);
  const header = 'team_id,mission_time,packet_count,mode,state_value,altitude,air_speed,hs_deployed,pc_deployed,temperature,voltage,pressure,gps_time,gps_altitude,latitude,longitude,gps_sats,tilt_x,tilt_y,rot_z,cmd_echo\n';
  
  fs.writeFileSync(outputFilePath, header);

  let i = 0;
  const intervalId = setInterval(() => {
    if (i < rows.length) {
      fs.appendFileSync(outputFilePath, rows[i] + '\n');
      i++;
    } else {
      clearInterval(intervalId);
    }
  }, 1000); // Wait for 1 second
}

async function readCSVData() {
    try {
      const filePath = path.join(__dirname, '/public/test.csv'); 
      const data = fs.readFileSync(filePath, 'utf-8');  
      const rows = data.split('\n').slice(1);  
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Generate timestamp
  
      rows.forEach(row => {
        const cols = row.split(',');

        const team_id = cols[0];
        const mission_time = cols[1];
        const packet_count = cols[2];
        const mode = cols[3];
        const state_value = parseInt(cols[4]);
        const altitude = parseFloat(cols[5]);
        const air_speed = parseFloat(cols[6]);
        const hs_deployed = cols[7];
        const pc_deployed = cols[8];
        const temperature = parseFloat(cols[9]);
        const voltage = parseFloat(cols[10]);
        const pressure = parseFloat(cols[11]);
        const gps_time = cols[12];
        const gps_altitude = cols[13];
        const latitude = parseFloat(cols[14]);
        const longitude = parseFloat(cols[15]);
        const gps_sats = parseInt(cols[16]);
        const tilt_x = parseFloat(cols[17]);
        const tilt_y = parseFloat(cols[18]);
        const rot_z = parseFloat(cols[19]);
        const cmd_echo = cols[20];

        csvData.altarr.push(altitude);
        csvData.spdarr.push(air_speed);
        csvData.vltarr.push(voltage);
        csvData.prearr.push(pressure);
        csvData.latarr.push(latitude);
        csvData.longarr.push(longitude);
        csvData.satsarr.push(gps_sats);
        csvData.statearr.push(state_value);
        csvData.timearr.push(mission_time);
        csvData.packet_arr.push(packet_count);
        csvData.tiltx.push(tilt_x);
        csvData.tilty.push(tilt_y);
        csvData.tempArr.push(temperature);
        csvData.gyroArr.push(rot_z);
        csvData.teamIdArr.push(team_id);
        csvData.modeArr.push(mode);
        csvData.hsDeployedArr.push(hs_deployed);
        csvData.pcDeployedArr.push(pc_deployed);
        csvData.gpsTimeArr.push(gps_time);
        csvData.gpsAltitudeArr.push(gps_altitude);
        csvData.cmdEchoArr.push(cmd_echo);
      });
      console.log('CSV Data Processed Successfully');
      writeCSVData(rows, timestamp); // Pass the timestamp to the new function
    } catch (error) {
      console.error('Error reading or processing CSV data:', error);
    }
}
  
readCSVData();

app.use(express.static('public'));

app.get('/data', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.json(csvData);  // Send the CSV data as JSON to the client
  } catch (error) {
    console.error('Error reading CSV file:', error);
    res.status(500).send('Error reading CSV file');
  }
});

app.post('/log-cmnd', (req, res) => {
    const command = req.query.command;
    console.log(`Command received: ${command}`);
    res.status(200).send('Command logged successfully');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});