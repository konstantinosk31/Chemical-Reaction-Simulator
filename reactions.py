"""
    Copyright 2021 Konstantinos Kritharidis

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

    Contact details:
    Konstantinos Kritharidis (konstantinosk31) <konstantinosk31@gmail.com>
"""

"""
The user inserts a chemical reaction and the programme outputs n-t, C-t, U-t plots by simulating the reaction
"""

import matplotlib.pyplot as plt
import numpy as np

dt = 0.01
steps = 2*10**2
precision = 0.0000001
eps = 10**-9

MAXN = 10
MAXIT = 2*10**5
INF = 10**9

reactionstr = ""
irreversible = 1
K1 = 1
K2 = 1
Kc = 1
closed_container = 1
V = 1
homogeneous = 1
end_it = MAXIT

react = ["" for i in range(MAXN)]
rcoeff = [0 for i in range(MAXN)]
rconc = [[0 for j in range(MAXIT)] for i in range(MAXN)]
rmol = [[0 for j in range(MAXIT)] for i in range(MAXN)]
prod = ["" for i in range(MAXN)]
pcoeff = [0 for i in range(MAXN)]
pconc = [[0 for j in range(MAXIT)] for i in range(MAXN)]
pmol = [[0 for j in range(MAXIT)] for i in range(MAXN)]
time = [0 for i in range(MAXIT)]
rphase = ["" for i in range(MAXN)]
pphase = ["" for i in range(MAXN)]
_dt = [0 for i in range(MAXIT)]
_U1 = [0 for i in range(MAXIT)]
_U2 = [0 for i in range(MAXIT)]

def changes_conc(is_product, i): #0 if it is a reactant, 1 if it is a product
    if not is_product:
        if (rphase[i] == "(g)" or rphase[i] == "(aq)" or (rphase[i] == "(l)" and homogeneous)):
            return True
        else:
            return False
    else:
        if (pphase[i] == "(g)" or pphase[i] == "(aq)" or (pphase[i] == "(l)" and homogeneous)):
            return True
        else:
            return False

def _process_reaction(reaction):
    reactants = 1
    i = 0
    global react, rcoeff, prod, pcoeff, rconc, rmol, pconc, pmol, rphase, pphase, irreversible
    for temp in range(len(reaction)):
        s = reaction[temp]
        if reactants == 1:
            if temp % 4 == 2:
                rphase[i] = s
            if temp % 4 == 3:
                if s == "->":
                    reactants = 0
                    react = react[:(i+1)]
                    rcoeff = rcoeff[:(i+1)]
                    rconc = rconc[:(i+1)]
                    rphase = rphase[:(i+1)]
                    rmol = rmol[:(i+1)]
                    i = 0
                elif s == "<->":
                    reactants = 0
                    irreversible = 0
                    react = react[:(i+1)]
                    rcoeff = rcoeff[:(i+1)]
                    rconc = rconc[:(i+1)]
                    rphase = rphase[:(i+1)]
                    rmol = rmol[:(i+1)]
                    i = 0
                elif s == "+":
                    i += 1
                else:
                    assert(False)
            elif temp % 4 == 0:
                rcoeff[i] = int(s)
            elif temp % 4 == 1:
                react[i] = s
        elif reactants == 0:
            if temp % 4 == 2:
                pphase[i] = s
            if temp % 4 == 3:
                if s == "+":
                    i += 1
                else:
                    assert(False)
            elif temp % 4 == 0:
                pcoeff[i] = int(s)
            elif temp % 4 == 1:
                prod[i] = s
    prod = prod[:(i+1)]
    pcoeff = pcoeff[:(i+1)]
    pconc = pconc[:(i+1)]
    pphase = pphase[:(i+1)]
    pmol = pmol[:(i+1)]
    for i in range(1, len(react)):
        if rphase[i] != rphase[i-1]:
            homogeneous = False
    for i in range(len(prod)):
        if pphase[i] != rphase[0]:
            homogeneous = False

