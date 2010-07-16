jQuery plugin to allow jQuery's animate() method to animate the following css properties:

- transform: matrix() rotate() skew() translate()
- transform-origin
- background-position

Based on a background-position animations plugin that I wrote a while back and ended up using it when I did stacks of jQuery and CSS on the BBC Doctor Who website http://www.bbc.co.uk/doctorwho/s4

Work in progress.
Rotate and Skew work in FF, Opera, Chrome and Safari where supported.
Matrix() works in FF but does not seem to have an effect in other browsers despite being supported.
