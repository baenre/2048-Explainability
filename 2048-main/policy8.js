var object1 = [{
  "defaultAction": 1,
  "entries": [
    {
      "action": 2,
      "condition": [
        {
          "orExpressions": [
            {
              "subExpressions": [
                {
                  "literals": [
                    {
                      "isNegated": false,
                      "type": "scoreGainGains",
                      "directions": [3, 2, 3,],
                      "relation": "<",
                    },
                  ]
                }
              ]
            }]
        }
      ]
    },
    {
      "action": 1,
      "condition": [{
        "orExpressions": [
          {
            "subExpressions": [
              {
                "literals": [
                  {
                    "isNegated": false,
                    "type": "scoreGainGains",
                    "directions": [3, 1, 0],
                    "relation": "<"
                  },
                ]
              },
            ]
          }
        ]
      }
      ]
    },
    {
      "action": 3,
      "condition": [{
        "orExpressions": [
          {
            "subExpressions": [
              {
                "literals": [
                  {
                    "isNegated": true,
                    "type": "canMoveInDirections",
                    "directions": [1, 1],
                    "relation": "can"
                  },
                ]
              }
            ]
          }
        ]
      }
      ]
    },
    {
      "action": 3,
      "condition": [
        {
          "orExpressions": [
            {
              "subExpressions": [
                {
                  "literals": [
                    {
                      "isNegated": false,
                      "type": "isLargestInCorner",
                      "directions": [],
                      "relation": "is",
                    },
                  ]
                },
              ]
            }
          ]
        },
      ]
    }
  ]
}
]


