/*
    Copyright 2021 Konstantinos Kritharidis
    
    This file is part of Chemical Reaction Simulator.

    Chemical Reaction Simulator is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    
    Chemical Reaction Simulator is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    
    You should have received a copy of the GNU Affero General Public License
    along with Chemical Reaction Simulator.  If not, see <https://www.gnu.org/licenses/>.
*/

colour = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']; 
sim_num = 0;

function PlotCharts(){
    if(sim_num > 0){
        ClearCharts();
    }
    sim_num++;
    InitCharts();
    PlotMoles();
    PlotMolBars();
    if(closed_container == 1){
        PlotConcentrations();
        PlotConcBars();
    }
    PlotU();
}

function ClearCharts(){
    let parent = document.getElementById('charts');
    while (parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
}

function InitCharts(){
    let myMolChart = document.createElement('canvas');
    myMolChart.id = "myMolChart";
    myMolChart.width = "750";
    myMolChart.height = "375";
    let myMolBars = document.createElement('canvas');
    myMolBars.id = "myMolBars";
    myMolBars.width = "750";
    myMolBars.height = "375";
    let myConcChart = document.createElement('canvas');
    myConcChart.id = "myConcChart";
    myConcChart.width = "750";
    myConcChart.height = "375";
    let myConcBars = document.createElement('canvas');
    myConcBars.id = "myConcBars";
    myConcBars.width = "750";
    myConcBars.height = "375";
    let myUChart = document.createElement('canvas');
    myUChart.id = "myUChart";
    myUChart.width = "750";
    myUChart.height = "375";
    document.getElementById('charts').appendChild(myMolChart);
    document.getElementById('charts').appendChild(myMolBars);
    if(closed_container){
        document.getElementById('charts').appendChild(myConcChart);
        document.getElementById('charts').appendChild(myConcBars);
    }
    document.getElementById('charts').appendChild(myUChart);
}

function PlotMoles(){
    var ctx = document.getElementById('myMolChart').getContext('2d');
    var datasets = [];
    var index = 0;
    datasets[index] = {
        type: 'scatter',
        label: reactants[0].name,
        data: reactants[0].mol,
        borderColor: colour[index%colour.length],
        backgroundColor: colour[index%colour.length],
        fill: false,
        showLine: true
    }
    index++;
    for (var i = 1; i < Object.keys(reactants).length; i++){
        datasets[index] = {
            label: reactants[i].name,
            data: reactants[i].mol,
            borderColor: colour[index%colour.length],
            backgroundColor: colour[index%colour.length],
            fill: false,
            showLine: true
        }
        index++;
    }
    for (var i = 0; i < Object.keys(products).length; i++){
        datasets[index] = {
            label: products[i].name,
            data: products[i].mol,
            borderColor: colour[index%colour.length],
            backgroundColor: colour[index%colour.length],
            fill: false,
            showLine: true
        }
        index++;
    }
    var myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: datasets,
            labels: time
        },
        options: {
            elements: {
                point:{
                    radius: 0
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        text: "Amount of substance - n (mol)",
                        display: true,
                        font: {
                            size: 14
                        }
                    },
                },
                x: {
                    title: {
                        text: "Time - t (s)",
                        display: true,
                        font: {
                            size: 14
                        }
                    },
                }
            },
            plugins: {
                title: {
                    text: 'Amount of each substance during the chemical reaction',
                    display: true,
                    position: 'top',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function PlotMolBars(){
    var ctx = document.getElementById('myMolBars').getContext('2d');
    var datasets = [];
    var index = 0;
    datasets[index] = {
        type: 'bar',
        label: reactants[0].name,
        data: [reactants[0].mol[0], reactants[0].mol[end_it-1]],
        borderColor: colour[index%colour.length],
        backgroundColor: colour[index%colour.length],
    }
    index++;
    for (var i = 1; i < Object.keys(reactants).length; i++){
        datasets[index] = {
            label: reactants[i].name,
            data: [reactants[i].mol[0], reactants[i].mol[end_it-1]],
            borderColor: colour[index%colour.length],
            backgroundColor: colour[index%colour.length],
        }
        index++;
    }
    for (var i = 0; i < Object.keys(products).length; i++){
        datasets[index] = {
            label: products[i].name,
            data: [products[i].mol[0], products[i].mol[end_it-1]],
            borderColor: colour[index%colour.length],
            backgroundColor: colour[index%colour.length],
        }
        index++;
    }
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: datasets,
            labels: ["Initial", "Final"]
        },
        options: {
            elements: {
                point:{
                    radius: 0
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        text: "Amount of substance - n (mol)",
                        display: true,
                        font: {
                            size: 14
                        }
                    },
                },
                x: {
                    title: {
                        text: "State",
                        display: true,
                        font: {
                            size: 14
                        }
                    },
                }
            },
            plugins: {
                title: {
                    text: 'Amount of each substance in the initial and the final state',
                    display: true,
                    position: 'top',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function PlotConcentrations(){
    var ctx = document.getElementById('myConcChart').getContext('2d');
    var datasets = [];
    var index = 0;
    datasets[index] = {
        type: 'scatter',
        label: reactants[0].name,
        data: reactants[0].conc,
        borderColor: colour[index%colour.length],
        backgroundColor: colour[index%colour.length],
        fill: false,
        showLine: true
    }
    index++;
    for (var i = 1; i < Object.keys(reactants).length; i++){
        datasets[index] = {
            label: reactants[i].name,
            data: reactants[i].conc,
            borderColor: colour[index%colour.length],
            backgroundColor: colour[index%colour.length],
            fill: false,
            showLine: true
        }
        index++;
    }
    for (var i = 0; i < Object.keys(products).length; i++){
        datasets[index] = {
            label: products[i].name,
            data: products[i].conc,
            borderColor: colour[index%colour.length],
            backgroundColor: colour[index%colour.length],
            fill: false,
            showLine: true
        }
        index++;
    }
    var myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: datasets,
            labels: time
        },
        options: {
            elements: {
                point:{
                    radius: 0
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        text: "Concentration - C (M)",
                        display: true,
                        font: {
                            size: 14
                        }
                    },
                },
                x: {
                    title: {
                        text: "Time - t (s)",
                        display: true,
                        font: {
                            size: 14
                        }
                    },
                }
            },
            plugins: {
                title: {
                    text: 'Concentration of each substance during the chemical reaction',
                    display: true,
                    position: 'top',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function PlotConcBars(){
    var ctx = document.getElementById('myConcBars').getContext('2d');
    var datasets = [];
    var index = 0;
    datasets[index] = {
        type: 'bar',
        label: reactants[0].name,
        data: [reactants[0].conc[0], reactants[0].conc[end_it-1]],
        borderColor: colour[index%colour.length],
        backgroundColor: colour[index%colour.length],
    }
    index++;
    for (var i = 1; i < Object.keys(reactants).length; i++){
        datasets[index] = {
            label: reactants[i].name,
            data: [reactants[i].conc[0], reactants[i].conc[end_it-1]],
            borderColor: colour[index%colour.length],
            backgroundColor: colour[index%colour.length],
        }
        index++;
    }
    for (var i = 0; i < Object.keys(products).length; i++){
        datasets[index] = {
            label: products[i].name,
            data: [products[i].conc[0], products[i].conc[end_it-1]],
            borderColor: colour[index%colour.length],
            backgroundColor: colour[index%colour.length],
        }
        index++;
    }
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: datasets,
            labels: ["Initial", "Final"]
        },
        options: {
            elements: {
                point:{
                    radius: 0
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        text: "Concentration - C (M)",
                        display: true,
                        font: {
                            size: 14
                        }
                    },
                },
                x: {
                    title: {
                        text: "State",
                        display: true,
                        font: {
                            size: 14
                        }
                    },
                }
            },
            plugins: {
                title: {
                    text: 'Concentration of each substance in the initial and the final state',
                    display: true,
                    position: 'top',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function PlotU(){
    var ctx = document.getElementById('myUChart').getContext('2d');
    var datasets = [];
    var index = 0;
    datasets[index] = {
        type: 'scatter',
        label: "U1",
        data: _U1,
        borderColor: colour[index%colour.length],
        backgroundColor: colour[index%colour.length],
        fill: false,
        showLine: true
    }
    index++;
    datasets[index] = {
        label: "U2",
        data: _U2,
        borderColor: colour[index%colour.length],
        backgroundColor: colour[index%colour.length],
        fill: false,
        showLine: true
    }
    index++;
    var myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: datasets,
            labels: time
        },
        options: {
            elements: {
                point:{
                    radius: 0
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        text: "Reaction Rate (M/s)",
                        display: true,
                        font: {
                            size: 14
                        }
                    },
                },
                x: {
                    title: {
                        text: "Time - t (s)",
                        display: true,
                        font: {
                            size: 14
                        }
                    },
                }
            },
            plugins: {
                title: {
                    text: 'Reaction rate of both sides during the chemical reaction',
                    display: true,
                    position: 'top',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}