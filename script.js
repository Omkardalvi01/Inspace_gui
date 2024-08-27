const SIM_E = document.getElementById("s_enable")
const SIM_D = document.getElementById("s_disable")
const mode = document.getElementById("mode")

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

  if(++cnt === 100) clearInterval(interval);
}, 1000);