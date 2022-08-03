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

MAXN = 10;
MAXIT = 2*10**5;
INF = 10**9;

simple = 1;
irreversible = 1;
K1 = NaN;
K2 = NaN;
Kc = NaN;
closed_container = 1;
V = NaN;
homogeneous = 1;

reactants = [];
products = [];

function IsReady(){
    for (var i = 0; i < Object.keys(reactants).length; i++){
        if(Number.isNaN(reactants[i].mol[0]) || Number.isNaN(reactants[i].coeff) || reactants[i].name == "" || reactants[i].state == "" || Number.isNaN(reactants[i].RRC)){
            console.log("reactants not ready");
            return false;
        }
    }
    for (var i = 0; i < Object.keys(products).length; i++){
        if(Number.isNaN(products[i].mol[0]) || Number.isNaN(products[i].coeff) || products[i].name == "" || products[i].state == "" || Number.isNaN(products[i].RRC)){
            console.log("products not ready");
            return false;
        }
    }
    if(Number.isNaN(V)){
        console.log("volume not ready");
        return false;
    }
    if(Number.isNaN(K1) || Number.isNaN(K2) || Number.isNaN(Kc)){
        console.log("constants not ready");
        return false;
    }
    return true;
}

function InitConstsIrreversible(){
    let K1Label = document.createElement('label');
        K1Label.innerText = "Enter the reaction rate constant, K, of the reaction. (If unknown enter '1'): ";
        let K1Input = document.createElement('input');
        K1Input.type = 'number';
        K1Input.step = "any";
        K1Input.onchange = () => {
            K1 = parseFloat(K1Input.value)
            K2 = 0;
            Kc = INF;
            Simulate();
        };
        let element = document.createElement('div');
        element.appendChild(K1Label);
        element.appendChild(K1Input);
        element.appendChild(document.createElement('br'));
        document.getElementById('constants').appendChild(element);
}

function InitConstsReversible(){
    let KcLabel = document.createElement('label');
        KcLabel.innerText = "Enter the chemical equilibrium constant, Kc, of the reaction. (If unknown enter \"1\"): ";
        let KcInput = document.createElement('input');
        KcInput.type = 'number';
        KcInput.step = "any";
        let K1Label = document.createElement('label');
        K1Label.innerText = "Enter the reaction rate constant, K1, of the reaction left to right. (If unknown enter the same value as in Kc): ";
        let K1Input = document.createElement('input');
        K1Input.type = 'number';
        K1Input.step = "any";
        KcInput.onchange = () => {
            Kc = parseFloat(KcInput.value);
            K2 = K1/Kc;
            Simulate();
        };
        K1Input.onchange = () => {
            K1 = parseFloat(K1Input.value);
            K2 = K1/Kc;
            Simulate();
        };
        let element = document.createElement('div');
        element.appendChild(KcLabel);
        element.appendChild(KcInput);
        element.appendChild(document.createElement('br'));
        element.appendChild(K1Label);
        element.appendChild(K1Input);
        element.appendChild(document.createElement('br'));
        document.getElementById('constants').appendChild(element);
}

function InitReactConst(){
    document.getElementById('constants').removeChild(document.getElementById('constants').lastChild);
    if(irreversible == 1) InitConstsIrreversible();
    else InitConstsReversible();
}

function InitIrreversible(option){
    irreversible = option;
    K1 = NaN;
    K2 = NaN;
    Kc = NaN;
    InitReactConst();
    Simulate();
}

function addRRC(id){
    element = document.getElementById(id);
    let RRCLabel = document.createElement('label');
    RRCLabel.innerText = 'Reaction Rate Coefficient: ';
    let RRC = document.createElement('input');
    RRC.type = 'number';
    RRC.step = "any";
    RRC.id = "RRC"+id;
    RRC.onchange = () => {
        InitSubstances();
        Simulate();
    };
    element.removeChild(element.lastChild);
    element.appendChild(RRCLabel);
    element.appendChild(RRC);
    element.appendChild(document.createElement('br'));
    //? do I also need to change the document?
    document.getElementById(id).replaceWith(element);
}

function InitSimple(checked){
    let wasSimpleBefore = simple;
    simple = checked;
    if(simple){
        if(!wasSimpleBefore){
            for (var i = 0; i < Object.keys(reactants).length; i++){
                var id = "r" + i.toString();
                el = document.getElementById(id);
                el.removeChild(el.lastChild);
                el.removeChild(el.lastChild);
                el.removeChild(el.lastChild);
                el.appendChild(document.createElement('br'));
            }
            for (var i = 0; i < Object.keys(products).length; i++){
                var id = "p" + i.toString();
                el = document.getElementById(id);
                el.removeChild(el.lastChild);
                el.removeChild(el.lastChild);
                el.removeChild(el.lastChild);
                el.appendChild(document.createElement('br'));
            }
            wasSimpleBefore = true;
        }
        InitSubstances();
        Simulate();
        return;
    }
    wasSimpleBefore = false;
    
    for (var i = 0; i < Object.keys(reactants).length; i++){
        var id = "r" + i.toString();
        addRRC(id);
    }
    for (var i = 0; i < Object.keys(products).length; i++){
        var id = "p" + i.toString();
        addRRC(id);
    }
    InitSubstances();
    Simulate();
}

