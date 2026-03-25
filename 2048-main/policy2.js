var object1 = [ {
  "type" : "policy",
  "defaultAction": 1,
  "entries": [
    {
      "action": 0,
      "condition": [{
        "orExpressions" : [{
        "subExpressions" : [
            {
              "literals" : [
                    {
                      "isNegated" : false, 
                      "type"     : "scoreGainGains",
                      "directions" : [3,0,3], 
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
                      "type"     : "scoreGainGains",
                      "directions" : [3,1,0], 
                      "relation" : "<",
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
                      "type"     : "canMoveInDirections",
                      "directions" : [1,2], 
                      "relation" : "can",
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
                      "type"     : "scoreGainGains",
                      "directions" : [1,2,0], 
                      "relation" : ">",
                    },
                    {
                      "isNegated" : false, 
                      "type"     : "scoreGainGains",
                      "directions" : [0,0,0], 
                      "relation" : "<",
                    },
                    {
                      "isNegated" : true, 
                      "type"     : "willBeLargestAtSide",
                      "directions" : [0], 
                      "relation" : "will be",
                    },
              ]
            },
        ]
        }]
      }]
    },
  ]
} ]