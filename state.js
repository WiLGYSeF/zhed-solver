"use strict";

class State
{
	constructor(universe, parent, cellList)
	{
		this.universe = universe;
		this.parent = parent;

		//shallow copy
		this.cellList = cellList.slice(0);

		//lower number -> higher priority
		this.priority = 0;
	}

	getActions()
	{
		var actions = [];

		if(this.cellList.length == 0)
		{
			for (var i = 0; i < this.universe.goalfront.length; i++)
			{
				var gf = this.universe.goalfront[i];
				var num = 0;
/*
				var stack = [gf];

				while(stack.length > 0)
				{
					var c = stack.pop();
					var interacting = this.getInteracting(c);

					for (var j = 0; j < interacting.length; j++)
					{
						if(this.getOpenDist(this.universe.array, interacting[j]) > 0)
							continue;

						stack.push(interacting[j]);
						this.cellList.push(interacting[j]);
						num++;
					}
				}

				this.cellList = [];
				console.log(gf);
				console.log(num);

				//scale num between 0 - 7
				var bounds = [0, this.universe.active.length];
				var newbounds = [0, 7];
				num = ((num - bounds[0]) / (bounds[1] - bounds[0]) * (newbounds[1] - newbounds[0]) + newbounds[0]);
				num = -(num | 0);

				console.log(num);
*/
				actions.push({
					"pri": num,
					"cell": gf
				});
			}

			return actions;
		}

		var interacting;
		var cells = [];
		var cellpri = [];
		var cell, inter;
		var exists;

		var array = this.universe.copyArray();
		var opencells;

		var priority;

		for (var i = this.cellList.length - 1; i >= 0; i--)
		{
			cell = this.cellList[i];

			//open cells between cell and parent
			opencells = this.getOpenCellCount(array, cell) + 1 - this.getArrayVal(array, cell.coord[0], cell.coord[1]);

			interacting = this.getInteracting(cell);

			for (var j = 0; j < interacting.length; j++)
			{
				inter = interacting[j];
				priority = (opencells <= 0 ? 100 : 0);

				//priority += this.cellList.length - i - 1;

				//don't add cells already going to be added
				//note these cells have different parents than the ones already added
				exists = false;
				for (var k = 0; k < cells.length; k++)
				{
					if(cells[k].compareCell(inter))
					{
						exists = true;
						break;
					}
				}
				if(exists)
					continue;

				//ignore if cell would expand into already non-zero cell
				var ec = this.getExpandCoord(array, cell, inter);
				if(ec != null && this.getArrayVal(array, ec[0], ec[1]) > 0)
					continue;

				//ignore cells that could never reach
				if(this.getOpenDist(array, inter) > 0)
					continue;

				//closer cells have higher priority
				priority += State.getDistance(cell.coord[0], cell.coord[1], inter.coord[0], inter.coord[1]);

				cells.push(inter);
				cellpri.push(priority);
			}

			//expand cells as we go
			this.expandCell(array, cell);
		}

		var pri;

		for (var i = 0; i < cells.length; i++)
		{
			pri = cellpri[i] + this.getOpenCellsCount(array) - this.cellList.length;

			actions.push({
				"pri": pri,
				"cell": cells[i]
			});
		}

		return actions;
	}

	doAction(action)
	{
		this.cellList.push(action.cell);

		this.setPriority(action.pri);
	}

	//get unexpanded interacting cells
	getInteracting(cell)
	{
		var interacting = [];

		var cx = cell.coord[0];
		var cy = cell.coord[1];
		var px = cell.parent != null ? cell.parent.coord[0] : cell.goal[0];
		var py = cell.parent != null ? cell.parent.coord[1] : cell.goal[1];

		var active;
		var ax, ay;
		var adir;

		var inlist;

		for (var i = 0; i < this.universe.active.length; i++)
		{
			active = this.universe.active[i];
			ax = active[0];
			ay = active[1];
			adir = -1;

			if(cell.compareCoord(active))
				continue;

			inlist = false;
			for (var j = 0; j < this.cellList.length; j++)
			{
				if(this.cellList[j].compareCoord(active))
				{
					inlist = true;
					break;
				}
			}
			if(inlist)
				continue;

			//gets cells between the cell and its parent

			switch(cell.direction)
			{
				case 0:
					if(cy > ay && ay > py)
					{
						if(cx < ax){
							adir = 3;
						}else
						if(cx > ax){
							adir = 1;
						}else{
							adir = cell.direction;
						}
					}
					break;
				case 1:
					if(cx < ax && ax < px)
					{
						if(cy < ay){
							adir = 0;
						}else
						if(cy > ay){
							adir = 2;
						}else{
							adir = cell.direction;
						}
					}
					break;
				case 2:
					if(cy < ay && ay < py)
					{
						if(cx < ax){
							adir = 3;
						}else
						if(cx > ax){
							adir = 1;
						}else{
							adir = cell.direction;
						}
					}
					break;
				case 3:
					if(cx > ax && ax > px)
					{
						if(cy < ay){
							adir = 0;
						}else
						if(cy > ay){
							adir = 2;
						}else{
							adir = cell.direction;
						}
					}
					break;
			}

			if(adir != -1)
				interacting.push(new Cell(active, cell, adir));
		}

		return interacting;
	}

