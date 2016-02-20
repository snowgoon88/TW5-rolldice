// Roll dice using Random

function dice( max ) {
    // max set to 6 if no value given
    max = max !== undefined ? max : 6;
    //
    var roll = Math.floor((Math.random() * max) + 1);
    var val = roll;
    while( roll == max ) {
	roll = Math.floor((Math.random() * max) + 1);
	val = val + roll;
    }
    console.log( "DICE> " + val + " / "+ max );
    return val;
}

function onClick(event,id) {
    // console.log( "onClick.event: " + event );
    // console.log( "onClick.event.target: " + event.target );
    // var elem = event.target;
    // console.log( "elem: " + elem.tagName );
    // console.log( "elem: " + elem.id );
    //var src_elem = document.getElementById(id);
    var src_elem = event.target.parentElement;
    var out_elem = src_elem.getElementsByClassName('result');
    var details_elem = src_elem.getElementsByClassName('details');
    var nb_elem  = src_elem.getElementsByClassName('nbDice');
    var keep_elem = src_elem.getElementsByClassName('nbKeep');
    var spe_elem = src_elem.getElementsByClassName('specialized');

    var nb_dice = Number(nb_elem[0].value);
    var nb_keep = Number(keep_elem[0].value);
    var specialized = spe_elem[0].checked;
    //console.log( "spe=" + specialized );
    if( nb_keep > nb_dice ) {
	nb_keep = nb_dice;
    }
    var details = [];
    var res = 0;
    var bonus = 0; // Si trop de dés
    if( nb_dice > 10 ) {
	//console.log( "__DICE > 10");
	var dice_sup = Math.floor((nb_dice-10) / 2);
	//console.log( "supp="+dice_sup );
	if( (nb_keep + dice_sup) <= 10 ) {
	    console.log( "__OK");
	    nb_keep = nb_keep+dice_sup;
	    nb_dice = nb_dice - 2 * dice_sup;
	    //console.log( "d="+nb_dice+"  k="+nb_keep+"   s="+dice_sup );
	}
	else {
	    //console.log( "__KEEP==10" );
	    nb_dice = nb_dice - (10-nb_keep)*2;
	    nb_keep = 10;
	    //console.log( "d="+nb_dice+"  k="+nb_keep+"   s="+dice_sup );
	}
	//console.log( "d="+nb_dice+"  k="+nb_keep+"   s="+dice_sup );
    }
    if( (nb_dice >= 10) && (nb_keep >= 10) ) {
	//console.log( "__BOTH >10" );
	bonus = 2 * ((nb_dice-10) + (nb_keep-10));
	nb_dice = 10;
	nb_keep = 10;
    }
    // 10 reste le max
    if( nb_dice > 10 ) {
	nb_dice = 10;
    }
    for( var i = 0; i < nb_dice; i++ ) {
	var roll = dice(10);
	if( roll == 1 && specialized )
	    roll = dice(10);
	details.push( roll );
    }
    details = details.sort(function(a, b) {
  return b - a;
});
    if( bonus > 0 ) {
	details.push("+"+bonus);
    }
    for( var i = 0; i < nb_keep; i++ ) {
	res += details[i];
    }
    res += bonus;
    out_elem[0].innerHTML = " : " + res;
    details_elem[0].innerHTML = details;
}
