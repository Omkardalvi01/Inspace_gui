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

function stateconv(a) {
  if (a == 1) {
    return "Boot";
  } else if (a == 2) {
    return "Test Mode";
  } else if (a == 3) {
    return "LAUNCH PAD";
  } else if (a == 4) {
    return "ASCENT";
  } else if (a == 5) {
    return "ROCKET_D";
  } else if (a == 6) {
    return "AEROBRAKE_R";
  } else if (a == 7) {
    return "IMPACT";
  } else {
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

let layout = {
  height: 430,
  width: 820
};

Plotly.newPlot('Altitude', altData, layout);
Plotly.newPlot('Pressure', preData, layout);
Plotly.newPlot('Temperature', tempData, layout);
Plotly.newPlot('Gyro_Spin_Rate', gyroData, layout);
Plotly.newPlot('Voltage', voltData, layout);

let cnt = 0;
let interval= null;

async function fetchData() {
  const response = await fetch('test.csv');
  const data = await response.text();
  const rows = data.split('\n').slice(1); // Skip the header row

  rows.forEach(row => {
    const cols = row.split(',');
    altarr.push(parseFloat(cols[5]));  // ALTITUDE
    prearr.push(parseFloat(cols[11])); // PRESSURE
    latarr.push(parseFloat(cols[14])); // GPS_LATITUDE
    longarr.push(parseFloat(cols[15])); // GPS_LONGITUDE
    spdarr.push(parseFloat(cols[6]));  // AIR_SPEED
    vltarr.push(parseFloat(cols[10])); // VOLTAGE
    satsarr.push(parseInt(cols[16]));  // GPS_SATS
    statearr.push(parseInt(cols[4]));  // STATE
    timearr.push(cols[1]);             // MISSION_TIME
    packet_arr.push(parseInt(cols[2])); // PACKET_COUNT
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
    vlt.textContent = vltarr[cnt] + "V";
    lat.textContent = latarr[cnt] + "°";
    long.textContent = longarr[cnt] + "°";
    sp.textContent = spdarr[cnt] + "m/s";
    sats.textContent = satsarr[cnt];
    state.textContent = stateconv(statearr[cnt]);
    time.textContent = "Mission Time: \n" + timearr[cnt];
    packets.textContent = "Packet Count: \n" + packet_arr[cnt];

    cnt++;
  } else {
    clearInterval(interval);
  }
}

async function startPlotting() {
  await fetchData();
  setInterval(plotTrajectory, 1000); // Update the plot every second
}

document.getElementById('on').addEventListener('click', () => {
  if (!interval) {
      startPlotting();
  }
});
