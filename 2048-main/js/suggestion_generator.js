function SuggestionGenerator() {
  this.tracker = new Tracker();
}

SuggestionGenerator.prototype.generateSuggestion = function (grid) {

  if (typeof Ai === 'undefined') {
    console.log("typeof AI undefined")
    return;
  }
  if (this.ai == null) {
    this.ai = new Ai();
    if (this.ai.init != null) this.ai.init();
  }

  var suggestion = this.ai.stepExplainable(grid.copy());
  
  if (!suggestion) {
    //console.log("suggestion not found");
    return undefined; 
  } 

  //console.log(suggestion.move, suggestion.altMove)
  this.tracker.setMove(suggestion.move , suggestion.altMove);
  this.tracker.handlePlayerAction();

  return {
    move: this.moveToArrow(suggestion.move),
    altMove: suggestion.altMove, 
    e_winning: suggestion.e_winning,
    e_ordered: suggestion.e_ordered,
    e_alternative: suggestion.e_alternative
  };
}


SuggestionGenerator.prototype.moveToString = function (direction) {
  if (direction == 0) {
    return "up";
  }
  if (direction == 1) {
    return "right";
  }
  if (direction == 2) {
    return "down";
  }
  if (direction == 3) {
    return "left";
  }
}

SuggestionGenerator.prototype.moveToArrow = function (direction) {
  if (direction == 0) {
    return "&uarr;";
  }
  if (direction == 1) {
    return "&rarr;";
  }
  if (direction == 2) {
    return "&darr;";
  }
  if (direction == 3) {
    return "&larr;";
  }
}

SuggestionGenerator.prototype.processExplanation = function (explanation, direction) {
  for (let i = 0; i < 4; i++) {
    explanation[i][0] = '<b>' + this.moveToString(i) + ':</b> ' + (explanation[i][0] ?? 'not chosen') + '</br>';
  }
  explanation.unshift(explanation.splice(direction, 1)[0]);
  for (let i = 1; i < 4; i++) {
    explanation[i][0] = explanation[i][0] + '</ul>';
  }
  explanation_string = explanation.join(' ');
  
  return explanation_string;
}
