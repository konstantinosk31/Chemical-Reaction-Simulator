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

steps = 2*10**2;
precision = 0.0000001;
eps = 10**-9;

dt = 0.01;
end_it = MAXIT;

time = [];
_dt = [];
_U1 = [];
_U2 = [];
_U = [];

var first_react = 0; //first reactant that changes concentration
var first_prod = 0; //first product that changes concentration
var show_concentrations = 1;

function Load() {
    AddElement(true);
    AddElement(false);
    InitV(true);
    InitConstsReversible();
}

function calculateU1(it){
    var val = K1;
    for (var i = 0; i < Object.keys(reactants).length; i++){
        if(!closed_container && reactants[i].state == "(g)") val = 0;
        else val *= (reactants[i].conc[it]**reactants[i].order);
    }
    _U1[it] = val;
    return val;
}

function calculateU2(it){
    var val = K2;
    for (var i = 0; i < Object.keys(products).length; i++){
        if(!closed_container && products[i].state == "(g)") val = 0;
        else val *= (products[i].conc[it]**products[i].order);
    }
    _U2[it] = val;
    return val;
}

function calculatedt(U1, U2, starting_limiting_mol_over_coeff){
    var mean_U = (Math.abs(U1)+Math.abs(U2))/2;
    if (mean_U > eps)
        dt = starting_limiting_mol_over_coeff/steps/mean_U/V;
    return;
}

function InitVars(){
    dt = 0.01;
    end_it = MAXIT;

    time = [0];
    _dt = [];
    _U1 = [];
    _U2 = [];

    for (var i = 0; i < Object.keys(reactants).length; i++){
        reactants[i].mol = [reactants[i].mol[0]];
        reactants[i].conc = [reactants[i].conc[0]];
    }
    for (var i = 0; i < Object.keys(products).length; i++){
        products[i].mol = [products[i].mol[0]];
        products[i].conc = [products[i].conc[0]];
    }
}

function FindFirst(){ //finds first_react and first_prod
    first_react = 0; //first reactant that changes concentration
    first_prod = 0; //first product that changes concentration
    for (first_react = 0; first_react < Object.keys(reactants).length; first_react++){
        if(ChangesConc(reactants[first_react])) break;
    }
    if(first_react == Object.keys(reactants).length){
        for (first_prod = 0; first_prod < Object.keys(products).length; first_prod++){
            if(ChangesConc(products[first_prod])) break;
        }
    }
    show_concentrations = closed_container;
    if(first_react == Object.keys(reactants).length && first_prod == Object.keys(products).length) show_concentrations = 0;
}

function Simulate() {
    //console.log('Hello world');
    if(!IsReady()) return;
    InitConc();
    InitVars()
    FindFirst();
    myDebug();
    var it = 0;
    var PercentageOfChange = 1;
    var flag = false;
    var starting_limiting_mol_over_coeff = 0;
    while (PercentageOfChange >= precision){
        PercentageOfChange = 0;
        var U1 = calculateU1(it);
        var U2 = calculateU2(it);
        var min_rmol_over_coeff = INF;
        for (var i = 0; i < Object.keys(reactants).length; i++)
            min_rmol_over_coeff = Math.min(min_rmol_over_coeff, reactants[i].mol[it]/reactants[i].coeff);
        var min_pmol_over_coeff = INF
        for (var i = 0; i < Object.keys(products).length; i++)
            min_pmol_over_coeff = Math.min(min_pmol_over_coeff, products[i].mol[it]/products[i].coeff);
        if (it == 0){
            if (U1-U2 > 0)
                starting_limiting_mol_over_coeff = min_rmol_over_coeff
            else
                starting_limiting_mol_over_coeff = min_pmol_over_coeff
        }
        calculatedt(U1, U2, starting_limiting_mol_over_coeff)
        var dn_over_coeff = dt*(U1-U2) * V;
        var dc_over_coeff = dt*(U1-U2);
        if (dn_over_coeff > 0)
            dn_over_coeff = Math.min(dn_over_coeff, min_rmol_over_coeff);
        else
            dn_over_coeff = -Math.min(-dn_over_coeff, min_pmol_over_coeff);
        dc_over_coeff = dn_over_coeff/V;
        for (var i = 0; i < Object.keys(reactants).length; i++){
            var dn = -reactants[i].coeff*dn_over_coeff;
            reactants[i].mol[it+1] = reactants[i].mol[it] + dn;
            if (ChangesConc(reactants[i])){
                var dc = -reactants[i].coeff*dc_over_coeff;
                reactants[i].conc[it+1] = reactants[i].conc[it] + dc;
            }
            else
                reactants[i].conc[it+1] = 1;
            if (reactants[i].mol[it+1] <= 0){
                reactants[i].mol[it+1] = 0;
                reactants[i].conc[it+1] = 0;
            }
            if (reactants[i].mol[it+1] == 0 && dn != 0 && it > 0){
                //dt = starting_limiting_mol_over_coeff/steps
                dt = dn_over_coeff/(U1-U2)/V;
                end_it = it+2;
            }
            if (reactants[i].mol[it] == 0 && dn != 0)
                PercentageOfChange = INF;
            else if (dn == 0)
                PercentageOfChange = 0;
            else
                PercentageOfChange = Math.max(PercentageOfChange, Math.abs(dn)/reactants[i].mol[it]);
        }
        for (var i = 0; i < Object.keys(products).length; i++){
            var dn = products[i].coeff*dn_over_coeff;
            products[i].mol[it+1] = products[i].mol[it] + dn;
            if (ChangesConc(products[i])){
                var dc = products[i].coeff*dc_over_coeff;
                products[i].conc[it+1] = products[i].conc[it] + dc;
            }
            else
                products[i].conc[it+1] = 1;
            if (products[i].mol[it+1] <= 0){
                products[i].mol[it+1] = 0;
                products[i].conc[it+1] = 0;
            }
            if (products[i].mol[it+1] == 0 && dn != 0 && it > 0){
                //dt = starting_limiting_mol_over_coeff/steps
                dt = dn_over_coeff/(U1-U2)/V;
                end_it = it+2;
            }
            if (products[i].mol[it] == 0 && dn != 0)
                PercentageOfChange = INF;
            else if (dn == 0)
                PercentageOfChange = 0;
            else
                PercentageOfChange = Math.max(PercentageOfChange, Math.abs(dn)/products[i].mol[it]);
        }
        time[it+1] = time[it] + dt;
        _dt[it+1] = dt;
        _U1[it+1] = _U1[it];
        _U2[it+1] = _U2[it];
        _U[it+1] = U1-U2;
        it += 1;
        if (it >= end_it-1){
            console.log("Stopped simulation.");
            break;
        }
    }
    it += 1;
    end_it = it;
    FindFirst();
    FinalizeSimulation();
    PlotCharts();
}

