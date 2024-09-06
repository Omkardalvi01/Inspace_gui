const SIM_E = document.getElementById("s_enable");
const SIM_D = document.getElementById("s_disable");
const mode = document.getElementById("mode");
const alt = document.getElementById("altitude");
const vlt = document.getElementById("volt");
const gyro = document.getElementById("GynoSpinRate");
const lat = document.getElementById("Lat");
const long = document.getElementById("Long");
const sp = document.getElementById("speed");
const pre = document.getElementById("pressure");
const sats = document.getElementById("sats");
const state = document.getElementById("state");
const time = document.getElementById("time");
const packets = document.getElementById("pack_count");
const tilt = document.getElementById("tilt");
const cmd_echo = document.getElementById("CMD_ECHO");
const pagecont = document.querySelector(".test")
const tblcont = document.getElementById("csv-ka-data");
const team_id = document.getElementById("team_id");
tblcont.classList.toggle("hidden")

const altarr = [];
const prearr = [];
const latarr = [];
const longarr = [];
const spdarr = [];
const vltarr = [];
const satsarr = [];
const statearr = [];
const timearr = [];
const packet_arr = [];
const tiltx = [];
const tilty = [];
const tempArr = [];
const gyroArr = [];
const teamIdArr = [];
const modeArr = [];
const hsDeployedArr = [];
const pcDeployedArr = [];
const gpsTimeArr = [];
const gpsAltitudeArr = [];
const cmdEchoArr = [];

const map = L.map('map').setView([19.2105, 72.8242], 10);
let marker = L.marker([19.2105, 72.8242]).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function stateconv(a) {
  if (a == 1) {
    document.getElementById('boot').classList.add("boxhighlighted");
    return "Boot";
  } else if (a == 2) {
    document.getElementById('boot').classList.remove("boxhighlighted");
    document.getElementById('test').classList.add("boxhighlighted");
    return "Test Mode";
  } else if (a == 3) {
    document.getElementById('test').classList.remove("boxhighlighted");
    document.getElementById('launch').classList.add("boxhighlighted");
    return "LAUNCH PAD";
  } else if (a == 4) {
    document.getElementById('launch').classList.remove("boxhighlighted");
    document.getElementById('ascent').classList.add("boxhighlighted");
    return "ASCENT";
  } else if (a == 5) {
    document.getElementById('ascent').classList.remove("boxhighlighted");
    document.getElementById('rocket_d').classList.add("boxhighlighted");
    document.getElementById('pc_deploy').classList.add("boxhighlighted");
    return "ROCKET_D";
  } else if (a == 6) {
    document.getElementById('rocket_d').classList.remove("boxhighlighted");
    document.getElementById('descent').classList.add("boxhighlighted");
    return "DESCENT";
  } else if (a == 7) {
    document.getElementById('glider').classList.add("boxhighlighted");
    document.getElementById('descent').classList.remove("boxhighlighted");
    document.getElementById('aerobrake').classList.add("boxhighlighted");
    return "AEROBRAKE_R";
  } else if (a == 8) {

    document.getElementById('aerobrake').classList.remove("boxhighlighted");
    document.getElementById('impact').classList.add("boxhighlighted");
    return "IMPACT";
  } else {
    return "NO";
  }
}

function simulation_e() {
  SIM_E.style.backgroundColor = "#90EE90";
  mode.textContent = "SIMULATION";
}

function simulation_d() {
  SIM_E.style.backgroundColor = "#FFFFFF";
  mode.textContent = "FLIGHT";
}

function csvtable(){
  tblcont.classList.remove("hidden")
  pagecont.classList.add("hidden")
}
function home(){
  tblcont.classList.add("hidden")
  pagecont.classList.remove("hidden")
  //scroll to top
  window.scrollTo(0, 0);
}
function graph(){
  tblcont.classList.add("hidden")
  pagecont.classList.remove("hidden")
  //href =#graph -20px
  document.getElementById("graph_container_123").scrollIntoView();
  //scroll up 
  window.scrollBy(0, -110);
}
// Initializing Plotly Data Structures
let altData = [{
  y: [],
  mode: 'lines',
  line: { color: 'rgb(139,0,0)' }
}];

let preData = [{
  y: [],
  mode: 'lines',
  line: { color: 'rgb(0,139,0)' }
}];

let tempData = [{
  y: [],
  mode: 'lines',
  line: { color: 'rgb(0,0,139)' }
}];

let gyroData = [{
  y: [],
  mode: 'lines',
  line: { color: 'rgb(139,139,0)' }
}];

let voltData = [{
  y: [],
  mode: 'lines',
  line: { color: 'rgb(139,0,139)' }
}];

function createLayout(yAxisTitle) {
  return {
    height: 430,
    width: 820,
    xaxis: { title: 'TIME' },
    yaxis: { title: yAxisTitle }
  };
}