	expandCell(array, cell)
	{
		var x = cell.coord[0];
		var y = cell.coord[1];
		var val = this.getArrayVal(array, x, y);

		var breakout = false;

		var height = this.getHeight();
		var width = this.getWidth();

		for (var a = 0; a < val; a++)
		{
			switch(cell.direction)
			{
				case 0:
					y--;
					if(y < 0)
						breakout = true;
					break;
				case 1:
					x++;
					if(x >= width)
						breakout = true;
					break;
				case 2:
					y++;
					if(y >= height)
						breakout = true;
					break;
				case 3:
					x--;
					if(x < 0)
						breakout = true;
					break;
			}

			if(breakout)
				break;

			if(this.getArrayVal(array, x, y) > 0)
			{
				a--;
			}else
			{
				this.setArrayVal(array, x, y, 1);
			}
		}
	}

	expandCells(array)
	{
		for (var i = this.cellList.length - 1; i >= 0; i--)
			this.expandCell(array, this.cellList[i]);
	}

	//get the open, unfillable distance between the cell and its parent
	getOpenDist(array, cell, depth=8)
	{
		if(depth < 0)
			return -1;

		if(cell.parent == null)
			return 0;

		var x = cell.coord[0];
		var y = cell.coord[1];
		var px = cell.parent.coord[0];
		var py = cell.parent.coord[1];

		var opendist = this.getOpenCellCount(array, cell) + 1 - this.getArrayVal(array, x, y);

		if(opendist <= 0)
			return opendist;

		var interacting = this.getInteracting(cell);
		opendist -= interacting.length;

		var vset = new Set();
		var vhash;
		var inter;

		for (var i = 0; i < interacting.length; i++)
		{
			inter = interacting[i];

			//if the interacting can't reach, it doesn't count
			if((cell.direction & 1) != (inter.direction & 1) && this.getOpenDist(array, inter, depth - 1) > 0)
			{
				opendist++;
				continue;
			}

			vhash = inter.coord[(cell.direction & 1) == 1 ? 0 : 1] + "_" + inter.direction;

			if(cell.direction == inter.direction)
			{
				//subtract value if its on the same line
				if(inter.coord[0] == x || inter.coord[1] == y)
					opendist -= this.getArrayVal(array, inter.coord[0], inter.coord[1]);
			}else
			{
				//if there's a cell that would expand to the same position, don't count it
				if(vset.has(vhash))
					opendist++;
			}

			vset.add(vhash);
		}

		return opendist;
	}

	//open cells between cell and parent, does not check the cell on the parent line
	getOpenCellCount(array, cell)
	{
		var width = this.getWidth();
		var height = this.getHeight();

		var x = cell.coord[0];
		var y = cell.coord[1];
		var px = cell.parent != null ? cell.parent.coord[0] : cell.goal[0];
		var py = cell.parent != null ? cell.parent.coord[1] : cell.goal[1];

		var opencells = 0;
		var breakout = false;

		while(true)
		{
			switch(cell.direction)
			{
				case 0:
					y--;
					if(y < 0 || y <= py)
						breakout = true;
					break;
				case 1:
					x++;
					if(x >= width || x >= px)
						breakout = true;
					break;
				case 2:
					y++;
					if(y >= height || y >= py)
						breakout = true;
					break;
				case 3:
					x--;
					if(x < 0 || x <= px)
						breakout = true;
					break;
			}

			if(breakout)
				break;

			if(this.getArrayVal(array, x, y) == 0)
				opencells++;
		}

		return opencells;
	}

	getOpenCellsCount(array)
	{
		var opencells = 0;

		for (var i = 0; i < this.cellList.length; i++)
			opencells += this.getOpenCellCount(array, this.cellList[i]);

		return opencells;
	}

	//gets the coordinate where excell expands to for cell
	getExpandCoord(array, cell, excell)
	{
		var x = excell.coord[0];
		var y = excell.coord[1];

		if(cell.direction == excell.direction)
		{
			//there's more than one coordinate, so just return null
			switch(cell.direction)
			{
				case 0:
				case 2:
					if(cell.coord[0] == x)
						return null;
					break;
				case 1:
				case 3:
					if(cell.coord[1] == y)
						return null;
					break;
			}
		}

		var val = this.getArrayVal(array, x, y);

		var height = this.getHeight();
		var width = this.getWidth();

		var breakout = false;

		for (var a = 0; a < val; a++)
		{
			switch(excell.direction)
			{
				case 0:
					y--;
					if(y < 0)
						breakout = true;
					break;
				case 1:
					x++;
					if(x >= width)
						breakout = true;
					break;
				case 2:
					y++;
					if(y >= height)
						breakout = true;
					break;
				case 3:
					x--;
					if(x < 0)
						breakout = true;
					break;
			}

			if(breakout)
				break;

			if(x == cell.coord[0] || y == cell.coord[1])
				return [x, y];

			if(this.getArrayVal(array, x, y) > 0)
				a--;
		}

		return null;
	}

