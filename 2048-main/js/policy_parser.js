function Ai() {
    this.data = null;
    this.init = function() {
        this.data = object1[0];  
        //console.log(this.data); 
        this.literalCounts = {};
        //construct map of literals
        for (var i = 0; i<this.data.entries.length;i++) {
          var entry = this.data.entries[i];
          var orExpressions = entry.condition[0].orExpressions;
          for (var j=0; j<orExpressions.length; j++) {
            var subExpressions = orExpressions[j].subExpressions;
            for (var s=0; s<subExpressions.length; s++) {
              var literals = subExpressions[s].literals; 
              for (var l=0; l<literals.length; l++) {
                //var literal = new Literal(grid, literals[l]);
                var literal = literals[l];
		var dirs_string = "";
		for (let dir of literal.directions) {
		  dirs_string += getDirectionAsString(dir);
		}
		this.literalCounts[literal.type + dirs_string] = [0, 0];
              }
            }
          }
        }       
    }

    this.restart = function() {
        // This method is called when the game is reset.
    }

    this.step = function(grid) {

    }
    
    this.printCounts = function() {
      console.log(this.objectToCSV(this.literalCounts));
    }
    
    this.objectToCSV = function(obj) {
	    // Extract headers (Key, Value1, Value2, ...)
	    const headers = ["Key", ...Array.from({ length: Math.max(...Object.values(obj).map(v => v.length)) }, (_, i) => `Value${i + 1}`)];
	    
	    // Extract rows
	    const rows = Object.entries(obj)
		.map(([key, values]) => [key, ...values].join(","))
		.join("\n");

	    return `${headers.join(",")}\n${rows}`;
    }
    
    this.stepExplainable = function(grid) {
      var e_winning = "";
      var e_ordered = "";
      var e_alternative = "";

      var response = {
      	        move: null,
                altMove: null, //just for gameplay	        
	        e_winning: null,
	        e_ordered: null,
	        e_alternative: null //need to continue loop
      }
      var keep_evaluating = true;
      //entries loop (if branch)
      for (var i = 0; i<this.data.entries.length;i++) {
        var entry = this.data.entries[i];
        var orExpressions = entry.condition[0].orExpressions;
        moveDirection = entry.action;
        //TODO loop through policy to generate map with literal names and true/false evaluation counts...
        
        //or expressions loop (or)
        var orExpressionFulfilled = false;
        var temp_exp_orBranch_yes = "";
        var temp_exp_orBranch_no = "";
        for (var j=0; j<orExpressions.length; j++) {
          var subExpressions = orExpressions[j].subExpressions;

          //subexpressions loop (and)
          var temp_exp_andBranch_not = "";
          var temp_exp_andBranch_yes = "";
          for (var s=0; s<subExpressions.length; s++) {
            var subExpressionFulfilled = true;
            var literals = subExpressions[s].literals;  
            //console.log(literals); // TODO
                     
            //literals to be conjuncted
            for (var l=0; l<literals.length; l++) {
              var literal = new Literal(grid, literals[l]);
              //console.log(literal); 
              //console.log("keep evaluating="+ keep_evaluating);
              if (keep_evaluating) {
                var index = (literal.val && !literal.neg || !literal.val && literal.neg) ? 0 : 1;
                this.literalCounts[literal.title][index]++;
              }
              
              //if any literal is false, and-expression is false
              if (!literal.val) {
                subExpressionFulfilled = false;
                //remember this as reason not chosen, but ignore if another subexpression true...
                temp_exp_andBranch_not += '<li>' + literal.desc + '</li>';
                //delete existing 'yes' explanation
                temp_exp_andBranch_yes = "";
              } else {
                //literal was true, add to yes explanation
                temp_exp_andBranch_yes += '<li>' + literal.desc + '</li>';
              }
            }
            
            //if subexpression fulilled, or expression fulfilled
            if (subExpressionFulfilled) {
              orExpressionFulfilled=true;
              //console.log("turning keep evaluating false");
              keep_evaluating=false;
              if (e_winning == "") {
                //console.log(temp_exp_andBranch_yes);
                e_winning += getDirectionAsStyledString(moveDirection) + " chosen because <ul>" + temp_exp_andBranch_yes + '</ul>';
                e_ordered += getDirectionAsStyledString(moveDirection) + " chosen because <ul>" + temp_exp_andBranch_yes + '</ul>';
              } else if (!keep_evaluating && response.e_alternative == null) {
                e_alternative =  getDirectionAsStyledString(moveDirection) + " is the recommended alternative move because <ul>" + temp_exp_andBranch_yes + "</ul>";
                altMove = moveDirection; 
              }
              //final entry in e_ordered
              //start of e-alt...?
            } else {
                temp_exp_orBranch_no += temp_exp_andBranch_not;
            }
            
          }
        }
        
        //for now, we run through all of them without breaking, however returning may be reasonable here
        if (orExpressionFulfilled && response.move == null) {
          response.move = moveDirection;
          response.e_winning = e_winning;
          response.e_ordered = e_ordered;
          
          //return response;
          //continue loop for e_alt...
        } else if (orExpressionFulfilled) {
          response.e_alternative = e_alternative;
          response.altMove = altMove;
          return response;
        } else {
          e_ordered = e_ordered + getDirectionAsStyledString(moveDirection) + " not chosen because <ul>" + temp_exp_orBranch_no + "</ul>";
          temp_exp_orBranch_no = "";
        }
        
      }
      //console.log(altMove); 
      //no or expression satisfied, return default move
      moveDirection=this.data.defaultAction;
      if (response.move != null) {
        response.altMove = moveDirection; 
        response.e_alternative = getDirectionAsStyledString(moveDirection) + " is the recommended alternative move because <ul> <li> right is default move </li> </ul>";
        return response;
      }
      e_winning = getDirectionAsStyledString(moveDirection) + " is default move";
      e_ordered += getDirectionAsStyledString(moveDirection) + " is default move";
      return {
	    move: moveDirection,
      altMove : null, 
	     e_winning: e_winning,
	     e_ordered: e_ordered,
	     e_alternative: "No alternative move."

	};
    }
}

