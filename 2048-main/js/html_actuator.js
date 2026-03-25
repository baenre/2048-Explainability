function HTMLActuator() {
  this.tileContainer = document.querySelector(".tile-container");
  this.scoreContainer = document.querySelector(".score-container");
  this.bestContainer = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.moveSuggestion = document.querySelector(".move-suggestion");
  this.moveExplanation = document.querySelector(".move-explanation");

  this.e_winning = document.querySelector("#e-winning");
  this.e_ordered = document.querySelector("#e-ordered");
  this.e_alternative = document.querySelector("#e-alternative");
  this.justificationButton = document.querySelector("#justificationButton");
  this.downloadButton = document.querySelector("#downloadButton");

  this.explanationHeader = document.querySelector(".explanation-header");
  this.score = 0;
  this.justificationIterator = 0;
  this.moveCounter = 0 ;
  this.moved = null; 
  this.shownExplSlides = []
  this.downloadcounter = 0; 

  this.unclearButtonEnabled = [true, true, true]; 


  if (this.justificationButton) {
    this.justificationButton.addEventListener("click", this.handleJustificationClick.bind(this));
  };

  //this.agreeContainer = document.querySelector(".agree-container");
  this.deviationContainer = document.querySelector(".deviation-container");
  this.explanationTracker = 0;


  //Handle buttons
  this.agreeButton = document.querySelector("#agreeButton");
  if (this.agreeButton) {
    this.agreeButton.addEventListener("click", this.playerAgrees.bind(this, true));
  }
  this.disagreeButton = document.querySelector("#disagreeButton");
  if (this.disagreeButton) {
    this.disagreeButton.addEventListener("click", this.playerAgrees.bind(this, false));
  }
  this.unsureButton = document.querySelector("#unsureButton");
  if (this.unsureButton) {
    this.unsureButton.addEventListener("click", this.handleUnsureClick.bind(this));
  }
  this.downloadButton = document.querySelector("#downloadButton");
  if (this.downloadButton){
    this.downloadButton.addEventListener("click", this.download.bind(this));
  }
  this.unclearButton = document.querySelector("#unclearButton");
   if (this.unclearButton){
    this.unclearButton.addEventListener("click", this.handleUnclearClick.bind(this));
  }

  this.helpButton = document.querySelector("#helpButton");
   if (this.helpButton){
    this.helpButton.addEventListener("click", this.handleHelpClick.bind(this));
  }
  
  this.displaymap = new Map ([
      [true , '#8f7a66'],
      [false, '#b1a091']
  ]); 
 
  //Button states
  this.buttonsDisabled = false;
  this.explanationVisible = false; 

  this.explanationContainer = document.querySelector("#explanation-container");
  this.explanationContainer.textContent = "1/3"; 
  this.helptextContainer = document.querySelector("#helptext-container");

  this.suggestionGenerator = new SuggestionGenerator();
  this.suggestionGenerator.tracker.moved = this.moved; 
  this.deviation = this.suggestionGenerator.tracker.deviation;
  this.gameCounter = 0; 
  document.getElementById("downloadButton").disabled = true;

}

HTMLActuator.prototype.download = function () {

  this.downloadcounter += 1; 
  const tracker = this.suggestionGenerator.tracker; 
  tracker.createGamelog(); 
  tracker.createPlayerlog("0"); 
  const jsonData = tracker.playerlog ; 
	
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: 'application/json'
  }); 

  const filename = `gamelog${this.downloadcounter}.json`
  saveAs(blob, filename); 
};

HTMLActuator.prototype.handleJustificationClick = function () {
  this.justificationIterator = (this.justificationIterator + 1) % 3;

  var temp_list = [this.e_winning, this.e_ordered, this.e_alternative];
  for (var i = 0; i < 3; i++) {
    if (i == this.justificationIterator && this.explanationVisible) {
      temp_list[i].style.display = "block";
      if (this.unclearButtonEnabled[i]) {
        document.getElementById("unclearButton").disabled = false;
        document.getElementById("unclearButton").style.background = '#8f7a66';
      } else {
        document.getElementById("unclearButton").disabled = true;
        document.getElementById("unclearButton").style.background = '#b1a091';
      }
      this.shownExplSlides.push(i); 
    } else {
      temp_list[i].style.display = "none";
    }
  }
  this.explanationContainer.textContent = `${this.justificationIterator +1}/3`;
  document.getElementById("helpButton").style.background = '#8f7a66';
  document.getElementById("helptext").style.display = "none";
};


