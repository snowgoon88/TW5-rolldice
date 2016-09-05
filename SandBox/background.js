// Generate Background

// read data
//var data = JSON.parse( data_back );
console.log( "read "+data.motivation.length );
var d_motiv = data.motivation;

/**
 * type = "motiv" -> random motivation
 */
function onClick( event, type ) {
    var roll = Math.floor((Math.random() * data.motivation.length)+1 );
    
    
    document.getElementById("motiv_type").innerHTML =
	" : "+d_motiv[roll].fr;
    document.getElementById("motiv_details").innerHTML =
	d_motiv[roll].desc;
    
}
