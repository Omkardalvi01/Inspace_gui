const altgrp = document.querySelectorAll('.Altitude'); 
const sec = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

altgrp.forEach(canvas => {
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: sec,
            datasets: [{
                label: 'Altitude',
                fill: true,
                borderColor: 'rgb(0,0,0)',
                data: [100, 150, 200, 300, 400, 500, 550, 600, 700, 800, 900, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100],
                borderWidth: 1,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});

