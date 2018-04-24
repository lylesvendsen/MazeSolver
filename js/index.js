// Regular expression from W3C HTML5.2 input specification:
// https://www.w3.org/TR/html/sec-forms.html#email-state-typeemail
var emailRegExp = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

new Vue({
	// root node
	el: "#app",
	// the instance state
	data: function data() {
		return {
			mazetext: {
				text: "",
				maxlength: 50000,
				mazeData: {
					solved: false,
					path: []
				}
			},
			submitted: false
		};
	},
	methods: {
		// submit form handler
		submit: function submit() {
			this.solveMaze();
			this.submitted = true;
		},

		solveMaze: function solveMaze() {
			// Parse Maze Grid
			var tmpMaze = this.mazetext.text.split("\n");
			var tmpGrid = [];
			for (var i = 0; i < tmpMaze.length; i++) {
				tmpGrid.push(tmpMaze[i].split(""));
			}


			// Maze Constructor
			var maze = function(grid = [], startChr = "A", endChr = "B", openChr = ".", wallChr = "#", usedChr = "X") {
				this.startPos = [-1, -1];
				this.endPos = [-1, -1];
				this.path = [];
				this.gridWidth = 0;
				this.gridHeight = 0;
				this.solved = false;
				this.startChr = startChr;
				this.endChr = endChr;
				this.openChr = openChr;
				this.wallChr = wallChr;
				this.usedChr = usedChr;
				this.grid = [];
				this.orgGrid = [];

				this.setGrid = function(newGrid) {
					if (newGrid.length > 0) {
						this.grid = newGrid;
						this.orgGrid = JSON.parse(JSON.stringify(this.grid)); // Deep Copy
						this.gridWidth = this.grid.length[0];
						this.gridHeight = this.grid.length;

						for (var y = 0; y < this.grid.length; y++) {
							for (var x = 0; x < this.grid[y].length; x++) {
								if (this.grid[y][x] == this.startChr) {
									this.startPos = [x, y];
								} else if (this.grid[y][x] == this.endChr) {
									this.endPos = [x, y];
								}
							}
						}
					}
				};

				// Set Grid
				this.setGrid(grid);

				// Location Constructor
				this.loc = function(x, y, path = []) {
					this.x = x;
					this.y = y;
					this.path = path;
				};

				// Check for valid grid array element
				this.isValidStep = function(step) {
					if (step[0] < 0 || step[0] >= this.gridWidth || step[1] < 0 || step[1] >= this.gridHeight) {
						return false;
					} else {
						return true;
					}
				};


				// Solve maze with shortest path
				this.solve = function() {
					var step = [];
					var newPath = [];

					// Initialize Queue
					var queue = [new this.loc(this.startPos[0], this.startPos[1], [this.startPos])];

					// Loop through grid queue to find goal
					while (queue.length > 0) {
						// First Queue Location (FIFO)
						var queueLoc = queue.shift();

						// Moves
						var moves = [
							[0, -1],
							[1, 0],
							[0, 1],
							[-1, 0]
						]; // Up, Right, Down, Left

						// Loop Directions
						for (var i = 0; i < moves.length; i++) {
							step = [queueLoc.x + moves[i][0], queueLoc.y + moves[i][1]];

							if (this.isValidStep(step)) {
								newPath = queueLoc.path.slice();
								newPath.push(step);

								var newLocation = new this.loc(step[0], step[1], newPath);

								if (this.grid[step[1]][step[0]] === this.endChr) {
									this.path = newLocation.path.slice();
									this.solved = true;

									// Path Solution
									this.grid = JSON.parse(JSON.stringify(this.orgGrid)); // Deep Copy
									for (var j = 1; j < this.path.length - 1; j++) {
										this.grid[this.path[j][1]][this.path[j][0]] = usedChr;
									}

									return true;
								} else if (this.grid[step[1]][step[0]] === this.openChr) {
									this.grid[step[1]][step[0]] = this.usedChr;
									queue.push(newLocation);
								}
							}
						}
					}

					// No valid path found
					return false;
				};
			};


			this.mazetext.mazeData = new maze(tmpGrid);
			this.mazetext.mazeData.solve();

			this.drawMaze(this.mazetext.mazeData.grid, document.getElementById('maze-draw'));;

			console.log(this.mazetext.mazeData);
		},
	
	
		// Ugle Maze Display Code
		drawMaze: function drawMaze(aryMaze, el) {
			el.innerHTML = "";

			aryMaze.forEach(function(arr, index) {
				arr.forEach(function(path, i) {
					var span = document.createElement("span");
					span.textContent = "";
					if (path === ".") {
						span.style.backgroundColor = "black";
					} else if (path === "A") {
						span.style.backgroundColor = "green";
					} else if (path === "B") {
						span.style.backgroundColor = "red";
					} else if (path === "X") {
						span.style.backgroundColor = "yellow";
					} else if (path === "#") {
						span.style.backgroundColor = "blue";
					} else {
						span.style.backgroundColor = "white";
					}
					el.appendChild(span);
				});
				el.appendChild(document.createElement("br"));
			});
		}

	},
	watch: {

	}
});