<a href="https://nodei.co/npm/p-et-alia/"><img src="https://nodei.co/npm/p-et-alia.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/p-et-alia">

# p-et-alia

p-et-alia (pronounced ["petalia"](https://carta.anthropogeny.org/moca/topics/left-occipital-right-frontal-petalia-torque-asymmetry)) is a suite of web components beginning with the letter ("p-*") that recognizes a fundamental asymmetry in how data should flow in an application -- mostly down, but passing up can't be avoided occasionally.  [Note, these components had to change their name due to VSCode rudeness].

This package contains two primary custom elements:  p-d and p-u, which stand for "pass down" and "pass up."

These two components dream the impossible dream -- be able to progressively, declaratively, glue native DOM / web components together, regardless of how the elements got there.

Use cases:

1.  If you just need to connect some elements of a mostly static or [server-rendered](https://www.similartech.com/categories/framework) web site, these components provide a light weight way of doing that.
2.  These components allow you to keep code-centric **builds** at bay as much as possible.  Why is this important?  Because browsers can process HTML significantly faster than JS.  That doesn't mean you have to edit HTML files.  Theoretically, you could edit in JavaScript and benefit from the tooling (type checks, etc), but compile to HTML for optimum performance. 

These components emphasize simplicity and small size -- to be used for 30,000 ft. above the ground component gluing.  Think connecting a TV to a Roku, rather than connecting tightly coupled micro chips together.  See the section "p-s" for more discussion about this. 

Both p-d and p-u have an attribute/property, "on" that specifies an event to monitor for.  They both attach an event listener for the specified event to the previous (non p-*) element.

When this event monitoring is enabled, if the previous element is disabled, the disabled attribute is removed (more on that later).

##  Downward flow amongst siblings with p-d. 

p-d  passes information from that previous sibling's event down the p-d instance's sibling list.  It stops event propagation (by default).  Sample markup is shown below: 

```html
<!--- verbose syntax -->
<div style="display:grid">
    <input/>                                                                    
    <p-d on="input" to="url-builder" prop="input" val="target.value" m="1"></p-d>
    <url-builder prepend="api/allEmployees?startsWith="></url-builder>    
    <p-d on="value-changed" to="fetch-data" prop="url" val="detail.value" m="1"></p-d>
    <fetch-data></fetch-data>                                                   
    <p-d on="fetch-complete" to="my-filter" prop="input" val="detail.value" m="2"></p-d>
    <my-filter select="isActive"></my-filter>                                   
    <p-d on="value-changed"  to="#activeList" prop="items" val="detail.value" m="1"></p-d>
    <my-filter select="!isActive"></my-filter>                                  
    <p-d on="value-changed"  to="#inactiveList" prop="items" val="target.value" m="1"></p-d>
    <h3>Active</h3>
    <my-grid id="activeList"></my-grid>
    <h3>Inactive</h3>
    <my-grid id="inactiveList"><my-grid>
</div>
```

##  The anatomy of the p-d attributes / properties.

"m" is an optional attribute/property that indicates the maximum number of matching elements that are expected to be found.  If not specified, all the downstream siblings are checked, which can be wasteful.

"on" specifies the name of the event to listen for.

"to" is a css selector, similar to css selectors in a css file.  Only the way that selector is used is as a test on each of the next siblings after the p-d element.  The code uses the "matches" method to test each element for a match.

"prop" refers to the name of a property on the matching elements which need setting.  

"val" is a JavaScript path / expression for where to get the value used for setting.  The path is evaluated from the JavaScript event that gets fired.  For example "a.b.c" type expressions are allowed.  No ! or other JavaScript expressions is currently supported.  If the path is a single ., then it will pass the entire event object.  

If any of the sub-expressions evaluate to null, then the target element(s) aren't modified.

All the components described in this document support an attribute (not a property), "debug".  If the attribute is present, the code will break every time the event it is monitoring for fires.

##  But what if the way my elements should display isn't related to how data should flow?

Note that we are suggesting, in the markup above, the use of the CSS grid (display: grid).  The CSS grid allows you to specify where each element inside the CSS Grid container should be displayed.

It appears that the css flex/grid doesn't count elements with display:none as columns or rows.  So all the non visual components, which haven't seen the light on the benefit of setting display:none, could be marked with an attribute, nv (non visual) and apply a style for them, i.e.: 

```html
<style>
[nv]{
    display: none;
}
</style>
```

Since p-* are all non visual components, they are given display:none style by default.

Another benefit of making this explicit:  There is likely less overhead from components with display:none, as they may not get added to the [rendering tree](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/#Render_tree_construction).


## Compact notation

One can't help noticing quite a bit of redundancy in the markup above.  We can reduce this redundancy if we apply some default settings. 

1)  If no css specifier is defined, it will pass the properties to the next element.
2)  If no value is specified, it will see if detail.value exists.  If not it will try target.value.

We can also forgo quotes when not needed.

What we end up with is shown below:

```html
<!-- abreviated syntax -->
<style>
[nv]{
    display:none;
}
</style>
<div style="display:grid">
    <input/>                                                                    
    <p-d on=input prop=input></p-d>
    <url-builder prepend="api/allEmployees?startsWith=" nv></url-builder>   
    <p-d on=value-changed  prop=url></p-d>
    <fetch-data></fetch-data>                                                   
    <p-d on=fetch-complete to=my-filter prop=input m=2></p-d>
    <my-filter select=isActive nv></my-filter>                                   
    <p-d on=value-changed  to=#activeList prop=items m=1></p-d>
    <my-filter select=!isActive nv></my-filter>                                  
    <p-d on=value-changed  to=#inactiveList prop=items m=1></p-d>
    <h3>Active</h3>
    <my-grid id=activeList></my-grid>
    <h3>Inactive</h3>
    <my-grid id=inactiveList><my-grid>
</div>
```

## A spoonful of [syntactic sugar](https://www.google.com/search?q=a+spoonful+of+syntactic+sugar&rlz=1C1CHBF_enUS834US834&source=lnms&tbm=isch&sa=X&ved=0ahUKEwjf8uuemdDiAhWKm-AKHTTwAy4Q_AUIESgC&biw=1707&bih=850)

One of the beauties of html / attributes vs JavaScript is that attributes can be defined in such a way that configuring a web component can almost read like English:

```html
<visual-ize display calendar with-time-period=year as mobius-grid with dali-esque clocks></visual-ize>
```

If the attributes need to be dynamic, it is easiest to read if the binding syntax can express those attributes directly, "pulling in" the values from somewhere:

```JavaScript
//Pseudo code
/* html */`<visual-ize display?=${showOrhide} ${directObjectType} with-${scope} 
    as ${displayType} with ${themed} ${decorationType}></visual-ize>`
```

But p-* elements, as demonstrated so far, operate more on a "push values down to specified targets when events are fired" approach, rather than "push values up to specified state(either declaratively or via event handlers), and pull values down from state declaratively into target properties." The latter approach seems more natural to read, especially as the communication appears more "mutual," and looking at either tag (source vs destination) gives a clue as to what is going on.  

We want to accomplish this with something that is actually meaningful, and that doesn't add superfluous, non verifiable syntax, while sticking to unidirectional data flow.

So we provide support for a slight variation in the syntax:

```html
<label for=lhs>LHS:</label><input id=lhs> 
<p-d on=input to=if-diff[-lhs] m=1></p-d>
<label for=rhs>RHS:</label><input id=rhs>
<p-d on=input to=if-diff[-rhs] m=1></p-d>
...
<if-diff if -lhs equals -rhs data-key-name=lhs-matches-rhs></if-diff>
...
<div data-lhs-matches-rhs="0">
    <template>

    </template>
</div>
```

What does p-d do with this syntax?

Since 

1. No "prop" attribute is found, and 
2. Since the "to" attribute follows a special pattern, where
 - the expression ends with an attribute selector, and where 
 - that attribute starts with a dash (or data-)
 
then the "prop" attribute defaults to the attribute following the first dash i.e.  "lhs" or "rhs."  lisp-case to camelCase property setting is supported.  I.e. to="[data-my-long-winded-property-name]" will set the property with name "myLongWindedPropertyName."

Furthermore, no match will be found if if-diff does not contain the -lhs (or -rhs) "pseudo" attribute.

## [Demo 1](https://jsfiddle.net/bahrus/y8moqgrb/)

##  Seeing through Walls

Consider the following markup:

```html
<details>
	<summary>my-custom-element Editor</summary>
	<input/>
	<p-d on=input to=my-custom-element[-lhs] m=1></p-d> 
</details>
<my-custom-element -lhs></my-custom-element>
```

Clearly, "my-custom-element" is below the p-d element.  The problem is p-d wasn't born on planet Krypton, and can't see that.  To allow p-d to cross the details wall, provide the "from" attribute:

```html
<details>
	<summary>my-custom-element Editor</summary>
	<input/>
	<p-d on=input from=details to=my-custom-element[-lhs] m=1></p-d> 
</details>
<my-custom-element -lhs></my-custom-element>
```

## Recursive sibling drilldown with p-d-r -- Invitation Only

To keep performance optimal and scalable, the p-d element only tests downstream siblings -- not children of siblings.  However, the use case for being able to drilldown inside a DOM node is quite high.  Unlike Polymer, permission to do this must be granted explicitly, using the p-d-if attribute on elements where drilldown is needed.  The value of the attribute is used to test against the p-d element (hence you will want to specify some marker, like an ID, on the p-d element, which can be used to validate the invitation.)

```html   
    <text-box></text-box>                                                               
    <p-d-r on="input" to="url-builder" prop="input"></p-d-r>
    <h3>Search Employees</h3>
    <div p-d-if="p-d-r">
        <url-builder></url-builder>
        <my-filter></my-filter>
    </div>
```


##  Defining a piping custom element

A convenience function is provided, that allows you to generate a "pipe" or "action" custom element with as few keystrokes as possible.

Here's what the syntax looks like in a JavaScript file:

```JavaScript
import {PDQ} from 'p-d.p-u/PDQ.js';
PDQ.define('my-pipeline-action', input => {
    // do stuff
    return myProcessedResult;
});
```

This will create a custom element with name "my-pipeline-action".  It applies the second argument, a function, to the "input" property of the custom element, every time the input changes.  It then stores the result in property "value", and emits an event with name "value-changed":

```html
<my-pipeline-action></my-pipeline-action>
<p-d on="value-changed" prop="input">
```

As with all custom element definitions, some care should be taken to ensure that the custom element names are unique.  This could be challenging if generating lots of small custom elements, like shown above, to be used in a large application, especially if that large application combines somewhat loosely coupled content from different teams, who also generate many custom elements.  Hopefully, the "Scoped Custom Element Registries" will help make this issue disappear in the future.

PDQ also supports multiple parameters:

```html
    <script type="module">
        import {PDQ} from '../PDQ.js';
        PDQ.define('a-b', ({alpha, beta, gamma}) =>{
            return alpha + beta + gamma;
        })
    </script>
    <a-b></a-b>
```

## Location, Location, Location

If the issue of mixing JavaScript script tags inside markup is *not* a serious concern for you, but you do want to reap the benefits from making the data flow unidirectionally, without having to jump away to see the code for one of these piping custom elements, you can "inline" the code quite close to where it is needed.  For now, this will only work if you essentially "hard code" the location of PDQ to a CDN with support for bare import specifiers:

```html
<p-d on="selected-root-nodes-changed" prop="input" val="target"></p-d>
<script type="module">
    import {PDQ} from 'https://unpkg.com/p-et-alia@0.0.4/PDQ.js?module';
    PDQ.define('selected-node-change-handler', (input) =>{
        if((typeof(nodeList) === 'undefined') || !nodeList.items) return;
        const idx = nodeList.firstVisibleIndex;
        nodeList.items = nodeList.items.slice();
        nodeList.scrollToIndex(idx);
    })
</script>
<selected-node-change-handler></selected-node-change-handler>
```

With [package name map](https://github.com/WICG/import-maps) support, the import statement could look more like the previous example:

```JavaScript
import {PDQ} from 'p-et-alia/PDQ.js';
```

**NB**  There is now a [nice polyfill](https://www.npmjs.com/package/es-module-shims) for import maps.

Now if you add a breakpoint, it will take you to the code, where you can see the surrounding markup.  But you will only see the *markup*, not the actual live elements, unfortunately.  Just saying.

## Debugging Tips

Although the markup / code above is a little more verbose than standard ways of adding event handlers, it does have some benefits.  If you do view the live elements, you can sort of "walk through" the DOM elements and custom elements, and see how data is transformed from step to step.  This would be particularly easy if there were a nice browser extension that can quickly view web component properties, regardless of their flavor.  Unfortunately, [existing](https://chrome.google.com/webstore/detail/polyspector/naoehbibkfilaolkmfiehggkfjndlhpd?hl=en) [extensions](https://chrome.google.com/webstore/detail/stencil-inspector/komnnoelcbjpjfnbhmdpgmlbklmicmdi/related) don't seem to support that yet. 

But I am quite excited to see Firefox nightly making some [giant leaps forward](https://blog.nightly.mozilla.org/2018/09/06/developer-tools-support-for-web-components-in-firefox-63/) in supporting universal web component debugging.

In addition, you might find the following helpful.  What follows is Chrome-centric discussion, and requires support for dynamic import:

In the console, type:

import('https://unpkg.com/xtal-shell@0.0.7/$hell.js');

Then make you sure you select the Elements tab in the dev tools, in such a way that you can see both the elements and the console at the same time.

Then, as you inspect custom elements, you can type this in the console:

$hell.getProperties($0)

You should see an object, which you will want to expand.  This will list the values of Polymer properties, as well as observedAttributes, as well as Object.getOwnProperties.  It also displays the constructor, which you can right-click on, and go to definition to see the code for the web component.

Now as you select other elements in the elements tab, in the console, hit the up arrow and enter (so you don't have to keep typing "$hell.getProperties($0)" each time).  You will have to keep expanding the result.


## Conditional Processing

p-d can be configured to test the event target to make sure it matches a css test.  This is done with the "if" attribute / property:

```html
<div>
    <a href="link1">Link 1</a>
    <a href="link2">Link 2</a>
</div>
<p-d on="click" if="a"></p-d>
```

## Disabling the default behavior of initialization (Warning:  Wonky discussion)

One of the goals of these components is they can load asynchronously, and the output should, as much as possible, not depend on when these components load.

So what happens if an element fires an event, before p-d has loaded and started listening?  What if you want to monitor a property that starts out with some initial value?

To accommodate these difficulties, by defaut, a "fake" event is "emitted" just before the event connection is made.  I believe this default choice greatly improves the usefulness of these components.  However, there are situations where we definitely don't want to take action without actual user interaction (for example, with button clicks). To prevent that from happening, add attribute **skip-init**.

Another subtle feature you might find useful:  It was mentioned before that p-d removes the disabled attribute after latching on the event handler.  But what if you want to utilize multiple p-d's on the same element?  We don't want to remove the disabled attribute until all of the elements have latched on.  

You can specify the "depth" of disabling thusly:

```html
    <!-- Parse the address bar -->
    <xtal-state-parse disabled=2 parse=location.href level=global 
        with-url-pattern="id=(?<storeId>[a-z0-9-]*)">
    </xtal-state-parse>
    <!-- If no id found in address bar, create a new record ("session") -->
    <p-d on=no-match-found to=purr-sist[write] prop=new val=target.noMatch  m=1 skip-init></p-d>
    <!-- If id found in address bar, pass it to the persistence reader and writer -->
    <p-d on=match-found to=purr-sist prop=storeId val=target.value.storeId m=2 skip-init></p-d>
    <!-- Read stored history.state from remote database if saved -->
    <purr-sist read></purr-sist>
```

What if you want your element to remain disabled after all the p-d's have latched?  Just set the number one higher than the number of next sibling p-d's.


## Counter test

p-d, by itself, is not exactly turing-complete.  Even a simple "counter" is beyond its abilities.  A previous attempt to pile in enough hooks to do this proved clumsy.

A nice companion custom element that works well together with p-d is [xtal-decorator](https://www.webcomponents.org/element/xtal-decorator).

With these two combined the counter would look like:

```html
<xtal-deco><script nomodule>({
    on: {
        click:{
            this.counter++;
        }
    },
    props:{
        counter: 0
    }
})</script></xtal-deco>
<button>Increment</button>
<p-d on=counter-changed prop=textContent></p-d>
<div></div>
``` 

## Targeted, tightly-coupled passing with p-u ("partly-untested")   

I would suggest that for most applications, most of the time, data will naturally flow in one direction.  Those of us who read and write in a [downward direction](https://www.quora.com/Are-there-any-languages-that-read-from-bottom-to-top) will probably want to stick with that direction when arranging our elements.  But there will inevitably be points where the data flow must go up -- typically in response to a user action.  

That's what p-u provides.  As the name suggests, it should be used sparingly.  

p-u can pass data in any direction, but the primary intent is to pass it up the DOM tree to a precise single target.  What *was* the CSS selector, before the opening brace, now becomes a simple ID.  No # before the ID is required (in fact it will assume the ID starts with # if you do this).  If the selector starts with  a slash, it searches for an element with that ID from (root) document, outside any shadow DOM.  If it starts with ./, it searches within the shadow DOM it belongs to  ../ goes up one level. ../../ goes up two levels, etc.  Basically we are emulating the path syntax for imports.

Sample markup:

```html
 <p-u on="click" to="/myTree" prop="toggledNode" val="target.node"></p-u>
```

Unlike p-d, p-u doesn't worry about DOM nodes getting created after any passing of data takes place.  If you are using p-u to pass data to previous siblings, or parents of the p-u element, or previous siblings of the parent, etc, then it is quite likely that the DOM element will already have been created, as a natural result of how the browser, and frameworks, typically render DOM.  If, however, you choose to target DOM elements out of this range, it's more of a crapshoot, and do so at your own risk.


Another objection to this approach is that there needs to be coordination between  these potentially disparate areas of the DOM, as far as what the agreed ID should be.  This is obviously not a good approach if you are designing a generic component.  Do you really want to tell the person using your component that they need to plop a DOM element with a specific ID, in order to receive the data?  I didn't think you would.  So p-u should probably not be used for this use case (a way of passing information from a generic, reusable component).

For that we have:

## Punting [Untested]

```html
<p-unt on=click dispatch to=myEventName prop=toggledNode val=target.node composed bubbles></p-unt>
```

Another way you can make data "cycle" is by placing a p-* element at the beginning -- if no previous non p-* elements are found, the event handler is attached to the parent.

## Deluxe version [partially untested]

Another custom element, p-d-x, extends p-d and adds these additional features;

1)  You can specify adding / removing a css class (untested).
2)  You can specify a nested path that needs setting.
3)  You can copy all properties of the source to the target if you specify to="{.:.}" (partly tested).
4)  For attribute val, more extended expressions are allowed using notation:  a.b.c.fn(param1,param2).d.  fn is a name of a function, and the values inside the paranthesis are converted to strings.  E.g.

```html
<p-d-x on=value-changed to=textContent val=target.value.querySelector(FahrenheitToCelsiusResult).textContent></p-d-x>
```


There is a special string used to refer to an element of [composedPath()](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath):

```html
<p-u on="click" if="span" to="/myTree{toggledNode:composedPath_0.node}"></p-u>
```

This pulls the node from event.composedPath()[0].node.

## Computed values

You can create little p-d-x extension custom elements thusly:

```TypeScript
import {extend} from 'p-et-alia/p-d-x.js';

extend('slot-bot', {
    valFromEvent: (e: Event) =>{
        const slot = e.target as HTMLSlotElement;
        const ret = slot.assignedElements().map(el => {
            const clone = el.cloneNode(true) as HTMLElement;
            clone.removeAttribute('slot');
            return clone.outerHTML;
        }).join('');
        return ret;
    }
})
```

```html
    <!-- Options to vote on, passed in via light children.  -->
    <slot name="options"></slot>
    <p-d-x-slot-bot on="slotchange" prop="innerHTML"></p-d-x-slot-bot>
    <xtal-radio-group-md name="pronoun" data-flag="voted" data-allow-voting="-1"></xtal-radio-group-md>
```

##  Differences to other frameworks - data-passing chain vs centralized control

While these components provide a kind of "framework built with web components", similar to Polymer, there's a fundamental difference.  Unlike Polymer (and other competing frameworks), these components don't depend on the existence of a controlling component which manages state.  Instead, it is a little more [JQuery](https://w3techs.com/technologies/overview/javascript_library/all) like.  Why not let each component decide how best to manage its own state?  It is a "peer-to-peer binding framework."  This may be more appealing for some [people](https://www.youtube.com/watch?v=RplnSVTzvnU) / use cases, less appealing to others.  

###  All Hail, Keeper of All Our Stories! 

What if one of the components in your data passing chain is an unreliable dog of a component?  Perhaps the complexity of your application is such that limiting a unified "state" to simply passing data between components doesn't seem practical.    Who should rule state then?  Redux?  Mobx?  Standardizing, forevermore, on setState of some framework you will be stuck with forever, version after version, no matter what wrong, cruel and stupid turns it takes?   What better  thing to bind components together than the keeper of all history, [history.state](https://www.youtube.com/watch?v=IRJ8uFNmzqU)?  

One candidate for providing a hand with managing history.state is the AMP's [amp-bind](https://amp.dev/documentation/components/amp-bind/?referrer=ampproject.org) component, which appears to rely on history.state as its unifying system of record.

 [xtal-state](https://www.webcomponents.org/element/xtal-state), [purr-sist](https://www.webcomponents.org/element/purr-sist) and [bi-st](https://www.webcomponents.org/element/bi-st) also offer their services:



```html
<div>
    <xtal-state-watch watch level=local></xtal-state-watch>
    <p-d on=history-changed to=#handleViewableNodesChanged prop=firstVisibleIndex val=target.history m=1></p-d>
    ...
</div>
```

Note the use of the attribute "level='local'".  This limits the scope of the state to the local div DOM element.  Then if you need to update this local state, add another tag:

```html
<div>
    ...
    <iron-list>
        ...
    </iron-list>
    <p-d on=scroll prop=history val=target.firstVisibleIndex></p-d>
    <xtal-state-commit level=local rewrite href=/scroll></xtal-state-commit>
...
</div>
```

<details>
<summary>Limitations
    <h3>TodoMVC or not TodoMVC</h3>
</summary>



These "connector components" would be useless if there were no, you know, components to connect.  It would be like blockchain without people actually engaging in commerce.  As such, the p-et-alia components want you to know that they are very pro-component, even if they are also perfectly content gluing components together on a UI that is just a composition of components, without any central component controller.  

Recursively, some areas of said components may also involve gluing loosely coupled sub-components together, so these could also be used there reduce boilerplate, expensive JavaScript.

However, there are many scenarios where some UI functionality is sufficiently, and intricate that "gluing together" loosely coupled components isn't the right mindset.  Instead of connecting a Roku to a TV, think implementing a swiss watch.

![](https://deployant.com/wp-content/uploads/2016/09/patek-repeater-perpetual-tourbillon.jpg)

An example of this is the classic [TodoMVC](http://todomvc.com/) application.  Could such a thing be built without a "Model" and "Controller" that drive the view, without triggering a gag reflex? 
</details>


## Viewing Your Element

```
$ npm run serve
```

## Running Tests

```
$ npm tests
```

## p-s

I mentioned at the beginning that there could be performance issues if using these components inside a virtual list, for example.  Although performance issues have not yet been observed, the concern is based on observations made by the [ag-grid](https://www.ag-grid.com/ag-grid-performance-hacks/) team:

>The grid needs to have mouse and keyboard listeners on all the cells so that the grid can fire events such as 'cellClicked' and so that the grid can perform grid operations such as selection, range selection, keyboard navigation etc. In all there are 8 events that the grid requires at the cell level which are click, dblclick, mousedown, contextmenu, mouseover, mouseout, mouseenter and mouseleave.

>Adding event listeners to the DOM results in a small performance hit. A grid would naturally add thousands of such listeners as even 20 visible columns and 50 visible rows means 20 (columns) x 50 (rows) x 8 (events) = 8,000 event listeners. As the user scrolls our row and column virtualisation kicks in and these listeners are getting constantly added and removed which adds a lag to scrolling.

...

>So instead of adding listeners to each cell, we add each listener once to the container that contains the cells. That way the listeners are added once when the grid initialises and not to each individual cell.

We can already do that somewhat with p-d -- wrap multiple elements inside a div tag, and then add p-d after the div tag.  The problem is that will only pass data to DOM elements under the p-d tag.  We can't pass data down to elements below the element that actually triggered the event.

For that we have p-s, which stands for "pass sideways".  It relies a little on the honor code.  Depending on where it is placed, it could result in data flow not being downward.  In the example below, it is placed in a safe place:

```html
<div>
    <button>a</button>
    <button>b</button>
    <button>c</button>
    <p-s on=click if=button prop=innerText val=target.innerText skip-init></p-s>
    <div></div>
</div>
```