jQuery plugin to allow jQuery's animate() method to animate the following css properties:

- transform: matrix(a,b,c,d,tx,ty) rotate(angle) skew(ax,ay) translate(tx,ty)
- transform-origin: x y
- background-position: x y

Based on a background-position animations plugin that I wrote a while back and finally found a use for it when I worked on the BBC Doctor Who website: See related content section at the bottom of http://www.bbc.co.uk/doctorwho/s4/episodes

Work in progress...
Rotate and Skew work in FF, Opera, Chrome and Safari where supported.
Matrix() works in FF but does not seem to have an effect in other browsers despite being supported.