HTMLActuator.prototype.buttondisplay = function (button, displayed) {
  var displaystyle = this.displaymap[displayed] ; 
  document.getElementById(button).disabled = !displayed;
  document.getElementById(button).style.background = displaystyle ;
};

HTMLActuator.prototype.setMoved = function (moved) {
  //console.log(moved)
  this.moved = moved; 
  this.suggestionGenerator.tracker.moved = moved; 
};

HTMLActuator.prototype.hideExplanation = function () {

  var temp_list = [this.e_winning, this.e_ordered, this.e_alternative];
  for (var i = 0; i < 3; i++) {
    temp_list[i].style.display = "none";
  }

  this.moveExplanation.style.display = "none";
  this.explanationHeader.style.display = "none";
  this.justificationButton.style.display = "none";
  this.unclearButton.style.display = "none";
  this.helpButton.style.display = "none";
  document.getElementById("helpline").style.display = "none";
  document.getElementById("helptext").style.display = "none";
  this.explanationVisible = false;
};

HTMLActuator.prototype.handleUnclearClick = function () {
  var i = this.justificationIterator ; 
  console.log(i); 

  if (this.unclearButtonEnabled[i] == false) return ;
  
  this.suggestionGenerator.tracker.setExplanationUnclear(i); 
  document.getElementById("unclearButton").disabled = true;
  document.getElementById("unclearButton").style.background = '#b1a091';
  this.unclearButtonEnabled[i] = false;
};

HTMLActuator.prototype.handleHelpClick = function () {
  //if (this.helpButtonEnabled == false) return; 
  document.getElementById("helpButton").style.background = '#b1a091';
  document.getElementById("helptext").style.display = "block";

  var textvalue = this.justificationIterator; 

  var text0 = "To decide on which direction to recommend the game looks ahead by simulating two moves in a row and calculating how many points each sequence would earn or other conditions. The sequence that earns more determines the suggested move. Here, the new tile that appears at each move is not taken into account, so the suggestion is a helpful guide rather than a guaranteed best move. In the explanations, the symbol ≥ means \"earns more points than or is equal to\", while > means \"earns strictly more points than\"."

  var text1 = "The explanation above shows how the suggested move was chosen - either by comparing how many points different move sequences would earn or by looking at other conditions on the board. It depends on the given game strategy which condition is prioritized, but generally the move whose sequence earns the most overall is suggested."

  var text2 = "If available, an alternative is also shown. This is either the move sequence with the second highest score gain, or a default move that is used when no other sequence stands out as more beneficial."

  switch(textvalue){
    case 0 : 
      this.helptextContainer.textContent = text0 ; 
      break; 
    case 1 :
      this.helptextContainer.textContent = text1 ; 
      break; 
    case 2 : 
      this.helptextContainer.textContent = text2 ; 
      break; 
    default: 
      this.helptextContainer.textContent = text0 ; 
  }
  this.suggestionGenerator.tracker.setHelp(textvalue); 
};



HTMLActuator.prototype.disableButtons = function () {
  this.buttonsDisabled = true;
  document.getElementById("agreeButton").disabled = true;
  document.getElementById("disagreeButton").disabled = true;

  document.getElementById("agreeButton").style.background = '#b1a091';
  document.getElementById("disagreeButton").style.background = '#b1a091';
};

HTMLActuator.prototype.enableButtons = function () {
  this.buttonsDisabled = false;

  document.getElementById("agreeButton").disabled = false;
  document.getElementById("disagreeButton").disabled = false;
  document.getElementById("unclearButton").disabled = false;

  document.getElementById("agreeButton").style.background = '#8f7a66';
  document.getElementById("disagreeButton").style.background = '#8f7a66';
  document.getElementById("unclearButton").style.background = '#8f7a66';
};

HTMLActuator.prototype.playerAgrees = function (agrees) {
  if (this.buttonsDisabled) return;
  this.suggestionGenerator.tracker.setPlayerAgreed(agrees); 
  this.disableButtons(); 
};


HTMLActuator.prototype.handleUnsureClick = function () {
  this.shownExplSlides.push(this.justificationIterator); 
  if (this.explanationVisible) {
    return;
  }
  else {
    this.unsureButton.disabled = true;
    this.unsureButton.style.background = '#b1a091';
    this.explanationVisible = true;
    this.suggestionGenerator.tracker.setUnsure(true);
    this.explanationTracker += 1;
    this.moveExplanation.style.display = "block";
    this.explanationHeader.style.display = "block";
    this.justificationButton.style.display = "block";
    document.getElementById("helpline").style.display = "block";
    this.unclearButton.style.display = "block";
    this.helpButton.style.display = "block";
  }
};


