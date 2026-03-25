function Tracker() {
    this.keyboardInputManager = new KeyboardInputManager();
    this.moveHandler = this.handleMove.bind(this); 
    this.disabledButtons = false;
    this.moved = false; 

    //Für JSON
    this.gamelog = []; 
    this.gamelogs = []; 
    this.gameStep = []; 
    this.playerlog = []; 
    this.gameStepValues = []; 
    this.policy = 0 ; 

    this.player = "00"; 
    this.gameCounter = 0; 
    this.moveCounter = 0; 
    this.suggestedMove = null; 
    this.alternativeMove = null; 
    this.playersMove = null; 
    this.agreeableness = 0; 
    this.deviation = 0;
    this.explanationShown = false; 
    this.furtherExplanation = []; 
    this.playerAgreed = null;
    this.playerAgreedAlt = null; 
    this.gameResult = null;  
    this.explanationsClear = [] ; 
    this.helpslides = [];
    this.totalScore = 0;
    this.scoreGain = 0; 
    this.explStrings = []
}


Tracker.prototype.setCounter = function (counter) {
    this.moveCounter = counter; 
}

Tracker.prototype.handleMove = function (direction) {
    this.playersMove = direction ; 

    if (this.moved && this.gameResult == null) {
        this.moveCounter += 1;
 
        if (this.alternativeMove && this.alternativeMove == direction) {
            this.playerAgreedAlt = true ;
            
            if (this.alternativeMove == this.suggestedMove) {
                if (this.playerAgreed != null) return; 
                this.playerAgreed = true; 
                this.agreeableness += 1; 
                return; 
            }
            else { this.deviation += 1 ;}
            if (this.playerAgreed != null) return; 
            this.playerAgreed = false; 
        }
        else if (this.suggestedMove != direction ){
            this.deviation += 1; 
            if (this.playerAgreed != null) {
                return; 
            }
            this.playerAgreed = false; 
        }
        else {
            if (this.playerAgreed != null) {
                return; 
            }
            this.playerAgreed = true; 
            this.agreeableness += 1; 

        }
    }  
};


Tracker.prototype.handlePlayerAction = function () {
    if (this.moveHandlerRegistered) return; 
    this.keyboardInputManager.on("move", this.moveHandler);
    this.moveHandlerRegistered = true; 
    this.disabledButtons = false; 
};


Tracker.prototype.setMove = function (suggestion, alternative) {
    console.log(suggestion, alternative); 
    alternative ? this.alternativeMove = alternative : null ; 
    this.suggestedMove = suggestion; 
}


Tracker.prototype.setUnsure = function (klickedUnsure) {
    this.explanationNeeded = klickedUnsure; 
}

Tracker.prototype.setDeviation = function (deviation) {
    this.deviation = deviation; 
}

Tracker.prototype.setExplanationShown = function (explanationShown){
    this.explanationShown = explanationShown; 
}

Tracker.prototype.setExplanationUnclear = function (slide) {  
    this.explanationsClear.push(slide) ; 
}

Tracker.prototype.setScore = function (difference, score) {  
    this.scoreGain = difference; 
    this.totalScore = score; 
}

Tracker.prototype.setPlayerAgreed = function (clickedYes) {
    this.playerAgreed = clickedYes; 
    if (this.playerAgreed) {
        this.agreeableness += 1 ;
    }
};

Tracker.prototype.setPlayerAgreedAlt = function (clickedYes) {
    this.playerAgreedAlt = clickedYes; 
};


Tracker.prototype.setExplSlides = function (furtherExplanation) {
    this.furtherExplanation = furtherExplanation; 
};

Tracker.prototype.setHelp = function (slide) {  
    this.helpslides.push(slide); 
};


Tracker.prototype.writeInformation = function () {
    if (!this.moved) return;
    
    const moveCounter = this.moveCounter; 
    const move = this.suggestedMove;
    const alternative = this.alternativeMove; 
    const playerMove = this.playersMove; 
    var explClear = this.explanationsClear;
    var help = this.helpslides; 
    const explFurther = this.furtherExplanation; 
    const playerAgree = this.playerAgreed;
    const playerAgreedAlt = this.playerAgreedAlt; 

    const gameStep = {"Step" : moveCounter , "Information" : [
        {"Suggested move" : move},
        {"Alternative move" : alternative},
        {"Players move" : playerMove},
        {"Player agrees" : playerAgree},
        {"Player agrees w/ alternative": playerAgreedAlt},
        {"Score gain": this.scoreGain}, 
        {"Explanation slides shown" : explFurther}, 
        {"Unclear explanations" : explClear}, 
        {"Shown help" : help}
    ]}; 
    this.gameStepValues.push(gameStep); 
};

Tracker.prototype.createGamelog = function () {
    var policyname =  document.getElementById("policy").value ; 
    if (this.gameResult == null) {
        this.gameCounter += 1 ; 
    }
    console.log(this.totalScore);
    this.gamelog = {
        "Game number" : this.gameCounter , 
        "Game result": this.gameResult, 
        "Total score": this.totalScore,
        "Agreed with suggestion" : `${this.agreeableness}/${this.moveCounter}`, 
        "Deviated from suggestion" : `${this.deviation}/${this.moveCounter}`,
        "Policy" : policyname, 
        "Game sequence": this.gameStepValues
        
    };
    this.gamelogs.push(this.gamelog); 
}; 

Tracker.prototype.resetGamelog = function () {
    this.gameStepValues = []; 
    this.gameResult = null; 
    this.deviation = 0; 
    this.scoreGain = 0; 
    this.agreeableness = 0; 
    this.moveCounter = 0; 
    this.totalScore = 0; 
};

Tracker.prototype.createPlayerlog = function (playerName) {
    this.playerName = Math.floor(Math.random() * 10000); 
    this.playerlog = {"User": this.playerName, "Played games": this.gamelogs} ; 
};