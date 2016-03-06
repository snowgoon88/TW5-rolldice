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
    rollDice = function ( max ) {
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
    // Div 
    this.divNode = $tw.utils.domMaker( "div", {
	"class" : "rd-dice"
    });
    // Render into the dom the Children of the node
    var spanNode = $tw.utils.domMaker( "span", {
	"class" : "rd-label"
    });
    this.renderChildren(spanNode, null);
    this.divNode.appendChild(spanNode);
    // Input
    this.inDiceNode = $tw.utils.domMaker( "input", {
	"class" : "rd-nb-dice",
	attributes : { type:"number",
		       value:1, min:1, max:20, style:"width: 2.5em"}
    });
    this.divNode.appendChild(this.inDiceNode);
    var textNode = this.document.createTextNode(" g ");
    this.divNode.appendChild(textNode);
    this.inKeepNode = $tw.utils.domMaker( "input", {
	"class" : "rd-nb-keep",
	attributes : { type:"number",
		       value:1, min:1, max:20, style:"width: 2.5em"}
    });
    this.divNode.appendChild(this.inKeepNode);
    this.inSpecNode = $tw.utils.domMaker( "input", {
	"class" : "rd-spec",
	attributes : { type:"checkbox" }
    });
    this.divNode.appendChild(this.inSpecNode);
    textNode = this.document.createTextNode(" Spéc. ");
    this.divNode.appendChild(textNode);
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
    this.divNode.appendChild( this.rollBtnNode );
    // Results
    this.resNode = $tw.utils.domMaker( "span", {
	"class" : "rd-result"
    });
    textNode = this.document.createTextNode(" : -");
    this.resNode.appendChild(textNode);
    this.divNode.appendChild( this.resNode );
    textNode = this.document.createTextNode(" [");
    this.divNode.appendChild(textNode);
    this.detailNode = $tw.utils.domMaker( "span", {
	"class" : "rd-details"
    });
    this.divNode.appendChild( this.detailNode );
    textNode = this.document.createTextNode("]");
    this.divNode.appendChild(textNode);			     
    // Insert the elements into the DOM
    parent.insertBefore(this.divNode,nextSibling);
    this.domNodes.push(this.divNode);
    this.domNodes.push(this.inDiceNode);
    this.domNodes.push(this.inKeepNode);
    this.domNodes.push(this.inSpecNode);
    this.domNodes.push(this.rollBtnNode);
    this.domNodes.push(this.resNode);
    this.domNodes.push(this.detailsNode);
    
    // Render into the dom
    // this.renderChildren(this.parentDomNode,nextSibling);
};

RolldiceWidget.prototype.onClickEvent = function (event) {
    console.log( "__ROLL" );
    // console.log( "onClick.event: " + event );
    // console.log( "onClick.event.target: " + event.target );
    // var elem = event.target;
    // console.log( "elem: " + elem.tagName );
    // console.log( "elem: " + elem.id );
    //var src_elem = document.getElementById(id);
    // var src_elem = event.target.parentElement;
    // var out_elem = src_elem.getElementsByClassName('result');
    // var details_elem = src_elem.getElementsByClassName('details');
    // var nb_elem  = src_elem.getElementsByClassName('nbDice');
    // var keep_elem = src_elem.getElementsByClassName('nbKeep');
    // var spe_elem = src_elem.getElementsByClassName('specialized');

    // var nb_dice = Number(nb_elem[0].value);
    // var nb_keep = Number(keep_elem[0].value);
    // var specialized = spe_elem[0].checked;
    var nb_dice = Number( this.inDiceNode.value );
    var nb_keep = Number( this.inKeepNode.value );
    var specialized = this.inSpecNode.checked;
    console.log( "nb="+nb_dice+" nk="+nb_keep+" spe=" + specialized );
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
	var roll = rollDice(10);
	if( roll == 1 && specialized )
	    roll = rollDice(10);
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
    this.resNode.innerHTML = " : " + res;
    this.detailNode.innerHTML = details;
};

 
// Now we got a widget ready for use
exports["rolldice"] = RolldiceWidget;

})();