Plotly.newPlot('Altitude', altData, createLayout('Altitude'));
Plotly.newPlot('Pressure', preData, createLayout('Pressure'));
Plotly.newPlot('Temperature', tempData, createLayout('Temperature'));
// Plotly.newPlot('Gyro_Spin_Rate', gyroData, createLayout('Gyro Spin Rate'));
Plotly.newPlot('Voltage', voltData, createLayout('Voltage'));

// Initializing 3D Plotly Data Structure
let trajectoryData = [{
  x: [],
  y: [],
  z: [],
  mode: 'lines',
  type: 'scatter3d',
  line: {
    width: 6,
    color: 'blue',
    colorscale: 'Viridis'
  }
}];

let trajectoryLayout = {
  title: '3D Trajectory of CanSat',
  scene: {
    xaxis: { title: 'Longitude' },
    yaxis: { title: 'Latitude' },
    zaxis: { title: 'Altitude' }
  }
};

Plotly.newPlot('trajectory-plot', trajectoryData, trajectoryLayout);

// Data Plotting and Fetching Logic
let cnt = 0;
let interval = null;

async function fetchData() {
  const response = await fetch('test.csv');
  const data = await response.text();
  const rows = data.split('\n').slice(1); 

  rows.forEach(row => {
    const cols = row.split(',');

    // Map CSV columns to your variables
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

    // Push data to respective arrays
    altarr.push(altitude); 
    spdarr.push(air_speed); 
    vltarr.push(voltage);
    prearr.push(pressure);
    latarr.push(latitude);
    longarr.push(longitude);
    satsarr.push(gps_sats);
    statearr.push(state_value);
    timearr.push(mission_time);
    packet_arr.push(packet_count);
    tiltx.push(tilt_x);
    tilty.push(tilt_y);
    tempArr.push(temperature);
    gyroArr.push(rot_z);
    teamIdArr.push(team_id);
    modeArr.push(mode);
    hsDeployedArr.push(hs_deployed);
    pcDeployedArr.push(pc_deployed);
    gpsTimeArr.push(gps_time);
    gpsAltitudeArr.push(gps_altitude);
    cmdEchoArr.push(cmd_echo);
  });
}

function plotTrajectory() {
  if (cnt < altarr.length) {
    Plotly.extendTraces('Altitude', { y: [[altarr[cnt]]] }, [0]);
    Plotly.extendTraces('Pressure', { y: [[prearr[cnt]]] }, [0]);
    Plotly.extendTraces('Temperature', { y: [[tempArr[cnt]]] }, [0]);
    // Plotly.extendTraces('Gyro_Spin_Rate', { y: [[gyroArr[cnt]]] }, [0]);
    Plotly.extendTraces('Voltage', { y: [[vltarr[cnt]]] }, [0]);

    Plotly.extendTraces('trajectory-plot', {
      x: [[longarr[cnt]]],
      y: [[latarr[cnt]]],
      z: [[altarr[cnt]]]
    }, [0]);

    alt.textContent = altarr[cnt] + "m";
    pre.textContent = prearr[cnt] + "bar";
    vlt.textContent = vltarr[cnt] + "V";
    lat.textContent = latarr[cnt] + "°";
    long.textContent = longarr[cnt] + "°";
    sp.textContent = spdarr[cnt] + "m/s";
    sats.textContent = satsarr[cnt];
    state.textContent = stateconv(statearr[cnt]);
    time.textContent = "Mission Time: \n" + timearr[cnt];
    packets.textContent = "Packet Count: \n" + packet_arr[cnt];
    tilt.textContent = `${tiltx[cnt]}° , ${tilty[cnt]}°`;
    cmd_echo.textContent = cmdEchoArr[cnt]; 
    team_id.textContent = teamIdArr[cnt];
    marker.setLatLng([latarr[cnt],longarr[cnt]]);
    map.setView([latarr[cnt],longarr[cnt]], 10);

    // Add a new row to the table
    const tableBody = document.getElementById('csvTable').getElementsByTagName('tbody')[0];
    const newRow = tableBody.insertRow();
    newRow.insertCell().textContent = teamIdArr[cnt];
    newRow.insertCell().textContent = timearr[cnt];
    newRow.insertCell().textContent = packet_arr[cnt];
    newRow.insertCell().textContent = modeArr[cnt];
    newRow.insertCell().textContent = statearr[cnt];
    newRow.insertCell().textContent = altarr[cnt];
    newRow.insertCell().textContent = spdarr[cnt];
    newRow.insertCell().textContent = hsDeployedArr[cnt];
    newRow.insertCell().textContent = pcDeployedArr[cnt];
    newRow.insertCell().textContent = tempArr[cnt];
    newRow.insertCell().textContent = vltarr[cnt];
    newRow.insertCell().textContent = prearr[cnt];
    newRow.insertCell().textContent = gpsTimeArr[cnt];
    newRow.insertCell().textContent = gpsAltitudeArr[cnt];
    newRow.insertCell().textContent = latarr[cnt];
    newRow.insertCell().textContent = longarr[cnt];
    newRow.insertCell().textContent = satsarr[cnt];
    newRow.insertCell().textContent = tiltx[cnt];
    newRow.insertCell().textContent = tilty[cnt];
    newRow.insertCell().textContent = gyroArr[cnt];
    newRow.insertCell().textContent = cmdEchoArr[cnt];

    cnt++;
  } else {
    clearInterval(interval);
  }
}

