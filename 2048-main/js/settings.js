function getSearchParameters() {
      var prmstr = window.location.search.substr(1);
      return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}


function go() {
    var script = $('#script').val();
    var seed = $('#seed').val();
    var policy = $('#policy').val();
    window.location.href = '?script=' + script + '&seed=' + seed + '&policy=' + policy ;
}

$(document).ready(function() {
    $("#gobutton").click(go);
    var params = getSearchParameters();
    var script = params['script'];
    var policy = params['policy'];
    var seed = params['seed'];
    console.log("POLICY IS=" + policy);
    if (!policy) {
      policy = './policy2.js';
    }
    if (!script) {
        script = './js/policy_parser.js';
    }
    if (!seed) {
        seed = new Date().getTime();
    }

    $('#script').val(script);
    $('#seed').val(seed);
    $('#policy').val(policy);
    var scriptel = document.createElement('script');
    scriptel.src = script;
    var policyel = document.createElement('script');
    policyel.src = policy;
    document.head.appendChild(scriptel);
    document.head.appendChild(policyel);
});


