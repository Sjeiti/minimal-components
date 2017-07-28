/**
 * Manipulate existing stylesheets.
 * @name style
 */

export {select as selectRule, changeRule, addRule, getStyle, getSheetByMedia};

// StyleSheet.addRule shim
if (document.styleSheets[0].addRule===undefined) {
  window.StyleSheet.prototype.addRule = function(selector,value){
    return this.insertRule(selector + '{' + value + '}', this.cssRules.length);
  };
}

let forEach = Array.prototype.forEach
  ,aoStyleSheets = document.styleSheets
  ,bReversedSelectors = (function(){
    // creates a new selector and checks if the rule comes out in reverse
    let oSheet = aoStyleSheets[0]
      ,aRules = oSheet.cssRules
      ,iNumRules = aRules.length
      ,sSelector = 'span#a.c.d.b'
      ,sSelectorResult
      ,bIsReversed
    ;
    oSheet.addRule(sSelector, 'font-weight:inherit');
      sSelectorResult = aRules[iNumRules].selectorText;
      bIsReversed = sSelectorResult!=sSelector;
    oSheet.deleteRule(iNumRules);
    return bIsReversed;
  })()
;

/**
 * Reverses a selector (because IE rearanges selectors)
 * Turns span#a.c.d.b into span.b.c.d#a
 * @param {String} selector
 * @returns {String} Reversed selector
 */
function getReverse(selector){
  let oSheet = aoStyleSheets[0]
    ,aRules = oSheet.cssRules
    ,iNumRules = aRules.length
    ,sSelectorResult
  ;
  oSheet.addRule(selector, 'font-weight:inherit');
  sSelectorResult = aRules[iNumRules].selectorText;
  oSheet.deleteRule(iNumRules);
  return sSelectorResult;
}

/**
 * Get an array of CSSStyleRules for the selector string.
 * @param {String} selector
 * @returns {iddqd.style.rule}
 */
function select(selector){
  selector = bReversedSelectors?getReverse(parseSelector(selector)):parseSelector(selector);
  let aStyles = rule(selector);
  forEach.apply(aoStyleSheets,[function(styleSheet){
    let aRules = styleSheet.cssRules;
    aRules && forEach.apply(aRules,[function (oRule) {
      if (oRule.constructor===window.CSSStyleRule) {
        //console.log('oRule.selectorText',oRule.selectorText); // log
        if (oRule.selectorText.split(' {').shift()==selector) {
          aStyles.push(oRule);
        }
      }
    }]);
  }]);
  return aStyles;
}

/**
 * Parse a selector string correctly
 * @param {string} selector
 * @returns {string}
 */
function parseSelector(selector) {
  return selector.replace('>',' > ').replace('  ',' ');
}

/**
 * Change an existing selector with the rules parsed in the object.
 * @param {String} selector
 * @param {Object} rules
 * @returns {CSSStyleRule[]} The Array created by select
 */
function changeRule(selector,rules) {
  return select(selector).set(rules);
}

/**
 * Adds a new rule to the selector
 * @param selector
 * @param rules
 * @returns {CssRule}
 */
function addRule(selector,rules) {
  let oSheet,sRules = '';
  for (let rule in rules) {
    if (rules.hasOwnProperty(rule)) sRules += rule+':'+rules[rule]+';';
  }
  oSheet = aoStyleSheets[0];
  oSheet.addRule(selector,sRules);
  return oSheet.cssRules[oSheet.cssRules.length-1];
}

/**
 * A array of CSSStyleRules enhanced with some methods.
 * @returns {CSSStyleRule[]}
 */
function rule(selector) {
  let aStyles = [];
  aStyles.toString = function(){return '[object style.rule:'+selector+']';};
  aStyles.set = function (key,prop) {
    if (typeof key==='string') {
      set.apply(aStyles,[key,prop]);
    } else {
      for (let s in key) {
        set.apply(aStyles,[s,key[s]]);
      }
    }
  };
  function set(key,prop) {
    aStyles.forEach(function (rule) {
      let oStyle = rule.style;
      oStyle.removeProperty(key);
      oStyle[key] = prop;
    });
  }
  return aStyles;
}

/**
 * Getstyle method from Quirksmode
 * @see: http://www.quirksmode.org/dom/getstyles.html
 * @param el
 * @param styleProp
 * @returns {*|string}
 */
