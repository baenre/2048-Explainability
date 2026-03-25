function Grid(size, score) {
  this.size = size;
  this.score = score;
  this.cells = [];

  this.build();
}

// Build a grid of the specified size
Grid.prototype.build = function () {
  for (var x = 0; x < this.size; x++) {
    var row = this.cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(null);
    }
  }
};

// Find the first available random position
Grid.prototype.randomAvailableCell = function () {
  var cells = this.availableCells();

  if (cells.length) {
    return cells[Math.floor(Math.random() * cells.length)];
  }
};

Grid.prototype.availableCells = function () {
  var cells = [];

  this.eachCell(function (x, y, tile) {
    if (!tile) {
      cells.push({ x: x, y: y });
    }
  });

  return cells;
};

// Call callback for every cell
Grid.prototype.eachCell = function (callback) {
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      callback(x, y, this.cells[x][y]);
    }
  }
};

// Check if there are any cells available
Grid.prototype.cellsAvailable = function () {
  return !!this.availableCells().length;
};

// Check if the specified cell is taken
Grid.prototype.cellAvailable = function (cell) {
  return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function (cell) {
  return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {
  if (this.withinBounds(cell)) {
    return this.cells[cell.x][cell.y];
  } else {
    return null;
  }
};

// Inserts a tile at its position
Grid.prototype.insertTile = function (tile) {
  this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.removeTile = function (tile) {
  this.cells[tile.x][tile.y] = null;
};

Grid.prototype.withinBounds = function (position) {
  return position.x >= 0 && position.x < this.size &&
         position.y >= 0 && position.y < this.size;
};

Grid.prototype.copy = function() {
  var copy = new Grid(this.size, this.score);
  this.eachCell(function(x, y, tile) {
    if (tile != null) {
      copy.cells[x][y] = tile.copy();
    }
  });
  return copy;
}

// REST OF THE METHODS ARE COPIED FROM GAME_MANAGER IN COLD BLOOD. SUE ME!

// Save all tile positions and remove merger info
Grid.prototype.prepareTiles = function () {
  this.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
    }
  });
};

// Move a tile and its representation
Grid.prototype.moveTile = function (tile, cell) {
  this.cells[tile.x][tile.y] = null;
  this.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
Grid.prototype.move = function (direction) {
  // 0: up, 1: right, 2:down, 3: left
  var self = this;

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.insertTile(merged);
          self.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });
  
  return moved;
};

//returns whether move in given direction is possible
Grid.prototype.canMoveInDirection = function (direction) {
  var gridCopy = this.copy();
  return gridCopy.move(direction);
}

//checks whether subsequent moves in 2 directions are possible
Grid.prototype.canMoveInDirections = function (direction1, direction2) {
  var gridCopy = this.copy();
  var firstMoveValid = gridCopy.move(direction1);
  var secondMoveValid = gridCopy.move(direction2);
  return (firstMoveValid && secondMoveValid);
}

//how much score is gained by moving in direction?
Grid.prototype.scoreGain = function (direction) {
  var gridCopy = this.copy();
  var curScore = this.score;
  gridCopy.move(direction);
  var newScore = gridCopy.score;
  return newScore - curScore;
}

//how much score is gained by moving in direction 1 then direction 2?
Grid.prototype.scoreGains = function (direction1, direction2) {
  var gridCopy = this.copy();
  var curScore = this.score;
  var moved = gridCopy.move(direction1);
  if (!moved) {
    return 0;
  }
  var score1 = gridCopy.score;
  moved = gridCopy.move(direction2);
  if (!moved) {
    return score1-curScore;
  }
  var score2 = gridCopy.score;
  return (score2 - score1) + (score1 - curScore);
}