//convert number directions to string
function getDirectionAsString(direction) {
  if (direction == 0) {
    return "Up";
  }
  if (direction == 1) {
    return "Right";
  }
  if (direction == 2) {
    return "Down";
  }
  if (direction == 3) {
    return "Left";
  }
}

//convert number directions to styled string
function getDirectionAsStyledString(direction) {
  if (direction == 0) {
    return "<span style=\"background: #8f7a66; color: #f9f6f2; padding: 0 5px;border-radius: 3px;font-weight: bolder;\">UP</span>";
  }
  if (direction == 1) {
    return "<span style=\"background: #8f7a66; color: #f9f6f2; padding: 0 5px;border-radius: 3px;font-weight: bolder;\">RIGHT</span>";
  }
  if (direction == 2) {
    return "<span style=\"background: #8f7a66; color: #f9f6f2; padding: 0 5px;border-radius: 3px;font-weight: bolder;\">DOWN</span>";
  }
  if (direction == 3) {
    return "<span style=\"background: #8f7a66; color: #f9f6f2; padding: 0 5px;border-radius: 3px;font-weight: bolder;\">LEFT</span>";
  }
}

function makeHTML(rel) {
  return rel 
    .replace(/>=/, "≥")
    .replace(/<=/, "≤")
}


//helper class for literals and descriptions
class Literal {
    //dictionary to get relation strings and their opposites

    static literal_dict = {
        ">": "<=",
        "<": ">=",
        "<=": ">",
        ">=": "<",
        "=": "!=",
        "!=": "=",
        "is": "is not",
        "is not": "is",
        "can":"cannot",
        "cannot":"can", 
        "will be" : "will not be",
        "will not be" : "will be"
    };
    
    
    //dictionary to map string relation to comparison function

    static relationMap = {
	  ">=": (a, b) => a >= b,
	  "<=": (a, b) => a <= b,
	  ">": (a, b) => a > b,
	  "<": (a, b) => a < b,
	  "==": (a, b) => a == b,
	  "!=": (a, b) => a !== b
    };

    
    static descriptionMap = {
        "scoreGain": "Score gain for move !!dir!! !!rel!! !!dir!!.",
        "scoreGainGains": "Score gain for move !!dir!! !!rel!! !!dir!!, !!dir!!.",
        "scoreGains": "Score gain for move sequence !!dir!!, !!dir!! !!rel!! !!dir!!, !!dir!!.",
        "canMoveInDirection": "!!rel!! move !!dir!!",
        "canMoveInDirections": "!!rel!! move !!dir!! then !!dir!!.",
        "isLargestAtSide": "largest tile value !!rel!! at side.",
        "willBeLargestAtSide": "After move !!dir!! largest tile value !!rel!! at side.",
        "isLargestInCorner": "largest tile value !!rel!! in corner",
        "willLargestBeInCorner": "After move !!dir!! largest tile value !!rel!! in corner.",
        "willBeSorted": "After move !!dir!! grid !!rel!! sorted.",
        "willBeUnsorted": "After move !!dir!! grid !!rel!! unsorted."
    }; 
    
