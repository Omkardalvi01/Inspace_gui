const SIM_E = document.getElementById("s_enable")
const SIM_D = document.getElementById("s_disable")
const mode = document.getElementById("mode")
const alt = document.getElementById("altitude") 
const vlt = document.getElementById("volt") 
const gyro = document.getElementById("GynoSpinRate") 
const lat = document.getElementById("Lat")
const long = document.getElementById("Long")
const sp = document.getElementById("speed") 
const pre = document.getElementById("pressure") 
const sats = document.getElementById("sats")
const state = document.getElementById("state")
const time = document.getElementById("time")
const packets = document.getElementById("pack_count")

const altarr = []
const prearr = []
const latarr = []
const longarr = []
const spdarr = []
const vltarr = []
const satsarr = []
const statearr = []
const timearr = []
const packet_arr = []

function stateconv(a){
  if(a == 1){
    return "Boot"
  }
  else if(a == 2){
    return "Test Mode"
  }
  else if(a == 3){
    return "LAUNCH PAD"
  }
  else if(a == 4){
    return "ASCENT"
  }
  else if(a == 5){
    return "DEPLOYED"
  }
  else if(a == 6){
    return "AEROBRAKE"
  }else if(a == 7){
    return "IMPACT"
  }
  else{
    return "NO"
  }
}

function simulation_e(){
    SIM_E.style = "background-color: #364591;"
    mode.textContent = "SIMULATION"
}
function simulation_d(){
    SIM_E.style = "background-color: #FFFFFF;"
    mode.textContent = "FLIGHT"
}
function rand(){
    return Math.random()
}
let data = [{
    y: [1,2,3].map(rand),
    mode: 'lines',
    line: {color: 'rgb(139,0,0)'}
}]
let layout = {
    height : 430,
    width : 820
}
Plotly.newPlot('Altitude',data, {responsive: true})
Plotly.newPlot('Pressure',data, {responsive: true})
Plotly.newPlot('Temperature',data, {responsive: true})
Plotly.newPlot('Gyro_Spin_Rate',data, {responsive: true})
Plotly.newPlot('Voltage',data, {responsive: true})

let cnt = 0
var interval = setInterval(() => {

  Plotly.extendTraces('Altitude', {
    y: [[rand()]]
  }, [0])
  Plotly.extendTraces('Pressure', {
    y: [[rand()]]
  }, [0])
  Plotly.extendTraces('Temperature', {
    y: [[rand()]]
  }, [0])
  Plotly.extendTraces('Gyro_Spin_Rate', {
    y: [[rand()]]
  }, [0])
  Plotly.extendTraces('Voltage', {
    y: [[rand()]]
  }, [0])

  fetch('test.csv')
  .then(response => response.text())
  .then(text => {
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        results.data.forEach(row => {
          altarr.push(row['ALTITUDE']);
          prearr.push(row['PRESSURE']);
          latarr.push(row['GPS_LATITUDE']);
          longarr.push(row['GPS_LONGITUDE']);
          spdarr.push(row['AIR_SPEED']);
          vltarr.push(row['VOLTAGE']);
          satsarr.push(row['GPS_SATS'])
          statearr.push(row["STATE"])
          timearr.push(row['MISSION_TIME'])
          packet_arr.push(row['PACKET_COUNT'])
        });

        alt.textContent = altarr[cnt] + "m"
        pre.textContent = prearr[cnt] + "bar"
        vlt.textContent = vltarr[cnt] + "V"
        lat.textContent = latarr[cnt] + "°"
        long.textContent = longarr[cnt] + "°"
        sp.textContent = spdarr[cnt] + "m/s"
        sats.textContent = satsarr[cnt]
        state.textContent =  stateconv(statearr[cnt])
        time.textContent = "Mission Time: \n" + timearr[cnt]
        packets.textContent = "Packet Count: \n" + packet_arr[cnt]
      }
    });
  })
.catch(error => console.error('Error fetching CSV:', error));

  if(++cnt === 36) clearInterval(interval);
}, 1000);