HTMLActuator.prototype.updateDeviation = function () {
  var deviation = this.suggestionGenerator.tracker.deviation;
  this.moveCounter = this.suggestionGenerator.tracker.moveCounter; 
  var moves = this.moveCounter;
  
  if (deviation == 0 || this.suggestionGenerator.tracker.deviation == undefined || moves <= 0) {
    this.deviationContainer.textContent = "0";
  }
  else {
    var deviationPercentage = (deviation / moves);
    this.deviationContainer.textContent = deviationPercentage.toFixed(2) ;
  }
};


HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;
  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);

    self.updateBestScore(metadata.bestScore);
    
    // Updates all game information and writes it into list
    self.updateValues(); 
    self.suggestionGenerator.tracker.writeInformation();
    
    //adding to update suggestion according to new grid
    self.updateSuggestion(grid); 

    //self.updateAgreeableness(metadata.agreeableness); RAUS
    self.updateDeviation(metadata.deviation);

    
    self.resetValues(); 

    if (metadata.over) {
      self.gameCounter += 1; 
      console.log(self.gameCounter);
      self.suggestionGenerator.tracker.totalScore = metadata.score;
      self.suggestionGenerator.tracker.gameResult = "lost";
      
      
      if (self.gameCounter > 8) {
        document.getElementById("downloadButton").style.background = '#8f7a66';
        document.getElementById("downloadButton").disabled = false;
      }


      self.message(false); // You lose
    }
    if (metadata.won) {
      self.gameCounter += 1; 
      self.suggestionGenerator.tracker.gameResult = "won";
      self.suggestionGenerator.tracker.totalScore = metadata.score ;
      if (self.gameCounter > 1) {
        document.getElementById("downloadButton").style.background = '#8f7a66';
        document.getElementById("downloadButton").disabled = false;
      } 


      self.message(true); // You win!
    }
  });
};

HTMLActuator.prototype.updateSuggestion = function (grid) {

  if (!this.suggestionGenerator || typeof Ai === 'undefined'){
    setTimeout(() => this.updateSuggestion(grid),100);
    return; 
  }
  var suggestion = this.suggestionGenerator.generateSuggestion(grid);
  if (suggestion === undefined) return; 
  this.moveSuggestion.innerHTML = suggestion.move;
  this.e_winning.innerHTML = suggestion.e_winning;
  this.e_ordered.innerHTML = suggestion.e_ordered;
  this.e_alternative.innerHTML = suggestion.e_alternative;
};


HTMLActuator.prototype.resetValues = function () {
    this.shownExplSlides = []
    this.suggestionGenerator.tracker.setPlayerAgreed(null); 
    this.suggestionGenerator.tracker.playerAgreedAlt = null; 
    this.suggestionGenerator.tracker.setUnsure(false);
    this.suggestionGenerator.tracker.helpslides = []
    this.suggestionGenerator.tracker.explanationsClear = []; 
    this.enableButtons();
    this.unclearButtonEnabled = [true, true, true]; 
    this.justificationIterator = 0 ;
    this.explanationContainer.textContent = "1/3"; 
    this.hideExplanation();
    this.unsureButton.disabled = false;
    this.unsureButton.style.background = '#8f7a66';
    this.helpButton.style.background = '#8f7a66';
}; 


HTMLActuator.prototype.updateValues = function () {
  this.suggestionGenerator.tracker.setExplanationShown(this.explanationVisible)
  this.deviation = this.suggestionGenerator.tracker.deviation;
  this.suggestionGenerator.tracker.setExplSlides(this.shownExplSlides); 
};

HTMLActuator.prototype.restart = function () {
  //this.gameCounter =+ 1; 
  console.log("Hier wird Gamelog geschrieben.")
  this.suggestionGenerator.tracker.createGamelog(); 
  this.suggestionGenerator.tracker.resetGamelog(); 
  this.clearMessage();
  };

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var element = document.createElement("div");
  var position = tile.previousPosition || { x: tile.x, y: tile.y };
  positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];
  this.applyClasses(element, classes);

  element.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(element, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(element, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(element, classes);
  }

  // Put the tile on the board
  this.tileContainer.appendChild(element);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
  if (this.moveCounter >= 1) this.suggestionGenerator.tracker.setScore(difference, score); 
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  this.messageContainer.classList.remove("game-won", "game-over");
};