def _input():
    print("Enter a chemical reaction in the form: a A (g) + b B (l) -> c C (s) + d D (aq), if it's irreversible.")
    print("For reversible reactions use '<->'.")
    print("If a substance doesn't have a coefficient enter 1 as its coefficient")
    print("(For now we assume that all reactions are simple)")
    global reactionstr, closed_container
    reactionstr = input()
    reaction = reactionstr.split()
    #print(reaction)
    _process_reaction(reaction)
    global K1, K2, Kc, V
    if irreversible == 1:
        K1 = float(input("Enter the reaction rate constant, K, of the reaction. (If unknown enter '1'): "))
        K2 = 0
        Kc = INF
    else:
        Kc = float(input("Enter the chemical equilibrium constant, Kc, of the reaction. (If unknown enter '1'): "))
        K1 = float(input("Enter the reaction rate constant, K1, of the reaction left to right. (If unknown enter the same value as in Kc): "))
        K2 = K1/Kc
    closed_container = int(input("Is the container closed or not? For closed enter '1'; for open enter '0': "))
    if closed_container == 1:
        V = float(input("Enter the volume of the container (in Litres): "))
    else:
        V = INF
    for i in range(len(react)):
        rmol[i][0] = float(input("Enter the amount of substance (in moles) of " + react[i] + ": "))
        if changes_conc(0, i):
            rconc[i][0] = rmol[i][0]/V
        else:
            rconc[i][0] = 1
    for i in range(len(prod)):
        pmol[i][0] = float(input("Enter the amount of substance (in moles) of " + prod[i] + ": "))
        if changes_conc(1, i):
            pconc[i][0] = pmol[i][0]/V
        else:
            pconc[i][0] = 1

def calculateU1(it):
    global _U1
    val = K1
    for i in range(len(react)):
        val *= (rconc[i][it]**rcoeff[i])
    _U1[it] = val
    return val

def calculateU2(it):
    global _U2
    val = K2
    for i in range(len(prod)):
        val *= (pconc[i][it]**pcoeff[i])
    _U2[it] = val
    return val

def calculatedt(U1, U2, starting_limiting_mol_over_coeff):
    mean_U = (abs(U1)+abs(U2))/2
    global dt
    if mean_U > eps:
        dt = starting_limiting_mol_over_coeff/steps/mean_U/V
    return

def _simulate():
    global time, end_it
    it = 0
    PercentageOfChange = 1
    flag = False
    global dt, _dt, _U1, _U2
    starting_limiting_mol_over_coeff = 0
    while PercentageOfChange >= precision:
        PercentageOfChange = 0
        U1 = calculateU1(it)
        U2 = calculateU2(it)
        min_rmol_over_coeff = INF
        for i in range(len(react)):
            min_rmol_over_coeff = min(min_rmol_over_coeff, rmol[i][it]/rcoeff[i])
        min_pmol_over_coeff = INF
        for i in range(len(prod)):
            min_pmol_over_coeff = min(min_pmol_over_coeff, pmol[i][it]/pcoeff[i])
        if it == 0:
            if U1-U2 > 0:
                starting_limiting_mol_over_coeff = min_rmol_over_coeff
            else:
                starting_limiting_mol_over_coeff = min_pmol_over_coeff
        calculatedt(U1, U2, starting_limiting_mol_over_coeff)
        dn_over_coeff = dt*(U1-U2) * V
        dc_over_coeff = dt*(U1-U2)
        if dn_over_coeff > 0:
            dn_over_coeff = min(dn_over_coeff, min_rmol_over_coeff)
        else:
            dn_over_coeff = -min(-dn_over_coeff, min_pmol_over_coeff)
        dc_over_coeff = dn_over_coeff/V
        for i in range(len(react)):
            dn = -rcoeff[i]*dn_over_coeff
            rmol[i][it+1] = rmol[i][it] + dn
            if changes_conc(0, i):
                dc = -rcoeff[i]*dc_over_coeff
                rconc[i][it+1] = rconc[i][it] + dc
            else:
                rconc[i][it+1] = 1
            if rmol[i][it+1] <= 0:
                rmol[i][it+1] = 0
                rconc[i][it+1] = 0
            if rmol[i][it+1] == 0 and dn != 0 and it > 0:
                #dt = starting_limiting_mol_over_coeff/steps
                dt = dn_over_coeff/(U1-U2)/V
                end_it = it+2
            if rmol[i][it] == 0 and dn != 0:
                PercentageOfChange = INF
            elif dn == 0:
                PercentageOfChange = 0
            else:
                PercentageOfChange = max(PercentageOfChange, abs(dn)/rmol[i][it])
        for i in range(len(prod)):
            dn = pcoeff[i]*dn_over_coeff
            pmol[i][it+1] = pmol[i][it] + dn
            if changes_conc(1, i):
                dc = pcoeff[i]*dc_over_coeff
                pconc[i][it+1] = pconc[i][it] + dc
            else:
                pconc[i][it+1] = 1
            if pmol[i][it+1] <= 0:
                pmol[i][it+1] = 0
                pconc[i][it+1] = 0
            if pmol[i][it+1] == 0 and dn != 0 and it > 0:
                #dt = starting_limiting_mol_over_coeff/steps
                dt = dn_over_coeff/(U1-U2)/V
                end_it = it+2
            if pmol[i][it] == 0 and dn != 0:
                PercentageOfChange = INF
            elif dn == 0:
                PercentageOfChange = 0
            else:
                PercentageOfChange = max(PercentageOfChange, abs(dn)/pmol[i][it])
        time[it+1] = time[it] + dt
        _dt[it+1] = dt
        _U1[it+1] = _U1[it]
        _U2[it+1] = _U2[it]
        it += 1
        if it >= end_it-1:
            print("Stopped simulation.")
            break
    it += 1
    end_it = it
    time = time[:it]
    _dt = _dt[:it]
    _U1 = _U1[:it]
    _U2 = _U2[:it]
    for i in range(len(react)):
        rmol[i] = rmol[i][:it]
        rconc[i] = rconc[i][:it]
    for i in range(len(prod)):
        pmol[i] = pmol[i][:it]
        pconc[i] = pconc[i][:it]

