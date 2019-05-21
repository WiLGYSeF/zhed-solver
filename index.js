var e_height = document.getElementById("height");
var e_width = document.getElementById("width");
var e_stop = document.getElementById("stop");
var e_solving = document.getElementById("solving");
var e_statecount = document.getElementById("statecount");
var e_tableinput = document.getElementById("tableinput");
var e_solutions = document.getElementById("solutions");
var e_urlshort = document.getElementById("urlshort");

function colorCell(cell)
{
	if(cell.value > 0)
	{
		cell.style.backgroundColor = "#0000ff44";
	}else
	if(cell.value == State.GOAL)
	{
		cell.style.backgroundColor = "#00ff0044";
	}else
	if(cell.value == State.INACTIVE)
	{
		cell.style.backgroundColor = "#ff000044";
	}else
	{
		cell.style.backgroundColor = "";
	}
}

function onCellChange(e)
{
	colorCell(e.target);
	e_urlshort.innerHTML = "";
}

function buildEmptyTable(height, width)
{
	while(e_tableinput.children.length > 0)
		e_tableinput.removeChild(e_tableinput.children[0]);

	var maxlen = Math.max(height, width);
	for (var y = 0; y < height; y++)
	{
		var row = document.createElement("tr");
		for (var x = 0; x < width; x++)
		{
			var data = document.createElement("td");
			data.innerHTML = '<input id="i' + x + '_' + y + '" class="cellinput" type="number" value="0" min="-2" max="' + maxlen + '" title="' + x + ', ' + y + '">';
			row.appendChild(data);
		}
		e_tableinput.appendChild(row);
	}

	var e;
	for (var y = 0; y < height; y++)
	{
		for (var x = 0; x < width; x++)
		{
			e = document.getElementById("i" + x + "_" + y);
			e.addEventListener("change", onCellChange);
		}
	}
}

function fillEmptyTable(height, width)
{
	for (var y = 0; y < height; y++)
	{
		var row = e_tableinput.children[y];
		for (var x = 0; x < width; x++)
		{
			var data = row.children[x].children[0];
			data.value = "0";
			colorCell(data);
		}
	}
}

function fillTableFromArray(arr1d, height, width)
{
	var idx = 0;

	for (var y = 0; y < height; y++)
	{
		var row = e_tableinput.children[y];
		for (var x = 0; x < width; x++)
		{
			var data = row.children[x].children[0];
			if(idx != arr1d.length)
			{
				data.value = arr1d[idx++];
			}else
			{
				data.value = "0";
			}

			colorCell(data);
		}
	}
}

function getArrayFromTable()
{
	var height = e_tableinput.children.length;
	var width = e_tableinput.children[0].children.length;
	var arr = [];

	for (var y = 0; y < height; y++)
	{
		var row = e_tableinput.children[y];
		var rowarr = [];

		for (var x = 0; x < width; x++)
		{
			rowarr.push(parseInt(row.children[x].children[0].value, 10));
		}
		arr.push(rowarr);
	}

	return arr;
}

function buildStateTable(universe, state, endList)
{
	var table = document.createElement("table");
	table.classList.add("statetable");

	var array = universe.copyArray();
	for (var i = state.cellList.length - 1; i >= endList; i--)
		state.expandCell(array, state.cellList[i]);

	var height = state.getHeight();
	var width = state.getWidth();

	var active;
	var actividx = 0;
	var val;

	for (var y = 0; y < height; y++)
	{
		var row = document.createElement("tr");

		for (var x = 0; x < width; x++)
		{
			val = state.getArrayVal(array, x, y);

			var data = document.createElement("td");
			data.title = x + ', ' + y;

			if(actividx < universe.active.length)
			{
				active = universe.active[actividx];
			}else
			{
				active = null;
			}

			var cell;
			var expanded = false;

			for (var i = state.cellList.length - 1; i >= endList; i--)
			{
				cell = state.cellList[i];
				if(cell.compareCoord([x, y]))
				{
					expanded = true;
					break;
				}
			}

			if(!expanded && active != null && x == active[0] && y == active[1])
			{
				//active live cell
				data.innerHTML = val;
				data.style.backgroundColor = "#0000ff88";
				data.style.fontWeight = "bold";
			}else
			if(val > 0)
			{
				//filled cell
				data.innerHTML = "*";
				data.style.backgroundColor = "#00ffff";

				if(x == state.cellList[endList].coord[0] && y == state.cellList[endList].coord[1])
				{
					data.style.backgroundColor = "#00d0d0";
					data.style.fontWeight = "bold";
				}
			}else
			{
				data.innerHTML = val;
			}

			if(active != null && x == active[0] && y == active[1])
				actividx++;

			var goal;

			for (var i = 0; i < universe.goals.length; i++)
			{
				goal = universe.goals[i];
				if(x == goal[0] && y == goal[1])
				{
					//goal
					data.style.backgroundColor = val != State.GOAL ? "#ffff00" : "#00ff00";
				}
			}

			row.appendChild(data);
		}

		table.appendChild(row);
	}

	e_solutions.appendChild(table);
}