function InitV(checked){
    let wasClosedBefore = closed_container;
    closed_container = checked;
    if(!closed_container){
        V = INF;
        if(wasClosedBefore){
            document.getElementById('volume').removeChild(document.getElementById('volume').lastChild);
            wasClosedBefore = false;
        }
        Simulate();
        return;
    }
    wasClosedBefore = true;
    let VLabel = document.createElement('label');
    VLabel.innerText = "Enter the volume of the container (in Litres): ";
    let VInput = document.createElement('input');
    VInput.type = 'number';
    VInput.step = "any";
    V = NaN;
    VInput.onchange = () => {
        V = parseFloat(VInput.value);
        Simulate();
    };
    let element = document.createElement('div');
    element.appendChild(VLabel);
    element.appendChild(VInput);
    element.appendChild(document.createElement('br'));
    document.getElementById('volume').appendChild(element);
    Simulate();
}

function ChangesConc(substance){
    if (substance.state == "(g)" || substance.state == "(aq)" || (substance.phase == "(l)" && homogeneous))
        return true
    else
        return false
}

function InitConc(){
    for (var i = 1; i < Object.keys(reactants).length; i++)
        if (reactants[i].state != reactants[i-1].state)
            homogeneous = false
    for (var i = 0; i < Object.keys(products).length; i++)
        if (products[i].state != reactants[0].state)
            homogeneous = false
    for (var i = 0; i < Object.keys(reactants).length; i++){
        if(ChangesConc(reactants[i])) reactants[i].conc[0] = reactants[i].mol[0]/V;
        else reactants[i].conc[0] = 1;
    }
    for (var i = 0; i < Object.keys(products).length; i++){
        if(ChangesConc(products[i])) products[i].conc[0] = products[i].mol[0]/V;
        else products[i].conc[0] = 1;
    }
}

var lastReactant = -1;
var lastProduct = -1;

function InitSubstances(){
    for (var i = 0; i <= lastReactant; i++){
        var id = i.toString();
        var coeff = document.getElementById("coeff"+"r"+id);
        var name = document.getElementById("name"+"r"+id);
        var state = document.getElementById("state"+"r"+id);
        var mol = document.getElementById("mol"+"r"+id);
        var RRC;
        if(!simple) RRC = document.getElementById("RRC"+"r"+id);
        reactants[i] = {
            coeff: parseFloat(coeff.value),
            name: name.value,
            state: state.value,
            mol: [parseFloat(mol.value)],
            conc: [0],
            RRC: (simple ? parseFloat(coeff.value) : parseFloat(RRC.value))
        };
    }
    for (var i = 0; i <= lastProduct; i++){
        var id = i.toString();
        var coeff = document.getElementById("coeff"+"p"+id);
        var name = document.getElementById("name"+"p"+id);
        var state = document.getElementById("state"+"p"+id);
        var mol = document.getElementById("mol"+"p"+id);
        var RRC;
        if(!simple) RRC = document.getElementById("RRC"+"p"+id);
        products[i] = {
            coeff: parseFloat(coeff.value),
            name: name.value,
            state: state.value,
            mol: [parseFloat(mol.value)],
            conc: [0],
            RRC: (simple ? parseFloat(coeff.value) : parseFloat(RRC.value))
        };
    }
    Simulate();
}

function AddElement(isReactant = true) {
    var id = "";
    if(isReactant){
        lastReactant++;
        id = "r"+lastReactant.toString();
    }
    else{
        lastProduct++;
        id = "p"+lastProduct.toString();
    }
    let coeff = document.createElement('input');
    coeff.type = 'number';
    coeff.step = "any";
    coeff.id = "coeff"+id;
    if(isReactant)
        coeff.placeholder = 'Reactant Coefficient';
    else
        coeff.placeholder = 'Product Coefficient';
    let name = document.createElement('input');
    name.type = 'text';
    name.id = "name"+id;
    if(isReactant)
        name.placeholder = 'Reactant Name';
    else
        name.placeholder = 'Product Name';
    let state = document.createElement('select');
    state.innerHTML = '<option value="(g)">Gas</option><option value="(l)">Liquid</option><option value="(s)">Solid</option><option value="(aq)">Aqua</option>';
    state.id = "state"+id;
    let molLabel = document.createElement('label');
    molLabel.innerText = ' moles: ';
    let mol = document.createElement('input');
    mol.type = 'number';
    mol.step = "any";
    mol.id = "mol"+id;

    let element = document.createElement('div');
    element.id = id;
    element.appendChild(coeff);
    element.appendChild(name);
    element.appendChild(state);
    element.appendChild(molLabel);
    element.appendChild(mol);
    element.appendChild(document.createElement('br'));
    document.getElementById((isReactant) ? 'reactants' : 'products').appendChild(element);

    if(!simple) addRRC(id);
    
    coeff.onchange = InitSubstances;
    name.onchange = InitSubstances;
    state.onchange = InitSubstances;
    mol.onchange = InitSubstances;

    InitSubstances();
}

function RemoveElement(isReactant = true) {
    if (isReactant) {
        let parent = document.getElementById('reactants');
        let n = parent.childElementCount;
        reactants.pop();
        lastReactant--;
        parent.removeChild(parent.lastChild);
        if(n == 1) AddElement(true);
        InitSubstances();
    }
    else {
        let parent = document.getElementById('products');
        let n = parent.childElementCount;
        products.pop();
        lastProduct--;
        parent.removeChild(parent.lastChild);
        if(n == 1) AddElement(false);
        InitSubstances();
    }
}