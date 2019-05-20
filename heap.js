"use strict";

class Heap
{
	constructor()
	{
		this.array = [];
		this.count = 0;
	}

	clear()
	{
		this.array = [];
		this.count = 0;
	}

	insert(x)
	{
		if(this.count == this.array.length)
		{
			this.array.push(x);
		}else
		{
			this.array[this.count] = x;
		}

		this.count++;
		this.siftUp(this.count - 1);
	}

	siftUp(idx)
	{
		var cur = idx;
		var parent = ((cur - 1) / 2) >> 0;
		var tmp;

		while(this.compare(this.array[parent], this.array[cur]) > 0)
		{
			tmp = this.array[parent];
			this.array[parent] = this.array[cur];
			this.array[cur] = tmp;

			if(parent == 0)
				break;

			cur = parent;
			parent = ((cur - 1) / 2) >> 0;
		}
	}

	peek()
	{
		if(this.count == 0)
			return undefined;

		return this.array[0];
	}

	extract()
	{
		if(this.count == 0)
			return undefined;

		var result = this.array[0];

		this.count--;
		this.array[0] = this.array[this.count];
		this.array[this.count] = undefined;
		this.siftDown(0, this.count);

		return result;
	}

	//heapify
	siftDown(start, end)
	{
		var cur = start;
		var left, right, largest;
		var tmp;

		while(true)
		{
			left = 2 * cur + 1;
			right = 2 * cur + 2;
			largest = cur;

			if(left < end && this.compare(this.array[largest], this.array[left]) > 0)
				largest = left;
			if(right < end && this.compare(this.array[largest], this.array[right]) > 0)
				largest = right;

			if(largest == cur)
				break;

			tmp = this.array[largest];
			this.array[largest] = this.array[cur];
			this.array[cur] = tmp;
			cur = largest;
		}
	}

	sort()
	{
		var i = this.count - 1;
		var tmp;

		while(i > 0)
		{
			tmp = this.array[i];
			this.array[i] = this.array[0];
			this.array[0] = tmp;

			i--;
			this.siftDown(0, i);
		}

		//array gets sifted in reverse, oops?
		var half = this.count >> 1;
		for (var i = 0; i < half; i++)
		{
			tmp = this.array[i];
			this.array[i] = this.array[this.count - 1 - i];
			this.array[this.count - 1 - i] = tmp;
		}

		return this.array.slice(0, this.count);
	}

	compare(obj1, obj2)
	{
		throw Error("compare should be overriden");
	}
}