//takes a list of tiles and determines whether values are sorted ascending or descending
Grid.prototype.isSorted = function (list) {
  list = list.filter(x => x !== null);
  if (list.length < 3) {
    return true;
  }
  else if (list.length == 3) {
    return ((list[0].value <= list[1].value && list[1].value <= list[2].value) || (list[0].value >= list[1].value && list[1].value >= list[2].value));
  }
  else {
    return ((list[0].value <= list[1].value && list[1].value <= list[2].value && list[2].value <= list[3].value) || (list[0].value >= list[1].value && list[1].value >= list[2].value && list[2].value >= list[3].value));
  }
}

Grid.prototype.willBeUnsorted = function (direction) {
  var gridCopy = this.copy();
  
  //total sorted rows and cols prior to move
  var count_presorted_rows = 0;
  for (var i = 0; i<4; i++) {
    var temp_row_list = [];
    for (var j=0; j<4; j++) {
      temp_row_list.push(gridCopy.cells[j][i]);
    }
    if (gridCopy.isSorted(temp_row_list)) {
      count_presorted_rows++;
    }
  }
 
  var count_presorted_cols = 0;
    for (var i = 0; i<4; i++) {
    var temp_col_list = [];
    for (var j=0; j<4; j++) {
      temp_col_list.push(gridCopy.cells[i][j]);
    }
    if (gridCopy.isSorted(temp_col_list)) {
      count_presorted_cols++;
    }
  }

  const presorted = count_presorted_rows + count_presorted_cols;
  
  
  //total sorted rows and cols after move
  const moved = gridCopy.move(direction);
  if (!moved) {
    return false;
  }
  var count_postsorted_rows = 0;
  for (var i = 0; i<4; i++) {
    var temp_row_list = [];
    for (var j=0; j<4; j++) {
      temp_row_list.push(gridCopy.cells[j][i]);
    }
    if (gridCopy.isSorted(temp_row_list)) {
      count_postsorted_rows++;
    }
  }
 
  var count_postsorted_cols = 0;
    for (var i = 0; i<4; i++) {
    var temp_col_list = [];
    for (var j=0; j<4; j++) {
      temp_col_list.push(gridCopy.cells[i][j]);
    }
    if (gridCopy.isSorted(temp_col_list)) {
      count_postsorted_cols++;
    }
  }

  const postsorted = count_postsorted_rows + count_postsorted_cols;
  return (postsorted < presorted);
}

Grid.prototype.willBeSorted = function (direction) {
  var gridCopy = this.copy();
  
  //total sorted rows and cols prior to move
  var count_presorted_rows = 0;
  for (var i = 0; i<4; i++) {
    var temp_row_list = [];
    for (var j=0; j<4; j++) {
      temp_row_list.push(gridCopy.cells[j][i]);
    }
    if (gridCopy.isSorted(temp_row_list)) {
      count_presorted_rows++;
    }
  }
 
  var count_presorted_cols = 0;
    for (var i = 0; i<4; i++) {
    var temp_col_list = [];
    for (var j=0; j<4; j++) {
      temp_col_list.push(gridCopy.cells[i][j]);
    }
    if (gridCopy.isSorted(temp_col_list)) {
      count_presorted_cols++;
    }
  }

  const presorted = count_presorted_rows + count_presorted_cols;
  
  
  //total sorted rows and cols after move
  const moved = gridCopy.move(direction);
  if (!moved) {
    //console.log("will be sorted? " + true);
    return true;
  }
  var count_postsorted_rows = 0;
  for (var i = 0; i<4; i++) {
    var temp_row_list = [];
    for (var j=0; j<4; j++) {
      temp_row_list.push(gridCopy.cells[j][i]);
    }
    if (gridCopy.isSorted(temp_row_list)) {
      count_postsorted_rows++;
    }
  }
 
  var count_postsorted_cols = 0;
    for (var i = 0; i<4; i++) {
    var temp_col_list = [];
    for (var j=0; j<4; j++) {
      temp_col_list.push(gridCopy.cells[i][j]);
    }
    if (gridCopy.isSorted(temp_col_list)) {
      count_postsorted_cols++;
    }
  }

  const postsorted = count_postsorted_rows + count_postsorted_cols;
  //console.log("will be sorted? " + (postsorted >= presorted));
  return (postsorted >= presorted);
}

