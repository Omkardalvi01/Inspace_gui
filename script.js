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
const tilt = document.getElementById("tilt")

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
const map = L.map('map').setView([19.2105, 72.8242], 10);
let marker = L.marker([0,0]).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function stateconv(a) {
  if (a == 1) {
    document.getElementById('boot').classList.add("boxhighlighted")
    return "Boot";
  } else if (a == 2) {
    document.getElementById('boot').classList.remove("boxhighlighted")
    document.getElementById('test').classList.add("boxhighlighted")
    return "Test Mode";
  } else if (a == 3) {
    document.getElementById('test').classList.remove("boxhighlighted")
    document.getElementById('launch').classList.add("boxhighlighted")
    return "LAUNCH PAD";
  } else if (a == 4) {
    document.getElementById('launch').classList.remove("boxhighlighted")
    document.getElementById('ascent').classList.add("boxhighlighted")
    return "ASCENT";
  } else if (a == 5) {
    document.getElementById('ascent').classList.remove("boxhighlighted")
    document.getElementById('rocket_d').classList.add("boxhighlighted")
    return "ROCKET_D";
  } else if (a == 6) {
    document.getElementById('rocket_d').classList.remove("boxhighlighted")
    document.getElementById('descent').classList.add("boxhighlighted")
    return "DESCENT";
  } else if (a == 7) {
    document.getElementById('descent').classList.remove("boxhighlighted")
    document.getElementById('aerobrake').classList.add("boxhighlighted")
    return "AEROBRAKE_R";
  } else if(a == 8){
    document.getElementById('aerobrake').classList.remove("boxhighlighted")
    document.getElementById('impact').classList.add("boxhighlighted")
    return "IMPACT";
  } 
  else {
    return "NO";
  }
}

function simulation_e() {
  SIM_E.style = "background-color: #364591;";
  mode.textContent = "SIMULATION";
}

function simulation_d() {
  SIM_E.style = "background-color: #FFFFFF;";
  mode.textContent = "FLIGHT";
}

function rand() {
  return Math.random();
}

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
Plotly.newPlot('Gyro_Spin_Rate', gyroData, createLayout('Gyro Spin Rate'));
Plotly.newPlot('Voltage', voltData, createLayout('Voltage'));

let cnt = 0;
let interval= null;

async function fetchData() {
  const response = await fetch('test.csv');
  const data = await response.text();
  const rows = data.split('\n').slice(1); 

  rows.forEach(row => {
    const cols = row.split(',');
    altarr.push(parseFloat(cols[5])); 
    prearr.push(parseFloat(cols[11])); 
    latarr.push(parseFloat(cols[14])); 
    longarr.push(parseFloat(cols[15])); 
    spdarr.push(parseFloat(cols[6]));  
    vltarr.push(parseFloat(cols[10])); 
    satsarr.push(parseInt(cols[16])); 
    statearr.push(parseInt(cols[4]));  
    timearr.push(cols[1]);  
    tiltx.push(parseFloat(cols[17]));
    tilty.push(parseFloat(cols[18]));          
    packet_arr.push(parseInt(cols[2])); 
  });
}

function plotTrajectory() {
  if (cnt < altarr.length) {
    Plotly.extendTraces('Altitude', { y: [[altarr[cnt]]] }, [0]);
    Plotly.extendTraces('Pressure', { y: [[prearr[cnt]]] }, [0]);
    Plotly.extendTraces('Temperature', { y: [[rand()]] }, [0]); // Assuming Temperature data is not available in CSV
    Plotly.extendTraces('Gyro_Spin_Rate', { y: [[rand()]] }, [0]); // Assuming Gyro Spin Rate data is not available in CSV
    Plotly.extendTraces('Voltage', { y: [[vltarr[cnt]]] }, [0]);

    alt.textContent = altarr[cnt] + "m";
    pre.textContent = prearr[cnt] + "bar";
    vlt.textContent = vltarr[cnt] + "V"
    lat.textContent = latarr[cnt] + "°";
    long.textContent = longarr[cnt] + "°";
    sp.textContent = spdarr[cnt] + "m/s";
    sats.textContent = satsarr[cnt];
    state.textContent = stateconv(statearr[cnt]);
    time.textContent = "Mission Time: \n" + timearr[cnt];
    packets.textContent = "Packet Count: \n" + packet_arr[cnt];
    tilt.textContent = `${tiltx[cnt]}° , ${tilty[cnt]}°`;
    map.setView([latarr[cnt],longarr[cnt]], 10)
    marker.setLatLng([latarr[cnt],longarr[cnt]])
    cnt++;
  } else {
    clearInterval(interval);
  }
}

async function startPlotting() {
  await fetchData();
  setInterval(plotTrajectory, 1000); 
}

document.getElementById('on').addEventListener('click', () => {
  if (!interval) {
      startPlotting();
  }
});
