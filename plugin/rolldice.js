/*\
title: $:/plugins/snowgoon88/rolldice/rolldice.js
type: application/javascript
module-type: widget

A <$rolldice> widget that roll dices for RPG.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget,
    RolldiceWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
    },
    /** OpenEnded Dice Up : L5R */
    rollDiceOpenUp = function ( max ) {
	// max set to 6 if no value given
	max = max !== undefined ? max : 6;
	//
	var roll = Math.floor((Math.random() * max) + 1);
	var val = roll;
	while( roll == max ) {
	    roll = Math.floor((Math.random() * max) + 1);
	    val = val + roll;
	}
	//DEBUG console.log( "DICE> " + val + " / "+ max );
	return val;
    },
    /** Normal dice : Fate */
    rollDiceNorm = function ( max ) {
    	// max set to 6 if no value given
	max = max !== undefined ? max : 6;
	//
	var roll = Math.floor((Math.random() * max) + 1);
	//DEBUG console.log( "DICE> " + roll + " / "+ max );
	return roll;
    },
    /** L5R roll */
    rollL5R = function( nb_dice, nb_keep, specialized ) {
	// do not keep more dice than thrown
	if( nb_keep > nb_dice ) {
	    nb_keep = nb_dice;
	}
	var details = []; // all the results
	var res = 0;      // results as value
	var bonus = 0;    // if too much dices
	// More than 10 dice
	if( nb_dice > 10 ) {
	    //console.log( "__DICE > 10");
	    var dice_sup = Math.floor((nb_dice-10) / 2);
	    //console.log( "supp="+dice_sup );
	    // Total kept <= 10 ?
	    if( (nb_keep + dice_sup) <= 10 ) {
		//DEBUG console.log( "__OK");
		nb_keep = nb_keep+dice_sup;
		nb_dice = nb_dice - 2 * dice_sup;
		//console.log( "d="+nb_dice+"  k="+nb_keep+"   s="+dice_sup );
	    }
	    // Too much kept dices
	    else {
		//console.log( "__KEEP==10" );
		nb_dice = nb_dice - (10-nb_keep)*2;
		nb_keep = 10;
		//console.log( "d="+nb_dice+"  k="+nb_keep+"   s="+dice_sup );
	    }
	    //console.log( "d="+nb_dice+"  k="+nb_keep+"   s="+dice_sup );
	}
	// Too much to throw, too much to keep
	if( (nb_dice >= 10) && (nb_keep >= 10) ) {
	    //console.log( "__BOTH >10" );
	    bonus = 2 * ((nb_dice-10) + (nb_keep-10));
	    nb_dice = 10;
	    nb_keep = 10;
	}
	// Can't throw more than 10 dices
	if( nb_dice > 10 ) {
	    nb_dice = 10;
	}
	// roll dices, take car of specialization
	for( var i = 0; i < nb_dice; i++ ) {
	    var roll = rollDiceOpenUp(10);
	    if( roll == 1 && specialized )
		roll = rollDiceOpenUp(10);
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

	return { res : res,
		 details : details
	       };
    },
    rollFate = function (comp) {
	var dice = ["-",".","+"];
	var sum = 0,
	res = "",
	details = [];
	// roll dices
	for( var i = 0; i < 4; i++ ) {
	    var roll = rollDiceNorm(3);
	    details.push( dice[roll-1] );
	    sum += (roll-2);
	}
	// Add competence
	sum += comp;
	if( sum >= 0 ) {
	    res += "+"
	}
	res += sum; //+" "+scale[sum+4];
	return { res : res,
		 details : details
	       };
    };
/*
Inherit from the base widget class
*/
RolldiceWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
RolldiceWidget.prototype.render = function(parent,nextSibling) {
    this.parentDomNode = parent;
    this.nextSibling = nextSibling;
    this.computeAttributes();
    this.execute();
   
    // Will hold all nodes created
    var nodes = []; 
    // Span, plus souple que Div 
    this.rollNode = $tw.utils.domMaker( "span", {
	"class" : "rd-dice"
    });
    // Render into the dom the Children of the node
    var spanNode = $tw.utils.domMaker( "span", {
	"class" : "rd-label"
    });
    // Insert Child Node or label
    if( this._label ) {
	spanNode.innerHTML = this._label;
    }
    else {
	this.renderChildren(spanNode, null);
    }
    this.rollNode.appendChild(spanNode);
    // Insert Selection
    var selectNode = $tw.utils.domMaker( "span", {
	"class" : "rd-select"
    });
    if( this._type === "L5R" ) {
	// Input
	this.inDiceNode = $tw.utils.domMaker( "input", {
	    "class" : "rd-nb-dice",
	    attributes : { type:"number",
			   value: this._nbDice ? this._nbDice : 1,
			   min:1, max:20, style:"width: 2.5em"}
	});
	selectNode.appendChild(this.inDiceNode);
	var textNode = this.document.createTextNode(" g ");
	selectNode.appendChild(textNode);
	this.inKeepNode = $tw.utils.domMaker( "input", {
	    "class" : "rd-nb-keep",
	    attributes : { type:"number",
			   value: this._nbKeep ? this._nbKeep : 1,
			   min:1, max:20, style:"width: 2.5em"}
	});
	selectNode.appendChild(this.inKeepNode);
	var specAttributes = {type:"checkbox"};
	if( this._specialized ) {
	    specAttributes["checked"] = true;
	}
	this.inSpecNode = $tw.utils.domMaker( "input", {
	    "class" : "rd-spec",
	    attributes : specAttributes
	});
	selectNode.appendChild(this.inSpecNode);
	textNode = this.document.createTextNode(" Spéc. ");
	selectNode.appendChild(textNode);
    }
    else if( this._type === "Fate" ) {
	// Niveau
	this.inComp = $tw.utils.domMaker( "select", {
	    "class" : "rd-ft-comp"
	});
	// append level
	var scale = ["-2 Atroce","-1 Mauvais","+0 Médiocre","+1 Moyen","+2 Passable","+3 Bon","+4 Excellent","+5 Formidable","+6 Fantastique","+7 Epique","+8 Légendaire"];
	for( var i=0; i < scale.length; i++ ) {
	    var option = this.document.createElement( "option" );
	    option.value = scale[i];
	    option.text =  scale[i];
	    var startComp = this._compLevel ? this._compLevel : 2
	    if( i === startComp ) { // default value
		option.selected = true;
	    }
	    this.inComp.appendChild(option);
	}
	selectNode.appendChild( this.inComp );
    }
     this.rollNode.appendChild(selectNode);
    // Button
    this.rollBtnNode = $tw.utils.domMaker( "button", {
	"class" : "rd-btn",
	eventListeners: [{
	    name: "click", 
	    handlerObject: this, 
	    handlerMethod: "onClickEvent"
		}]
    });
    textNode = this.document.createTextNode("Roll");
    this.rollBtnNode.appendChild(textNode);
    this.rollNode.appendChild( this.rollBtnNode );
    // Results
    this.resNode = $tw.utils.domMaker( "span", {
	"class" : "rd-result"
    });
    textNode = this.document.createTextNode(" : -");
    this.resNode.appendChild(textNode);
    this.rollNode.appendChild( this.resNode );
    textNode = this.document.createTextNode(" [");
    this.rollNode.appendChild(textNode);
    this.detailNode = $tw.utils.domMaker( "span", {
	"class" : "rd-details"
    });
    this.rollNode.appendChild( this.detailNode );
    textNode = this.document.createTextNode("]");
    this.rollNode.appendChild(textNode);			     
    
    // Insert the elements into the DOM
    parent.insertBefore(this.rollNode,nextSibling);
    this.domNodes.push(this.rollNode);
    if( this._type === "L5R" ) {
	this.domNodes.push(this.inDiceNode);
	this.domNodes.push(this.inKeepNode);
	this.domNodes.push(this.inSpecNode);
    }
    this.domNodes.push(this.rollBtnNode);
    this.domNodes.push(this.resNode);
    this.domNodes.push(this.detailsNode);
    
    // Render into the dom : NO, we do not care for children
    // this.renderChildren(this.parentDomNode,nextSibling);
};

/**
 * Compute the internal state of the widget.
 *
 * Widget Attributes (value="5g3s") 
 *  >> Field ("[L5R:][label:]5g3s"
 * Default : L5R::1g1
 */
RolldiceWidget.prototype.execute = function() {
    // Get attributes with high priority
    this._type = this.getAttribute( "type" );   // L5R ou Fate
    this._value = this.getAttribute( "value" ); // to be parsed
    this._label = this.getAttribute( "label" ); // replace Child
    // Get Field (change other only if undefined)
    if( this.hasAttribute( "field" ) ) {
	var fieldName = this.getAttribute( "field" );
	var tiddlerName = this.getVariable("currentTiddler");
	//DEBUG console.log( "__CURRENT t="+tiddlerName);
	var tiddler = $tw.wiki.getTiddler(tiddlerName);
	var fieldValue = tiddler.getFieldString(fieldName);
	//DEBUG console.log( "__FIELD n="+fieldName+" v="+fieldValue );
	this.parseField( fieldValue );
    }
    // Default type
    this._type = this._type ? this._type : "L5R";
    // Parse value to get nbDice and nbKeep (TODO L5R specific)
    if( this._type && this._value ) {
	this.parseValue( this._type, this._value );
    }
    // Do not make child widgets !
    // this.makeChildWidgets();
};

RolldiceWidget.prototype.onClickEvent = function (event) {
    console.log( "__ROLL" );

    if( this._type === "L5R" ) {

	var nb_dice = Number( this.inDiceNode.value );
	var nb_keep = Number( this.inKeepNode.value );
	var specialized = this.inSpecNode.checked;
	console.log( "nb="+nb_dice+" nk="+nb_keep+" spe=" + specialized );
	
	var result = rollL5R( nb_dice, nb_keep, specialized );

	this.resNode.innerHTML = " : " + result.res;
	this.detailNode.innerHTML = result.details;
    }
    else if( this._type === "Fate" ) {
	// Comp level
	var comp = Number( this.inComp.selectedIndex ) - 2;
	var result = rollFate( comp );
	this.resNode.innerHTML = " : " + result.res;
	this.detailNode.innerHTML = result.details;
    }
    else {
	//DEBUG console.log( "__CLICK unk=",this._type );
    }
};
RolldiceWidget.prototype.parseField = function (fieldValue) {
    // Split with ":"
    var items = fieldValue.split( ":" );
    //DEBUG console.log( "__PF it="+items);
    if( items.length === 3 && this._type === undefined ) {
	this._type = items.shift();
	console.log( "__TYPE "+this._type );
    }
    if( items.length === 2 && this._label === undefined ) {
	this._label = items.shift();
	console.log( "__LABEL "+this._label );
    }
    if( items.length === 1 && this._value === undefined ) {
	this._value = items.shift();
	console.log( "__VAL "+this._value );
    }
};
RolldiceWidget.prototype.parseValue = function (diceType, strValue) {
    // according to type
    if( diceType === "L5R" ) {
	// valStr : nbDice+g+nbKept+[s]
	// ends with 's'
	this._specialized = false;
	if( strValue.endsWith( "s" ) ) {
	    this._specialized = true;
	    strValue = strValue.slice( 0, -1);
	} 
	// nbDice
	var numbers = strValue.split( "g" );
	//DEBUG console.log( "__PARSE numbers="+numbers );
	this._nbDice = Number( numbers[0] );
	this._nbKeep = Number( numbers[1] );
	//DEBUG console.log( "__PARSE nb="+this._nbDice+" nk="+this._nbKeep+" spe=" + this._specialized );
    }
    // Fate
    else if( diceType === "Fate" ) {
	this._compLevel = Number( strValue ) + 2;
	//DEBUG console.log( "__PARSE lvl="+this._compLevel );
    }
};

 
// Now we got a widget ready for use
exports["rolldice"] = RolldiceWidget;

})();
