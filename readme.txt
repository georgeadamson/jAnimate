(Work in progress)

jQuery plugin to allow jQuery's animate() method to accept the following as if they're normal css properties:

 - rotate: "(angle)" (also accepts just angle)
 - skew: "(ax,ay)" (also accepts just ax to set both values)
 - translate: "(tx,ty)" (also accepts just tx to set both values)
 - scale: "(x,y)" (also accepts just x to set both values)
 - matrix: "(a,b,c,d,tx,ty)"
 - transform: matrix(a,b,c,d,tx,ty) rotate(angle) skew(ax,ay) translate(tx,ty) scale(x,y)
 - transform-origin: x y

Automatically decides whether to use -moz-transform or -webkit-transform etc.

It is based on a background-position animation plugin that I wrote a while back and finally found a use for it when I worked on the BBC Doctor Who website: See related content section at the bottom of http://www.bbc.co.uk/doctorwho/s4/episodes

 - rotate, skew, scale and translate work in FF, Opera, Chrome and Safari where supported.
 - matrix works in FF but seems to be unreliable in other browsers despite being supported.


Here's a laxy sod's guide to the matrix(a,b,c,d,tx,ty) transform function:
(So you don't have to actually understand it!)

 - a and d are sort of equivalent to scale(x,y)
 - b and c are sort of equivalent to skew(ax,ay)
 - tx and ty are sort of equivalent to translate(tx,ty)

 There, not no scary now is it?!

Helpful info:
https://developer.mozilla.org/en/CSS/-moz-transform