async function startPlotting() {
  await fetchData();
  interval = setInterval(plotTrajectory, 1000); 
}

// Start the Sim
document.getElementById('on').addEventListener('click', () => {
  if (!interval) {
    startPlotting();
  }
});

// pause the sim
document.getElementById('pauseBtn').addEventListener('click', () => {
  clearInterval(interval);
  interval = null;  
});

// resume the sim
document.getElementById('resumeBtn').addEventListener('click', () => {
  if (!interval) {
    interval = setInterval(plotTrajectory, 1000);
  }
});


// Reset the sim
document.getElementById('resetBtn').addEventListener('click', () => {
  // Clear the interval
  clearInterval(interval);
  interval = null;

  // Clear all data arrays
  altarr.length = 0;
  prearr.length = 0;
  latarr.length = 0;
  longarr.length = 0;
  spdarr.length = 0;
  vltarr.length = 0;
  satsarr.length = 0;
  statearr.length = 0;
  timearr.length = 0;
  packet_arr.length = 0;
  tiltx.length = 0;
  tilty.length = 0;
  tempArr.length = 0;
  gyroArr.length = 0;
  teamIdArr.length = 0;
  modeArr.length = 0;
  hsDeployedArr.length = 0;
  pcDeployedArr.length = 0;
  gpsTimeArr.length = 0;
  gpsAltitudeArr.length = 0;
  cmdEchoArr.length = 0;

  // Clear Plotly data arrays
  altData[0].y.length = 0;
  preData[0].y.length = 0;
  tempData[0].y.length = 0;
  gyroData[0].y.length = 0;
  voltData[0].y.length = 0;
  trajectoryData[0].x.length = 0;
  trajectoryData[0].y.length = 0;
  trajectoryData[0].z.length = 0;

  // Reset Plotly graphs
  Plotly.newPlot('Altitude', altData, createLayout('Altitude'));
  Plotly.newPlot('Pressure', preData, createLayout('Pressure'));
  Plotly.newPlot('Temperature', tempData, createLayout('Temperature'));
  // Plotly.newPlot('Gyro_Spin_Rate', gyroData, createLayout('Gyro Spin Rate'));
  Plotly.newPlot('Voltage', voltData, createLayout('Voltage'));
  Plotly.newPlot('trajectory-plot', trajectoryData, trajectoryLayout);

  // Reset the map
  map.setView([19.2105, 72.8242], 10);
  marker.setLatLng([0,0]);

  // Reset the data fields
  alt.textContent = "0m";
  pre.textContent = "0bar";
  vlt.textContent = "0V";
  lat.textContent = "0°";
  long.textContent = "0°";
  sp.textContent = "0m/s";
  sats.textContent = "0";
  state.textContent = "NO";
  time.textContent = "Mission Time: 0";
  packets.textContent = "Packet Count: 0";
  tilt.textContent = "0° , 0°";
  cmd_echo.textContent = "⠀";

  document.getElementById('impact').classList.remove("boxhighlighted");
  document.getElementById('pc_deploy').classList.remove("boxhighlighted");
  document.getElementById('glider').classList.remove("boxhighlighted");
  document.getElementById('aerobrake').classList.remove("boxhighlighted");
  document.getElementById('descent').classList.remove("boxhighlighted");
  document.getElementById('rocket_d').classList.remove("boxhighlighted");
  document.getElementById('ascent').classList.remove("boxhighlighted");
  document.getElementById('launch').classList.remove("boxhighlighted");
  document.getElementById('test').classList.remove("boxhighlighted");
  document.getElementById('boot').classList.remove("boxhighlighted");

  // Clear the table
  const tableBody = document.getElementById('csvTable').getElementsByTagName('tbody')[0];
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }
  cnt = 0;

  cmd_echo.textContent = "⠀";

  startPlotting();
});


const commandInput = document.getElementById('inputcommand');
const executeCommandButton = document.getElementById('executeCommand');
const commandOutput = document.getElementById('commandOutput');

executeCommandButton.addEventListener('click', () => {
    const command = commandInput.value.trim();
    handleCommand(command);
    commandInput.value = ''; 
});

function handleCommand(command) {
    let response = '';

    if (command.startsWith('echo ')) {
        response = command.slice(5); 
    } else {
        response = `Unknown command: ${command}`;
    }

    displayCommandOutput(response);
}


function displayCommandOutput(text) {
  const commandOutput = document.getElementById('commandOutput');
  const newCommand = document.createElement('div');
  newCommand.textContent = text;
  commandOutput.appendChild(newCommand); // Append new command at the end

  // Auto-scroll to the bottom
  commandOutput.scrollTop = commandOutput.scrollHeight;
}