    constructor(grid, literal) {
        this.neg = literal.isNegated;
        this.val = this.evaluateExpression(grid, literal);
        this.rel = this.getRelationString(this.val, literal.relation, literal.isNegated);
        this.desc = this.generateDescription(literal.type, literal.directions);
        var dirs_string = "";
	for (let dir of literal.directions) {
	  dirs_string += getDirectionAsString(dir);
	}
        this.title = literal.type+dirs_string;
    }
    
    //choose and evaluate proper expression, if negated flip expression value
    evaluateExpression(grid, literal) {
      switch (literal.type) {
        case "scoreGain":
	  const scoreGain1 = grid.scoreGain(literal.directions[0]); 
	  const scoreGain2 = grid.scoreGain(literal.directions[1]); 
	  const compareScoreGain = Literal.relationMap[literal.relation];
	  return (literal.isNegated) ? !compareScoreGain(scoreGain1, scoreGain2) : compareScoreGain(scoreGain1, scoreGain2);
      case "scoreGainGains":
	  const scoreGain01 = grid.scoreGain(literal.directions[0]); 
	  const scoreGains02 = grid.scoreGains(literal.directions[1], literal.directions[2]); 
	  const compareScoreGainGains = Literal.relationMap[literal.relation];
	  return (literal.isNegated) ? !compareScoreGainGains(scoreGain01, scoreGains02) : compareScoreGainGains(scoreGain01, scoreGains02);
        case "scoreGains":
	  const scoreGains1 = grid.scoreGains(literal.directions[0], literal.directions[1]); 
  	  const scoreGains2 = grid.scoreGains(literal.directions[2], literal.directions[3]);
  	  const compareGains = Literal.relationMap[literal.relation];
  	  return (literal.isNegated) ? !compareGains(scoreGains1, scoreGains2) : compareGains(scoreGains1, scoreGains2);
        case "canMoveInDirection":
	  const canMoveInDirectionExpression = grid.canMoveInDirection(literal.directions[0]);
	  return (literal.isNegated) ? !canMoveInDirectionExpression : canMoveInDirectionExpression; 
	case "canMoveInDirections":
	  const canMoveInDirectionsExpression = grid.canMoveInDirections(literal.directions[0], literal.directions[1]);
	  return (literal.isNegated) ? !canMoveInDirectionsExpression : canMoveInDirectionsExpression; 
	case "isLargestAtSide":
	  const isLargestAtSideExpression = grid.isLargestAtSide();
	  return (literal.isNegated) ? !isLargestAtSideExpression : isLargestAtSideExpression; 
        case "willLargestBeAtSide":
	  const willBeLargestAtSideExpression = grid.willLargestBeAtSide(literal.directions[0]);
	  return (literal.isNegated) ? !willBeLargestAtSideExpression : willBeLargestAtSideExpression; 
	case "isLargestInCorner":
	  const isLargestInCornerExpression = grid.isLargestInCorner();
	  return (literal.isNegated) ? !isLargestInCornerExpression : isLargestInCornerExpression; 
        case "willLargestBeInCorner":
	  const willLargestBeInCornerExpression = grid.willLargestBeInCorner(literal.directions[0]);
	  return (literal.isNegated) ? !willLargestBeInCornerExpression : willLargestBeInCornerExpression; 
        case "willBeSorted":
	  const willBeSortedExpression = grid.willBeSorted(literal.directions[0]);
	  return (literal.isNegated) ? !willBeSortedExpression : willBeSortedExpression; 
        case "willBeUnsorted":
	  const willBeUnsortedExpression = grid.willBeUnsorted(literal.directions[0]);
	  return (literal.isNegated) ? !willBeUnsortedExpression : willBeUnsortedExpression; 
        default:
	  console.log("Unhandled literal type:", literal.type);
      }
    }
    
    //get proper relation direction for description string
    getRelationString(val, rel, neg) {
        if (val && neg || !neg && !val) {
          return Literal.literal_dict[rel];
        }
        return rel;
    }
    
    //replace placeholder directions with strings
    generateDescription(type, directions) {
        var descTemplate = Literal.descriptionMap[type];
        for (var i=0; i<directions.length; i++) {
          descTemplate = descTemplate.replace("!!dir!!", getDirectionAsString(directions[i]));
        }
        return descTemplate.replace("!!rel!!", makeHTML(this.rel));
    }
}
