# Zhed Solver

** This project was an old coding exercise and is no longer maintained **

This is a [Zhed](https://play.google.com/store/apps/details?id=com.groundcontrol.zhed&hl=en_US "Zhed") puzzle game solver using state space search algorithms.
This runs locally on a browser, written in Javascript.

This project is not completely finished, but is in a working state. There still needs to be improvement to the search algorithm.

To use the solver, fill in the numbered cells in the grid according to the level, with the goal marked as `-1`. Cells set to `-2` are considered filled in, but not active.

To change the size of the grid, change the height and width boxes and press `Build New`, which will create a new grid to the specified size.

Once ready, press the solve button. The actions counter will increment, showing how many actions are being done. When the solution is found, the solver will output a step-by-step walkthrough of how to solve the level.

Note that if you choose a complicated level, your computer may run out of memory! Be cautious and watch your memory usage for very complex levels.

Pressing `Get URL Shortcut` will create a URL with the current grid state so you can go to saved states without having to enter them in manually.
