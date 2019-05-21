"use strict";

class Cell
{
	constructor(coord, parent, direction)
	{
		this.coord = coord;
		this.parent = parent;
		this.direction = direction;
		this.goal = null;
	}

	findUpwards(coord)
	{
		var c = this;

		do {
			if(c.compareCoord(coord))
				return true;

			c = c.parent;
		}while(c != null);

		return false;
	}

	compareCoord(coord)
	{
		return this.coord[0] == coord[0] && this.coord[1] == coord[1];
	}

	compareCell(cell)
	{
		return this.compareCoord(cell.coord) && this.direction == cell.direction;
	}

	static getReverseDir(dir)
	{
		return [2, 3, 0, 1][dir];
	}
}