Grid.prototype.isLargestInCorner = function () {
  var gridCopy = this.copy();
  var largest_tile_val = gridCopy.largestTile();
  var isLargestInCorner = (gridCopy.cells[0][0] != null && gridCopy.cells[0][0].getValue() == largest_tile_val ||
  gridCopy.cells[0][3] != null && gridCopy.cells[0][3].getValue() == largest_tile_val ||
  gridCopy.cells[3][0] != null && gridCopy.cells[3][0].getValue() == largest_tile_val ||
  gridCopy.cells[3][3] != null && gridCopy.cells[3][3].getValue() == largest_tile_val); 
  //console.log("is largest in corner? " + isLargestInCorner);
  return isLargestInCorner;
}

Grid.prototype.willLargestBeInCorner = function (direction) {
  var gridCopy = this.copy();
  gridCopy.move(direction);
  return gridCopy.isLargestInCorner();
}

//PYTHON
/*
def willLargestBeAtSide(observation : np.ndarray, direction : int) -> bool:
    grid = Grid(observation)

    if not grid.is_valid_move(toInput(direction)):
        return isLargestAtSide(observation)
    
    _, grid = grid.move(toInput(direction))
    return isLargestAtSide(grid.array())
//*/
Grid.prototype.isLargestAtSide = function () {
  var gridCopy = this.copy();
  var largest_tile_val = gridCopy.largestTile();
  var isLargestAtSide = (gridCopy.cells[0][0] != null && gridCopy.cells[0][0].getValue() == largest_tile_val ||
  gridCopy.cells[0][1] != null && gridCopy.cells[0][1].getValue() == largest_tile_val ||
  gridCopy.cells[0][2] != null && gridCopy.cells[0][2].getValue() == largest_tile_val ||
  gridCopy.cells[0][3] != null && gridCopy.cells[0][3].getValue() == largest_tile_val ||
  gridCopy.cells[1][0] != null && gridCopy.cells[1][0].getValue() == largest_tile_val ||
  gridCopy.cells[1][3] != null && gridCopy.cells[1][3].getValue() == largest_tile_val ||
  gridCopy.cells[2][0] != null && gridCopy.cells[2][0].getValue() == largest_tile_val || 
  gridCopy.cells[2][3] != null && gridCopy.cells[2][3].getValue() == largest_tile_val || 
  gridCopy.cells[3][0] != null && gridCopy.cells[3][0].getValue() == largest_tile_val || 
  gridCopy.cells[3][1] != null && gridCopy.cells[3][1].getValue() == largest_tile_val || 
  gridCopy.cells[3][2] != null && gridCopy.cells[3][2].getValue() == largest_tile_val || 
  gridCopy.cells[3][3] != null && gridCopy.cells[3][3].getValue() == largest_tile_val);
  //console.log("is largest at side? " + isLargestAtSide);
  return isLargestAtSide;
}

Grid.prototype.willLargestBeAtSide = function (direction) {
  var gridCopy = this.copy();
  gridCopy.move(direction);
  return gridCopy.isLargestAtSide();
}

Grid.prototype.largestTile = function () {
  var largest_tile_val = -1;
  for (var i=0; i<4;i++) {
    for (var j=0; j<4; j++) {
      if (this.cells[i][j] != null && this.cells[i][j].getValue() > largest_tile_val) {
        //console.log(this.cells[i][j]);
        largest_tile_val = this.cells[i][j].getValue();
      }
    }
  }
  return largest_tile_val;
}

// Get the vector representing the chosen direction
Grid.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // up
    1: { x: 1,  y: 0 },  // right
    2: { x: 0,  y: 1 },  // down
    3: { x: -1, y: 0 }   // left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
Grid.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

Grid.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.withinBounds(cell) &&
           this.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

Grid.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
