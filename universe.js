"use strict";

function delayms(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}

class Universe
{
	constructor(arr, options=null)
	{
		this.height = arr.length;
		this.width = arr[0].length;

		if(options != null)
		{
			if(options.heuristic !== undefined)
				this.heuristic = options.heuristic;
		}else
		{
			this.heuristic = 0;
		}

		this.goal = null;

		//cells are stored as [x, y] vectors

		for (var y = 0; y < this.height; y++)
		{
			for (var x = 0; x < this.width; x++)
			{
				if(arr[y][x] == State.GOAL)
				{
					if(this.goal == null)
					{
						this.goal = new Int32Array(2);
						this.goal[0] = x;
						this.goal[1] = y;
					}else
					{
						throw Error("Not supported: cannot handle multiple goal cells");
					}
				}
			}
		}

		if(this.goal == null)
			throw Error("Invalid state: no goal cell");

		var gx = this.goal[0];
		var gy = this.goal[1];

		this.array = new Int32Array(this.height * this.width);
		this.goalfront = [];
		this.active = [];
		this.inactive = [];
		this.ready = false;

		var coord;

		for (var y = 0; y < this.height; y++)
		{
			for (var x = 0; x < this.width; x++)
			{
				this.array[y * this.width + x] = arr[y][x];

				if(arr[y][x] != 0)
				{
					if(arr[y][x] == State.GOAL)
					{
						//goal already found, skip
					}else
					if(arr[y][x] == State.INACTIVE)
					{
						coord = new Int32Array(2);
						coord[0] = x;
						coord[1] = y;
						this.inactive.push(coord);

						this.array[y * this.width + x] = 1;
					}else
					{
						coord = new Int32Array(2);
						coord[0] = x;
						coord[1] = y;
						this.active.push(coord);

						if(x == gx || y == gy)
							this.goalfront.push(new Cell(coord, null, x == gx ? (y < gy ? 2 : 0) : (x < gx ? 1 : 3)));
					}
				}
			}
		}

		this.initialstate = new State(this, null, []);

		this.statistics = {
			"actionsDone": 0,
			"checked": 0,
			"explored": 0,
			"fringe": 0,
			"maxFringe": 0,
			"timeEnd": 0,
			"timeStart": 0,
		};

		this.ready = true;
		this.max_iter = 8192;

		this.running = false;
		this.stopSolving = false;
	}

	async solveState()
	{
		this.running = true;

		while(!this.ready)
			await delayms(50);

		var fringe = new Heap();
		fringe.compare = function(s, t){
			return s.getPriority() - t.getPriority();
		};

		var explored = new Set();
		var state, stcopy;
		var hash;
		var actions;
		var solved = null;

		var actionsDone = 0;
		var checked = 0;
		var iter = 0;
		var i;

		this.statistics.timeEnd = -1;
		this.statistics.timeStart = Date.now();

		fringe.insert(this.initialstate);

		while(!this.stopSolving && fringe.count > 0)
		{
			checked++;
			iter++;

			if(this.statistics.maxFringe < fringe.count)
				this.statistics.maxFringe = fringe.count;

			if(iter == this.max_iter)
			{
				this.statistics.actionsDone = actionsDone;
				this.statistics.checked = checked;
				this.statistics.explored = explored.size;
				this.statistics.fringe = fringe.count;

				iter = 0;
				await delayms(10);
			}

			state = fringe.extract();
		/*
			//the algorithm will never create a cell-expand order that was done before, so storing the checked state hashes isn't necessary
			//this saves a lot of memory
			//from https://github.com/blueimp/JavaScript-MD5

			hash = md5(state.getHash(), null, true);

			if(explored.has(hash))
			{
				//console.log("explored explored explored explored explored explored explored explored");
				//console.log(state);
				continue;
			}
		*/
			actions = state.getActions();

			for (i = 0; i < actions.length; i++)
			{
				stcopy = state.copy();
				stcopy.parent = state;

				stcopy.doAction(actions[i]);
				actionsDone++;

				if(stcopy.isSolved())
				{
					solved = stcopy;
					break;
				}

				fringe.insert(stcopy);
			}

			if(solved != null)
				break;

			//explored.add(hash);
		}

		this.statistics.actionsDone = actionsDone;
		this.statistics.checked = checked;
		this.statistics.explored = explored.size;
		this.statistics.fringe = fringe.count;
		this.statistics.timeEnd = Date.now();

		this.running = false;
		this.stopSolving = false;

		return solved;
	}

	stop()
	{
		this.stopSolving = true;
	}

	copyArray()
	{
		return this.array.slice(0);
	}

	isRunning()
	{
		return this.running;
	}
}

//Universe.HEURISTIC_OPENCELLS = 1;
//Universe.HEURISTIC_CELLLIST = 2;

window._options = {
	"heuristic": 0
};
