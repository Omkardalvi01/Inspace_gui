const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
const socket = require('socket.io');
const http = require('http');

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

let rows = [];
let timestamp = ""; // Generate timestamp

async function readCSVData() {
    try {
      const filePath = path.join(__dirname, '/public/test.csv'); 
      const data = fs.readFileSync(filePath, 'utf-8');  
      rows = data.split('\n').slice(1);  
      console.log('CSV Data Loaded Successfully');
    } catch (error) {
      console.error('Error reading or processing CSV data:', error);
    }
}
  
readCSVData();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const Server = http.createServer(app);

const io = socket(Server);

app.get('/data', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.json(csvData);  // Send the CSV data as JSON to the client
  } catch (error) {
    console.error('Error reading CSV file:', error);
    res.status(500).send('Error reading CSV file');
  }
});

Server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('cmnd', (command) => {
    console.log(`Command received: ${command}`);
    socket.broadcast.emit('cmnd', command);
  });

  socket.on('start', () => {
    console.log('Start command received');
    timestamp = new Date().toISOString().replace(/:/g, '-');
    if (!intervalId) {
      intervalId = setInterval(emitData, 1000);
    }
  });

  socket.on('pause', () => {
    console.log('Pause command received');
    clearInterval(intervalId);
    intervalId = null;
  });

  socket.on('resume', () => {
    console.log('Resume command received');
    if (!intervalId) {
      intervalId = setInterval(emitData, 1000);
    }
  });

  socket.on('reset', async () => {
    console.log('Reset command received');
    timestamp = new Date().toISOString().replace(/:/g, '-');
    clearInterval(intervalId);
    intervalId = null;
    currentIndex = 0;
    await readCSVData(); // Re-read the CSV so data restarts from the beginning
    if (!intervalId) {
      intervalId = setInterval(emitData, 1000);
    }
  });
});

let currentIndex = 0;
let intervalId = null;

function emitData() {
  if (currentIndex < rows.length) {
    const row = rows[currentIndex];
    const cols = row.split(',');

    const data = {
      teamId: cols[0],
      time: cols[1],
      packet: cols[2],
      mode: cols[3],
      state: parseInt(cols[4]),
      alt: parseFloat(cols[5]),
      spd: parseFloat(cols[6]),
      hsDeployed: cols[7],
      pcDeployed: cols[8],
      temp: parseFloat(cols[9]),
      vlt: parseFloat(cols[10]),
      pre: parseFloat(cols[11]),
      gpsTime: cols[12],
      gpsAltitude: cols[13],
      lat: parseFloat(cols[14]),
      long: parseFloat(cols[15]),
      sats: parseInt(cols[16]),
      tiltx: parseFloat(cols[17]),
      tilty: parseFloat(cols[18]),
      gyro: parseFloat(cols[19]),
      cmdEcho: cols[20]
    };

    io.emit('data', data);

    const outputFilePath = path.join(__dirname, `/public/${timestamp}.csv`);
    const header = 'team_id,mission_time,packet_count,mode,state_value,altitude,air_speed,hs_deployed,pc_deployed,temperature,voltage,pressure,gps_time,gps_altitude,latitude,longitude,gps_sats,tilt_x,tilt_y,rot_z,cmd_echo\n';
    if (currentIndex === 0) {
      fs.writeFileSync(outputFilePath, header);
    }
    fs.appendFileSync(outputFilePath, row + '\n');

    currentIndex++;
  } else {
    clearInterval(intervalId);
  }
}