document.addEventListener('DOMContentLoaded',()=>{
  
})
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
const team_id = document.getElementById("team_id");

// Socket.io client-side code
const socket = io();

const map = L.map('map').setView([19.2105, 72.8242], 15);
let marker = L.marker([19.2105, 72.8242]).addTo(map);
let polyline = L.polyline([], { color: 'blue' }).addTo(map);
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
  SIM_E.style.backgroundColor = "#F0F0F0";
  mode.textContent = "FLIGHT";
}

const tblcont = document.getElementById("csv-ka-data");
const pagecont = document.getElementById("not-csv-ka-data");

function csvtable() {
  pagecont.style.display="none";
  tblcont.style.display="block";
  // Auto-scroll to the bottom of the page
  window.scrollTo(0, document.body.scrollHeight);
}

function home() {
  tblcont.style.display="none";
  pagecont.style.display="block";
  window.scrollTo(0, 0);
}

function graph() {
  tblcont.style.display="none";
  pagecont.style.display="block";
  document.getElementById("graph_container_123").scrollIntoView();
  window.scrollBy(0, -110);
}

// Add event listeners for buttons
document.getElementById('homeBtn').addEventListener('click', home);
document.getElementById('graphBtn').addEventListener('click', graph);
document.getElementById('csvBtn').addEventListener('click', csvtable);

// Initializing Plotly Data Structures
let altData = [{
  y: [],
  mode: 'lines',
  line: { color: 'rgb(139,0,0)' }
}];

let preData = [{
  y: [],
  mode: 'lines',
  line: { color: 'rgb(139,0,0)' }
}];

let tempData = [{
  y: [],
  mode: 'lines',
  line: {color: 'rgb(139,0,0)' }
}];

let gyroData = [{
  y: [],
  mode: 'lines',
  line: { color: 'rgb(139,0,0)' }
}];

let voltData = [{
  y: [],
  mode: 'lines',
  line: { color: 'rgb(139,0,0)' }
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
Plotly.newPlot('Gyro_Spin_Rate', gyroData, createLayout('Gyro Spin Rate'));
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

let cnt = 0;
let interval = null;
let currentIndex = 0;

function plotTrajectory() {
  if (cnt < altarr.length) {
    Plotly.extendTraces('Altitude', { y: [[altarr[cnt]]] }, [0]);
    Plotly.extendTraces('Pressure', { y: [[prearr[cnt]]] }, [0]);
    Plotly.extendTraces('Temperature', { y: [[tempArr[cnt]]] }, [0]);
    Plotly.extendTraces('Gyro_Spin_Rate', { y: [[gyroArr[cnt]]] }, [0]);
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
    time.textContent = "Mission Time: " + timearr[cnt];
    packets.textContent = "Packet Count: " + packet_arr[cnt];
    tilt.textContent = `${tiltx[cnt]}° , ${tilty[cnt]}°`;
    cmd_echo.textContent = cmdEchoArr[cnt]; 
    team_id.textContent = teamIdArr[cnt];
    marker.setLatLng([latarr[cnt],longarr[cnt]]);
    //keep the below line to track the path of the cansat
    polyline.addLatLng([latarr[cnt], longarr[cnt]]);

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

    // Auto-scroll to the bottom of the page if CSV table is visible
    if (tblcont.style.display === "block") {
      window.scrollTo(0, document.body.scrollHeight);
    }

    cnt++;
  } else {
    clearInterval(interval);
  }
}

async function startPlotting() {
  interval = setInterval(plotTrajectory, 1000); 
}

// Start the Sim
document.getElementById('on').addEventListener('click', () => {
  socket.emit('start');
  if (!interval) {
    startPlotting();
  }
});

// pause the sim
document.getElementById('pauseBtn').addEventListener('click', () => {
  socket.emit('pause');
  clearInterval(interval);
  interval = null;  
});

// resume the sim
document.getElementById('resumeBtn').addEventListener('click', () => {
  socket.emit('resume');
  if (!interval) {
    interval = setInterval(plotTrajectory, 1000);
  }
});

function doReset() {
  clearInterval(interval);
  interval = null;

  // Reset the index for reading CSV
  currentIndex = 0;

  // Reset Plotly data arrays
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
  Plotly.newPlot('Gyro_Spin_Rate', gyroData, createLayout('Gyro Spin Rate'));
  Plotly.newPlot('Voltage', voltData, createLayout('Voltage'));
  Plotly.newPlot('trajectory-plot', trajectoryData, trajectoryLayout);

  // Reset the map
  map.setView([19.2105, 72.8242], 15);
  marker.setLatLng([19.2105, 72.8242]);
  polyline.setLatLngs([]);

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

  // Reset the 3D orientation
  cansat.rotation.x = 0;
  cansat.rotation.y = 0;
  cansat.rotation.z = 0;

  // Clear the table
  const tableBody = document.getElementById('csvTable').getElementsByTagName('tbody')[0];
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }
  cnt = 0;

  cmd_echo.textContent = "⠀";
}

document.getElementById('resetBtn').addEventListener('click', () => {
  socket.emit('reset');
});

socket.on('resetAll', () => {
  doReset();
});

SIM_E.addEventListener('click', simulation_e);
SIM_D.addEventListener('click', simulation_d);

const commandInput = document.getElementById('inputcommand');
const executeCommandButton = document.getElementById('executeCommand');
const commandOutput = document.getElementById('commandOutput');

commandInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        executeCommandButton.click();
    }
});