function myDebug(it = 0){
    console.log('reactants length', Object.keys(reactants).length);
    for (var i = 0; i < Object.keys(reactants).length; i++)
        console.log(reactants[i].name + ": initial mol = " + reactants[i].mol[it].toString());
    console.log('products length', Object.keys(products).length);
    for (var i = 0; i < Object.keys(products).length; i++)
        console.log(products[i].name + ": initial mol = " + products[i].mol[it].toString());
    console.log('K1 =', K1);
    console.log("K2 =", K2);
    console.log("Kc =", Kc);
    console.log("V = ", V);
}

function FinalizeSimulation(){
    var text = "";
    console.log("The simulation ended after", end_it, " iterations");
    text += "The simulation ended after " + end_it.toString() + " iterations.\n";
    text += "The actual reaction would take " + time[end_it-1].toString() + " seconds.\n\n";
    /*for(var it = 0; it < end_it; it++){
        text += "Iteration " + (it+1).toString() + ": Moles";
        for (var i = 0; i < Object.keys(reactants).length; i++){
            text += " | " + reactants[i].name + ": " + reactants[i].mol[it].toString();
        }
        for (var i = 0; i < Object.keys(products).length; i++){
            text += " | " + products[i].name + ": " + products[i].mol[it].toString();
        }
        text += ". Concentrations"
        for (var i = 0; i < Object.keys(reactants).length; i++){
            text += " | " + reactants[i].name + ": " + reactants[i].conc[it].toString();
        }
        for (var i = 0; i < Object.keys(products).length; i++){
            text += " | " + products[i].name + ": " + products[i].conc[it].toString();
        }
        var Qc = (calculateU2(it)/K2)/(calculateU1(it)/K1)
        text += " | Qc = " + Qc.toString();
        text += "\n";
    }*/
    text += "Final Results\n Moles";
    for (var i = 0; i < Object.keys(reactants).length; i++){
        text += " | " + reactants[i].name + ": " + reactants[i].mol[end_it-1].toString();
    }
    for (var i = 0; i < Object.keys(products).length; i++){
        text += " | " + products[i].name + ": " + products[i].mol[end_it-1].toString();
    }
    if(show_concentrations){
        console.log("Showing Concentrations");
        text += ".\nConcentrations";
        for (var i = 0; i < Object.keys(reactants).length; i++){
            if(!ChangesConc(reactants[i])) continue;
            text += " | " + reactants[i].name + ": " + reactants[i].conc[end_it-1].toString();
        }
        for (var i = 0; i < Object.keys(products).length; i++){
            if(!ChangesConc(products[i])) continue;
            text += " | " + products[i].name + ": " + products[i].conc[end_it-1].toString();
        }
    }
    text += ".\n";
    document.getElementById("simulation").innerText = text;
}