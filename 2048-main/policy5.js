var object1 = [ {
  "type" : "policy",
  "defaultAction": 1,
  "entries": [
    {
      "action": 2,
      "condition": [{
        "orExpressions" : [{
        "subExpressions" : [
            {
              "literals" : [
                    { "isNegated" : false, 
                      "type"     : "scoreGainGains",
                      "directions" : [3,2,0],
                      "relation" : "<",
                    },
              ]
            },
            {
              "literals" : [
                    {
                      "isNegated" : false, 
                      "type"     : "scoreGainGains",
                      "directions" : [3,2,3], 
                      "relation" : "<",
                    },
              ]
            },
        ]
        }]
      }]
    },
    {
      "action": 2,
      "condition": [{
        "orExpressions" : [{
        "subExpressions" : [
            {
              "literals"  : [
                    {
                      "isNegated" : false, 
                      "type"     : "scoreGains",
                      "directions" : [2,0,1,3], 
                      "relation" : "<",
                    },
                    {
                      "isNegated" : false, 
                      "type"     : "scoreGainGains",
                      "directions" : [3,1,0], 
                      "relation" : "<",
                    },
                    {
                      "isNegated" : true, 
                      "type"     : "isLargestAtSide",
                      "directions" : [],
                      "relation" : "is not",
                    },
              ]
            },
        ]
        }]
      }]
    },
    {
      "action": 3,
      "condition": [{
        "orExpressions" : [{ 
        "subExpressions" : [
            {
              "literals" : [
                    {
                      "isNegated" : true, 
                      "type"     : "willBeLargestAtSide",
                      "directions" : [3],
                      "relation" : "will not be",
                    },
              ]
            },
            {
              "literals" : [
                    {
                      "isNegated" : false, 
                      "type"     : "isLargestAtSide",
                      "directions" : [],
                      "relation" : "is",
                    },
              ]
            },
            {
              "literals" : [
                    {
                      "isNegated" : false, 
                      "type"     : "scoreGainGains",
                      "directions" : [2,1,2],
                      "relation" : "<",
                    },
              ]
            },
        ]
        }]
      }]
    },
    {
      "action": 1,
      "condition": [{
        "orExpressions" : [{
        "subExpressions" : [
            {
              "literals" : [
                    {
                      "isNegated" : false, 
                      "type"     : "scoreGain",
                      "directions" : [1,0], 
                      "relation" : ">",
                    },
              ]
            },
            {
              "literals" : [
                    {
                      "isNegated" : false, 
                      "type"     : "scoreGainGains",
                      "directions" : [2,0,0], 
                      "relation" : "<",
                    },
                    {
                      "isNegated" : false, 
                      "type"     : "scoreGainGains",
                      "directions" : [1,3,3], 
                      "relation" : ">",
                    },
                    {
                      "isNegated" : true, 
                      "type"     : "canMoveInDirections",
                      "directions" : [3,0],
                      "relation" : "cannot",
                    },
              ]
            },
        ]
        }]
      }]
    },
  ]
} ]