executeCommandButton.addEventListener('click', () => {
    const command = commandInput.value.trim();
    handleCommand(command);
    commandInput.value = ''; 

    // Send the command to the backend via socket
    socket.emit('cmnd', command);
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
  commandOutput.appendChild(newCommand); 
  // Auto-scroll to the bottom
  commandOutput.scrollTop = commandOutput.scrollHeight;
}

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
const orientationDiv = document.getElementById('orientation');
renderer.setSize(orientationDiv.clientWidth, orientationDiv.clientHeight);
orientationDiv.appendChild(renderer.domElement);

// Handle window resize
window.addEventListener('resize', () => {
    const width = orientationDiv.clientWidth;
    const height = orientationDiv.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Create materials for the sides, top, and bottom with better colors
const sideMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db }); // Blue
const topMaterial = new THREE.MeshStandardMaterial({ color: 0xe74c3c }); // Red
const bottomMaterial = new THREE.MeshStandardMaterial({ color: 0x2ecc71 }); // Green

// Create a cuboid to represent the CanSat with higher resolution
const geometry = new THREE.BoxGeometry(1, 2, 1, 10, 10, 10); // Increase segments for higher resolution
const materials = [sideMaterial, sideMaterial, topMaterial, bottomMaterial, sideMaterial, sideMaterial];
const cansat = new THREE.Mesh(geometry, materials);
scene.add(cansat);

// Add a directional light source
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// Add an ambient light source
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add axes helper
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

// Function to animate the CanSat
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Function to update CanSat rotation based on tilt values
function updateCanSatRotation(tiltX, tiltY, rotZ) {
    cansat.rotation.x = tiltX; 
    cansat.rotation.y = tiltY;
    cansat.rotation.z = rotZ;
}

animate();

socket.on('data', (data) => {
  // Update UI elements
  alt.textContent = data.alt + "m";
  pre.textContent = data.pre + "bar";
  vlt.textContent = data.vlt + "V";
  lat.textContent = data.lat + "°";
  long.textContent = data.long + "°";
  sp.textContent = data.spd + "m/s";
  sats.textContent = data.sats;
  state.textContent = stateconv(data.state);
  time.textContent = "Mission Time: " + data.time;
  packets.textContent = "Packet Count: " + data.packet;
  tilt.textContent = `${data.tiltx}° , ${data.tilty}°`;
  cmd_echo.textContent = data.cmdEcho;
  marker.setLatLng([data.lat, data.long]);
  polyline.addLatLng([data.lat, data.long]);

  // Update Plotly graphs
  Plotly.extendTraces('Altitude', { y: [[data.alt]] }, [0]);
  Plotly.extendTraces('Pressure', { y: [[data.pre]] }, [0]);
  Plotly.extendTraces('Temperature', { y: [[data.temp]] }, [0]);
  Plotly.extendTraces('Gyro_Spin_Rate', { y: [[data.gyro]] }, [0]);
  Plotly.extendTraces('Voltage', { y: [[data.vlt]] }, [0]);
  Plotly.extendTraces('trajectory-plot', {
    x: [[data.long]],
    y: [[data.lat]],
    z: [[data.alt]]
  }, [0]);

  // Add a new row to the table
  const tableBody = document.getElementById('csvTable').getElementsByTagName('tbody')[0];
  const newRow = tableBody.insertRow();
  newRow.insertCell().textContent = data.teamId;
  newRow.insertCell().textContent = data.time;
  newRow.insertCell().textContent = data.packet;
  newRow.insertCell().textContent = data.mode;
  newRow.insertCell().textContent = data.state;
  newRow.insertCell().textContent = data.alt;
  newRow.insertCell().textContent = data.spd;
  newRow.insertCell().textContent = data.hsDeployed;
  newRow.insertCell().textContent = data.pcDeployed;
  newRow.insertCell().textContent = data.temp;
  newRow.insertCell().textContent = data.vlt;
  newRow.insertCell().textContent = data.pre;
  newRow.insertCell().textContent = data.gpsTime;
  newRow.insertCell().textContent = data.gpsAltitude;
  newRow.insertCell().textContent = data.lat;
  newRow.insertCell().textContent = data.long;
  newRow.insertCell().textContent = data.sats;
  newRow.insertCell().textContent = data.tiltx;
  newRow.insertCell().textContent = data.tilty;
  newRow.insertCell().textContent = data.gyro;
  newRow.insertCell().textContent = data.cmdEcho;

  // Auto-scroll to the bottom of the page if CSV table is visible
  if (tblcont.style.display === "block") {
    window.scrollTo(0, document.body.scrollHeight);
  }

  // Update 3D model rotation
  updateCanSatRotation(data.tiltx, data.tilty, data.gyro);
});

socket.on('cmnd', (data) => {
  displayCommandOutput(data);
});