	isSolved()
	{
		var array = this.universe.copyArray();
		this.expandCells(array);

		var goal;

		for (var i = 0; i < this.universe.goals.length; i++)
		{
			goal = this.universe.goals[i];
			if(this.getArrayVal(array, goal[0], goal[1]) != State.GOAL)
				return true;
		}

		return false;
	}

	setArrayVal(array, x, y, v)
	{
		array[y * this.getWidth() + x] = v;
	}

	getArrayVal(array, x, y)
	{
		return array[y * this.getWidth() + x];
	}

	static getDistance(x1, y1, x2, y2)
	{
		//manhattan distance
		return Math.abs(x2 - x1) + Math.abs(y2 - y1);
	}

	getHeight()
	{
		return this.universe.height;
	}

	getWidth()
	{
		return this.universe.width;
	}

	getPriority()
	{
		return this.priority;
	}

	setPriority(pri)
	{
		this.priority = pri;
	}

	copy()
	{
		var s = new State(this.universe, this.parent, this.cellList);

		s.priority = this.priority;

		return s;
	}

	static numlen(x)
	{
		if(x == 0)
			return 1;

		var neg = 0;
		if(x < 0)
		{
			neg = 1;
			x = -x;
		}

		return neg + Math.ceil(Math.log10(x + 1));
	}

	arrayToStr(array)
	{
		var str = "";
		var longest = 1;
		var pad = "";
		var len;

		var height = this.getHeight();
		var width = this.getWidth();

		for (var y = 0; y < height; y++)
		{
			for (var x = 0; x < width; x++)
			{
				len = State.numlen(this.getArrayVal(array, x, y));
				if(len > longest)
					longest = len;
			}
		}

		for (var i = 0; i < longest + 1; i++)
			pad += " ";

		var val;

		for (var y = 0; y < height; y++)
		{
			for (var x = 0; x < width; x++)
			{
				val = this.getArrayVal(array, x, y);
				str += val + pad.substring(State.numlen(val));
			}

			str += "\n";
		}

		return str;
	}

	toString()
	{
		return this.arrayToStr(this.universe.array);
	}

	getHash()
	{
		var hash = "";

		hash += State.HASH_SECTION_CELLS;

		for (var i = 0; i < this.cellList.length; i++)
			hash += this.cellList[i].coord[0] + "_" + this.cellList[i].coord[1] + ":" + this.cellList[i].direction + ",";

		hash += State.HASH_SECTION_END;

		return hash;
	}

	getStateStr()
	{
		var statestr = State.HASH_SECTION_SIZE + this.getHeight() + "," + this.getWidth() + State.HASH_SECTION_END;
		statestr += this.getHash();

		var array = this.universe.array;
		var height = this.getHeight();
		var width = this.getWidth();

		var last = this.getArrayVal(array, 0, 0);
		var count = 0;
		var val;

		statestr += State.HASH_SECTION_GRID;

		for (var y = 0; y < height; y++)
		{
			for (var x = 0; x < width; x++)
			{
				val = this.getArrayVal(array, x, y);
				if(val == last)
				{
					count++;
				}else
				{
					statestr += count + "_" + last + ",";

					count = 1;
					last = val;
				}
			}
		}

		statestr += count + "_" + last + ",";
		statestr += State.HASH_SECTION_END;

		return statestr;
	}

	static array1dFromStateStr(statestr)
	{
		var idx = statestr.indexOf(State.HASH_SECTION_GRID);
		if(idx != -1)
			statestr = statestr.substring(idx + State.HASH_SECTION_GRID.length);

		idx = statestr.indexOf(State.HASH_SECTION_END);
		if(idx != -1)
			statestr = statestr.substring(0, idx);

		var arr = [];
		var part;
		var count;
		var value;

		while(true)
		{
			idx = statestr.indexOf(",");
			if(idx == -1)
				break;

			part = statestr.substring(0, idx);
			statestr = statestr.substring(idx + 1);

			idx = part.indexOf("_");
			if(idx == -1)
				continue;

			count = parseInt(part.substring(0, idx), 10);
			value = parseInt(part.substring(idx + 1), 10);

			for (var i = 0; i < count; i++)
				arr.push(value);
		}

		return arr;
	}
}

State.GOAL = -1;
State.INACTIVE = -2;

State.HASH_SECTION_SIZE = "z";
State.HASH_SECTION_CELLS = "c";
State.HASH_SECTION_GRID = "g";
State.HASH_SECTION_END = "$";