def plot_moles():
    for i in range(len(react)):
        plt.plot(time, rmol[i], label=react[i])
        plt.legend()
    for i in range(len(prod)):
        plt.plot(time, pmol[i], label=prod[i])
        plt.legend()
    plt.xlabel('Time - t (s)')
    plt.ylabel('Amount of substance - n (mol)')
    if closed_container == 1:
        plt.title('Amount of each substance in a container of volume ' + str(V) + 'L during the chemical reaction.\n' + reactionstr)
    else:
        plt.title('Amount of each substance in an open container during the chemical reaction.\n' + reactionstr)  
    plt.show()

def plot_dt():
    plt.plot(np.arange(0, end_it, 1), _dt, label="dt")
    plt.legend()
    plt.plot(np.arange(0, end_it, 1), time, label="time")
    plt.legend()
    plt.xlabel('Iterations - it')
    plt.ylabel('Time and dt (s)')
    plt.title('Time and dt during the chemical reaction.\n' + reactionstr)  
    plt.show()

def plot_conc():
    for i in range(len(react)):
        if changes_conc(0, i):
            plt.plot(time, rconc[i], label=react[i])
            plt.legend() 
    for i in range(len(prod)):
        if changes_conc(1, i):
            plt.plot(time, pconc[i], label=prod[i])
            plt.legend()
    plt.xlabel('Time - t (s)')
    plt.ylabel('Concentration - C (M)')
    if closed_container == 1:
        plt.title('Concentration of each substance in a container of volume ' + str(V) + 'L during the chemical reaction.\n' + reactionstr)
    else:
        plt.title('Concentration of each substance in an open container during the chemical reaction.\n' + reactionstr)
    plt.show()

def plot_U():
    plt.plot(time, _U1, label="U1")
    plt.legend()
    plt.plot(time, _U2, label="U2")
    plt.legend()
    plt.xlabel('Time - t (s)')
    plt.ylabel('Reaction Rate (M/s)')
    plt.title('Reaction rate of both sides during the chemical reaction.\n' + reactionstr)  
    plt.show()

_input()
_simulate()
for i in range(len(react)):
    print("The amount of substance of", react[i]," is", rmol[i][end_it-1])
for i in range(len(prod)):
    print("The amount of substance of", prod[i], " is ", pmol[i][end_it-1])
plot_moles()

#plot_dt()

if closed_container == 1:
    for i in range(len(react)):
        if changes_conc(0, i):
            print("The concentration of", react[i]," is", rconc[i][end_it-1])
    for i in range(len(prod)):
        if changes_conc(1, i):
            print("The concentration of", prod[i], " is ", pconc[i][end_it-1])
    plot_conc()

plot_U()