function buildSolutions(solvedstate)
{
	deleteSolutions();

	if(solvedstate == null)
	{
		e_solutions.innerHTML = "<p>No solutions found!</p>";
		return;
	}

	for (var i = solvedstate.cellList.length - 1; i >= 0; i--)
	{
		var p = document.createElement("p");
		p.innerHTML = "Step " + (solvedstate.cellList.length - i) + ":";

		e_solutions.appendChild(p);

		buildStateTable(solvedstate.universe, solvedstate, i);
	}
}

function deleteSolutions()
{
	while(e_solutions.children.length > 0)
		e_solutions.removeChild(e_solutions.children[0]);
}

function resetStateInfo()
{
	e_stop.style.display = "none";
	e_solving.innerHTML = "";
	e_statecount.innerHTML = "";

	e_urlshort.innerHTML = "";
}

function updateStateCount(stopped=false)
{
	if(window._universe == null)
		return;

	var s = "(" + window._universe.statistics.actionsDone + " actions done";

	if(stopped)
		s += ", stopped";

	s += ")";
	e_statecount.innerHTML = s;
}

function solve()
{
	deleteSolutions();

	if(window._universe != null)
	{
		if(window._universe.isRunning())
			return;

		window._universe = null;
	}

	try
	{
		window._universe = new Universe(getArrayFromTable(), window._options);
	}catch(err)
	{
		console.error(err);
		alert(err);
	}

	if(window._universe != null)
	{
		window._universe.solveState().then(x => {
			window._solvedstate = x;
			e_stop.style.display = "none";
			e_solving.innerHTML = "";

			clearInterval(window._updateTimer);
			updateStateCount();

			console.log(window._solvedstate);
			console.log(window._universe.statistics);

			buildSolutions(window._solvedstate);
		});

		e_solving.innerHTML = "Solving... ";
		e_stop.style.display = "";

		window._updateTimer = setInterval(updateStateCount, 40);
	}
}

function stopSolving()
{
	if(window._universe != null)
	{
		window._universe.stop();
	}

	clearInterval(window._updateTimer);
	updateStateCount(true);
}

// https://html-online.com/articles/get-url-parameters-javascript/
function getUrlVars()
{
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value){
        vars[key] = value;
    });
    return vars;
}

var urlvars = getUrlVars();

if(urlvars.height !== undefined)
	e_height.value = urlvars.height;
if(urlvars.width !== undefined)
	e_width.value = urlvars.width;

buildEmptyTable(e_height.value, e_width.value);

if(urlvars.state !== undefined)
{
	var idx = urlvars.state.indexOf(State.HASH_SECTION_SIZE);
	if(idx != -1)
	{
		var statestr = urlvars.state.substring(idx + State.HASH_SECTION_SIZE.length);
		idx = statestr.indexOf(State.HASH_SECTION_END);
		if(idx != -1)
		{
			var spl = statestr.substring(0, idx).split(",");
			e_height.value = spl[0];
			e_width.value = spl[1];

			buildEmptyTable(e_height.value, e_width.value);
		}
	}

	fillEmptyTable(e_height.value, e_width.value);
	fillTableFromArray(State.array1dFromStateStr(urlvars.state), e_height.value, e_width.value);
}

if(urlvars.solve !== undefined)
{
	solve();
}

document.getElementById("buildnew").addEventListener("click", function(){
	if(window._universe != null)
	{
		if(window._universe.isRunning())
			stopSolving();

		window._universe = null;
	}

	buildEmptyTable(e_height.value, e_width.value);
	deleteSolutions();
	resetStateInfo();
});

document.getElementById("solve").addEventListener("click", function(){
	solve();
});

e_stop.addEventListener("click", function(){
	stopSolving();
});

document.getElementById("geturl").addEventListener("click", function(){
	try
	{
		var universe = new Universe(getArrayFromTable(), 0);
		var statestr = universe.initialstate.getStateStr();
		var urlstatestr = "";

		var idx = statestr.indexOf(State.HASH_SECTION_SIZE);
		if(idx != -1)
		{
			var s = statestr.substring(idx);
			var sidx = s.indexOf(State.HASH_SECTION_END);
			if(sidx != -1)
				urlstatestr += s.substring(0, sidx + State.HASH_SECTION_END.length);
		}

		idx = statestr.indexOf(State.HASH_SECTION_GRID);
		if(idx != -1)
		{
			var s = statestr.substring(idx);
			var sidx = s.indexOf(State.HASH_SECTION_END);
			if(sidx != -1)
				urlstatestr += s.substring(0, sidx + State.HASH_SECTION_END.length);
		}

		e_urlshort.innerHTML = window.location.href.split('?')[0] + "?state=" + urlstatestr;
	}catch(err)
	{
		alert(err);
		console.error(err);
	}
});