function getStyle(el,styleProp) {
  return el.currentStyle?el.currentStyle[styleProp]:document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
}

// todo: document
function getSheetByMedia(type) {
  let oSheet;
  for (let i=0,l=document.styleSheets.length;i<l;i++) {
    oSheet = document.styleSheets[i];
    for (let j=0,ll=oSheet.media.length;j<ll;j++) {
      if (oSheet.media[j]===type) break;
    }
  }
  return oSheet;
}

  // Expose private methods
/*  return {
    toString: function(){return '[object rootStyle]';}
    ,select: select
    ,changeRule: changeRule
    ,addRule: addRule
    ,get: getStyle
    ,getSheetByMedia: getSheetByMedia
  };*/
/*align-items align-self animation-delay animation-direction animation-duration animation-fill-mode animation-iteration-count animation-name animation-play-state animation-timing-function backface-visibility background-attachment background-clip background-color background-image background-origin background-position background-repeat background-size border-bottom-color border-bottom-left-radius border-bottom-right-radius border-bottom-style border-bottom-width border-collapse border-image-outset border-image-repeat border-image-slice border-image-source border-image-width border-left-color border-left-style border-left-width border-right-color border-right-style border-right-width border-spacing border-top-color border-top-left-radius border-top-right-radius border-top-style border-top-width bottom box-shadow caption-side clear clip color content counter-increment counter-reset cursor direction display empty-cells flex-basis flex-direction flex-grow flex-shrink float font-family font-size font-size-adjust font-stretch font-style font-variant font-weight height ime-mode justify-content left letter-spacing line-height list-style-image list-style-position list-style-type margin-bottom margin-left margin-right margin-top marker-offset max-height max-width min-height min-width opacity order outline-color outline-offset outline-style outline-width overflow overflow-x overflow-y padding-bottom padding-left padding-right padding-top page-break-after page-break-before page-break-inside perspective perspective-origin pointer-events position quotes resize right table-layout text-align text-decoration text-indent text-overflow text-shadow text-transform top transform transform-origin transform-style transition-delay transition-duration transition-property transition-timing-function unicode-bidi vertical-align visibility white-space width word-break word-spacing word-wrap z-index -moz-appearance -moz-background-inline-policy -moz-binding -moz-border-bottom-colors -moz-border-left-colors -moz-border-right-colors -moz-border-top-colors -moz-box-align -moz-box-direction -moz-box-flex -moz-box-ordinal-group -moz-box-orient -moz-box-pack -moz-box-sizing -moz-column-count -moz-column-gap -moz-column-rule-color -moz-column-rule-style -moz-column-rule-width -moz-column-width -moz-float-edge -moz-font-feature-settings -moz-font-language-override -moz-force-broken-image-icon -moz-hyphens -moz-image-region -moz-orient -moz-outline-radius-bottomleft -moz-outline-radius-bottomright -moz-outline-radius-topleft -moz-outline-radius-topright -moz-stack-sizing -moz-tab-size -moz-text-align-last -moz-text-blink -moz-text-decoration-color -moz-text-decoration-line -moz-text-decoration-style -moz-text-size-adjust -moz-user-focus -moz-user-input -moz-user-modify -moz-user-select -moz-window-shadow clip-path clip-rule color-interpolation color-interpolation-filters dominant-baseline fill fill-opacity fill-rule filter flood-color flood-opacity image-rendering lighting-color marker-end marker-mid marker-start mask mask-type shape-rendering stop-color stop-opacity stroke stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-rendering vector-effect*/

/*
 * A array of CSSStyleRules enhanced with some methods.
 * @name rule
 * @namespace iddqd.style.rule
 * @returns {CSSStyleRule[]}
 */
/*iddqd.ns('iddqd.style.rule',function() {
  'use strict';

  let aStyles = [];

  aStyles.set = function(key,prop){
    if (typeof key==='string') {
      set.apply(aStyles,[key,prop]);
    } else {
      for (let s in key){
        set.apply(aStyles,[s,key[s]]);
      }
    }
  };

  function set(key,prop){
    aStyles.forEach(function(rule){
      let oStyle = rule.style;
      oStyle.removeProperty(key);
      oStyle[key] = prop;
    });
  }

  return aStyles;
});*/