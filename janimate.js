
// Note: There's something odd about the way jQuery parses the .animate(hash) which means that 
// strings such as "10,5" are passed to our step functions as "10". No prob if they're passed as "(10,5)"

// Performance tips:
// - I've used split().join() instead of replace() because it can be faster but may not be necessary any more.
// - Try to do as little work as possible inside the animation steps. Where appropriate I've precalculated some repetitive sums.

(function($){
	
	var undefined;											// For faster comparison of undefined variables.
	var console = window.console || { log:function(){} };	// Dummy to prevent Firebug console calls from breaking in other browsers.

	// Helper for deducing which style name is supported by the browser:
	// Returns the style name if supported or false if unsupported.
	function getSupportedStyleName( candidates ) {
		var undefined, test = document.createElement('DIV').style;
		return $.grep( candidates, function(candidate){ return test[candidate] !== undefined } ).concat(false)[0];
	}

	// Augment the excellent jQuery.support hash with info about supported styles:
	// TODO: Perhaps someone can suggest a more future-proof way to do this?
	// Eg: jQuery.support.borderRadius will be 'MozBorderRadius' in Firefox 3 and false in IE6. 
	$.extend( $.support, {

		transform		: getSupportedStyleName( ['transform', 'MozTransform', 'WebkitTransform', 'OTransform', 'MSTransform', 'filter'] ),
		transformOrigin	: getSupportedStyleName( ['transformOrigin', 'MozTransformOrigin', 'WebkitTransformOrigin', 'OTransformOrigin', 'MSTransformOrigin'] ),
		borderRadius	: getSupportedStyleName( ['borderRadius', 'MozBorderRadius', 'WebkitBorderRadius', 'OBorderRadius', 'MSBorderRadius'] )

	});

	// Helper to separate multiple functions from a transform rule:
	// (Separate where a space is followed by a function name)
	function splitTransformRule(rule){
		return rule.split(/\s(?=skew|rotate|scale|matrix|translate)/);
	}


	// Add our custom css handlers to jQuery so that animate() method will use them: (instead of running the usual fx.step._default)
	$.extend( $.fx.step, {

		'backgroundPosition': function(fx) {

			if( !fx.range ){

				function tokenizeBackgroundPosition(rule){

					tokens = rule.toString()
						.split(/left|top/).join('0')			// Convert named values to numeric equivalents.
						.split(/center|middle/).join('50%')		//
						.split(/right|bottom/).join('100%')		//
						.match( /(-?[\d.]+)(%|px|em)?(,(-?[\d.]+)(%|px|em)?)?/ ) || [ rule, 0, 'px', '', 0, 'px' ];
						//        skew  (    ax     deg/grad/rad  ,    ay     deg/grad/rad   )   || default

					return {
						x		: parseFloat( tokens[1] ) || 0,
						y		: parseFloat( tokens[4] ) || 0,
						unit	: {
									ax: tokens[2] || 'px',
									ay: tokens[5] || 'px'
								  }
					};

				}

				fx.start	= tokenizeBackgroundPosition( $.curCSS( fx.elem, 'backgroundPosition' ) );
				fx.end		= tokenizeBackgroundPosition( fx.end );
				fx.unit		= fx.end.unit;
				// Pre-calculate custom property to optimise performance:
				fx.range	= {
								x: fx.end.x - fx.start.x,
								y: fx.end.y - fx.start.y
							  };

			};

			// Apply updated style:
			newStyle = ( fx.start.x + fx.pos * fx.range.x ) + fx.unit.x + ' '
					 + ( fx.start.y + fx.pos * fx.range.y ) + fx.unit.y + ')';

			fx.elem.style[$.support.transform] = newStyle;

		},


		'transformOrigin': function(fx) {

			if( !fx.range ){

				function tokenizeOrigin(rule){

					tokens = rule.toString()
						.split(/left|top/).join('0')
						.split(/center/).join('50%')
						.split(/right|bottom/).join('100%')
						.match( /\(\s*(-?[\d.]+)(%|px|em)?(\s+(-?[\d.]+)(%|px|em)?)?\s*\)/ ) || [rule,'50','%','','50','%'];
						//        (       x       %/px/em    _     y       %/px/em        )    || default

					// Default vertical position to 50% when missing:
					//if( isNaN(tokens[4]) ){ tokens[4]=50; tokens[5]='%' }

					return {
						x		: parseFloat( tokens[1] ) || 0,
						y		: parseFloat( tokens[4] ) || 0,
						unit	: {
									x: tokens[2] || 'px',
									y: tokens[5] || 'px'
								  }
					};

				}

				fx.start	= tokenizeOrigin( $.curCSS(fx.elem,ruleName), fx );
				fx.end		= tokenizeOrigin( fx.end, fx );
				fx.unit		= fx.end.unit;
				// Pre-calculate custom property to optimise performance:
				fx.range	= {
								x: fx.end.x - fx.start.x,
								y: fx.end.y - fx.start.y
							  };

			};

			// Apply updated style:
			newStyle = ( fx.start.x + fx.pos * fx.range.x ) + fx.unit.x
			   + ' ' + ( fx.start.y + fx.pos * fx.range.y ) + fx.unit.y;
			
			fx.elem.style[ $.support.transformOrigin ] = newStyle;

		},


		'matrix': function(fx) {

			if( !fx.range ){

				function tokenizeMatrixRule(rule){

					tokens = rule.toString()
						.split(/\s*/).join('')
						.split(/left|top/).join('0')
						.split(/right|bottom/).join('100%')
						.match( /^(matrix)\((-?[\d.]+),(-?[\d.]+),(-?[\d.]+),(-?[\d.]+),(-?[\d.]+)(px|em)?,(-?[\d.]+)(px|em)?\)/ ) || [rule,'matrix',1,0,0,1,0,'px',0,'px'];
						//         matrix  (  a      ,  b      ,  c      ,  d      ,  tx    px/em  ,  ty    px/em             )    || default

					//console.log(rule,tokens);

					return {
						transform	: 'matrix',
						a			: parseFloat( tokens[2] ) || 0,
						b			: parseFloat( tokens[3] ) || 0,
						c			: parseFloat( tokens[4] ) || 0,
						d			: parseFloat( tokens[5] ) || 0,
						tx			: parseFloat( tokens[6] ) || 0,
						ty			: parseFloat( tokens[8] ) || 0,
						unit		: {
										tx: tokens[7] || 'px',
										ty: tokens[9] || 'px'
									  }
					};
				
				}

				// Ensure supplied end rule includes the matrix(...) function name:
				fx.end = [ 'matrix(', fx.end.toString().split(/matrix|\(|\)/).join(''), ')' ].join('');

				fx.start		= tokenizeMatrixRule( $.curCSS( fx.elem, $.support.transform ) );
				fx.end			= tokenizeMatrixRule( fx.end );
				fx.unit			= fx.end.unit;
				// Pre-calculate custom property to optimise performance:
				fx.range		= { a: fx.end.a - fx.start.a, b: fx.end.b - fx.start.b, c: fx.end.c - fx.start.c, d: fx.end.d - fx.start.d, tx: fx.end.tx - fx.start.tx, ty: fx.end.ty - fx.start.ty };

			};

			// Apply updated style:
			newStyle = fx.end.transform + '('
				+ ( fx.start.a  + fx.pos * fx.range.a  ) + ','
				+ ( fx.start.b  + fx.pos * fx.range.b  ) + ','
				+ ( fx.start.c  + fx.pos * fx.range.c  ) + ','
				+ ( fx.start.d  + fx.pos * fx.range.d  ) + ','
				+ ( fx.start.tx + fx.pos * fx.range.tx ) + fx.unit.tx + ','
				+ ( fx.start.ty + fx.pos * fx.range.ty ) + fx.unit.ty + ')';
			
			// css transform may contain more than one transform function so we can't just replace it, we have to merge with it:
			fx.elem.style[$.support.transform] = fx.elem.style[$.support.transform].split(/matrix\([^\)]*\)/).concat( newStyle ).join(' ')

		},


		'skew': function(fx) {

			if( !fx.range ){

				function tokenizeSkew(rule){

					tokens = rule.toString()
						.split(/\s*/).join('')
						.match( /(skew)\((-?[\d.]+)(deg|grad|rad)?(,(-?[\d.]+)(deg|grad|rad)?)?\)/ ) || [ rule, 'skew', 0, 'deg', '', 0, 'deg' ];
						//        skew  (    ax     deg/grad/rad  ,    ay     deg/grad/rad   )   || default

					return {
						ax		: parseFloat( tokens[2] ) || 0,
						ay		: parseFloat( tokens[5] ) || 0,
						unit	: {
									ax: tokens[3] || 'deg',
									ay: tokens[6] || 'deg'
								  }
					};

				}

				// Ensure supplied end rule includes the skew(...) function name:
				fx.end = [ 'skew(', fx.end.toString().split( /skew|\(|\)/ ).join(''), ')' ].join('');

				fx.start		= tokenizeSkew( $.curCSS( fx.elem, $.support.transform ) );
				fx.end			= tokenizeSkew( fx.end );
				fx.unit			= fx.end.unit;
				// Pre-calculate custom property to optimise performance:
				fx.range		= { ax: fx.end.ax - fx.start.ax, ay: fx.end.ay - fx.start.ay };

			};


			// In older versions of IE we use filter instead of transform:
			if( $.support.transform == 'filter' ){

				//fx.elem.style.filter = "progid:DXImageTransform.Microsoft.Matrix(newStyle)"
				//$.each( fx.elem.filters.item, function(i,item){
				//	//alert(item)
				//})
				
				var rmatrix = /Matrix\([^)]*\)/;
				var matrix = '';
				var filter = style.filter || $.curCSS( elem, "filter" ) || "";
				fx.elem.style.filter = rmatrix.test(filter) ? filter.replace(rmatrix, opacity) : opacity;


				alert(matrix.M12)
				
				// Apply updated style:
				matrix.M12 = ( fx.start.ax + fx.pos * fx.range.ax ) //+ fx.unit.ax;
				matrix.M21 = ( fx.start.ay + fx.pos * fx.range.ay ) //+ fx.unit.ay;

			// Grown-up browsers:
			}else{

				// Apply updated style:
				newStyle = 'skew('
					+ ( fx.start.ax + fx.pos * fx.range.ax ) + fx.unit.ax + ','
					+ ( fx.start.ay + fx.pos * fx.range.ay ) + fx.unit.ay + ')';

				//console.log(
				// css transform may contain more than one transform function so we can't just replace it, we have to merge with it:
				fx.elem.style[$.support.transform] = fx.elem.style[$.support.transform].split(/skew\([^\)]*\)/).concat( newStyle ).join(' ')
				//)
				
			}
		},


		'scale': function(fx) {

			function tokenizeScale(rule){

				tokens = rule.toString()
					.split(/\s*/).join('')
					.match( /(scale)\((-?[\d.]+)(,(-?[\d.]+)\))?/ ) || [rule,'scale',1,'',1];
					//        scale  (    sx     ,    sy      )     || default

				var sx = parseFloat( tokens[2] )
				var sy = parseFloat( tokens[4] )

				return {
					sx	: isNaN(sx) ? 1 : sx,
					sy	: isNaN(sy) ? ( isNaN(sx) ? 1 : sx ) : sy
				};

			}

			if( !fx.range ){

				// Ensure supplied end rule includes the scale(...) function name:
				fx.end = [ 'scale(', fx.end.toString().split( /scale|\(|\)/ ).join(''), ')' ].join('');

				fx.start		= tokenizeScale( $.curCSS( fx.elem, $.support.transform ) );
				fx.end			= tokenizeScale( fx.end );
				// Pre-calculate custom property to optimise performance:
				fx.range		= { sx: fx.end.sx - fx.start.sx, sy: fx.end.sy - fx.start.sy };

			};

			// Apply updated style:
			newStyle = 'scale('
				+ ( fx.start.sx + fx.pos * fx.range.sx ) + ','
				+ ( fx.start.sy + fx.pos * fx.range.sy ) + ')';

			//$(fx.elem).css( $.support.transform, newStyle )
			//fx.elem.style[$.support.transform] = newStyle;	// Smoother
			var before = fx.elem.style[$.support.transform];
			//console.log(
			// css transform may contain more than one transform function so we can't just replace it, we have to merge with it:
			fx.elem.style[$.support.transform] = fx.elem.style[$.support.transform].split(/scale\([^\)]*\)/).concat( newStyle ).join(' ');
			//)
			//console.log( 'before:', before, 'after:', fx.elem.style[$.support.transform] );
		},


		'rotate': function(fx) {

			if( !fx.range ){

				function tokenizeRotate(rule){

					tokens = rule.toString()
						.split(/\s*/).join('')
						.match( /(rotate)\((-?[\d.]+)(deg|grad|rad)?\)/ ) || [rule,'rotate',0,'deg'];
						//        rotate  (   angle   deg/grad/rad   )    || default

					return {
						a		: parseFloat( tokens[2] ) || 0,
						unit	: {
									a: parseFloat( tokens[3] ) || 'deg'
								  }
					};

				}

				// Ensure supplied end rule includes the rotate(...) function name:
				fx.end = [ 'rotate(', fx.end.toString().split( /rotate|\(|\)/ ).join(''), ')' ].join('');

				fx.start		= tokenizeRotate( $.curCSS( fx.elem, $.support.transform ) );
				fx.end			= tokenizeRotate( fx.end );
				fx.unit			= fx.end.unit;
				// Pre-calculate custom property to optimise performance:
				fx.range		= { a: fx.end.a - fx.start.a };

			};

			// Apply updated style:
			newStyle = 'rotate(' + ( fx.start.a + fx.pos * fx.range.a ) + fx.unit.a + ')';

			//$(fx.elem).css( $.support.transform, newStyle )
			//fx.elem.style[$.support.transform] = newStyle;	// Smoother
			// css transform may contain more than one transform function so we can't just replace it, we have to merge with it:
			//var before = fx.elem.style[$.support.transform];
			//console.log(
			fx.elem.style[$.support.transform] = fx.elem.style[$.support.transform].split(/rotate\([^\)]*\)/).concat( newStyle ).join(' ')
			//)
			//console.log( 'before:', before, 'after:', fx.elem.style[$.support.transform] );
			
		},


		'translate': function(fx) {

			if( !fx.range ){

				function tokenizeTranslate(rule){

					tokens = rule.toString()
						.split(/\s*/).join('')
						.match( /(translate)\((-?[\d.]+)(px|em)?(,(-?[\d.]+)(px|em)?)?\)/ ) || [rule,'translate',0,'px','',0,'px'];
						//        translate  (   tx      px/em   ,   ty      px/em     )    || default

					return {
						tx		: parseFloat( tokens[2] ) || 0,
						ty		: parseFloat( tokens[5] ) || 0,
						unit	: {
									tx: tokens[3] || 'px', 
									ty: tokens[6] || 'px'
								  }
					};

				}

				// Ensure supplied end rule includes the rotate(...) function name:
				fx.end = [ 'translate(', fx.end.toString().split( /translate|\(|\)/ ).join(''), ')' ].join('');

				fx.start		= tokenizeTranslate( $.curCSS( fx.elem, $.support.transform ) );
				fx.end			= tokenizeTranslate( fx.end );
				fx.unit			= fx.end.unit;
				// Pre-calculate custom property to optimise performance:
				fx.range		= { tx: fx.end.tx - fx.start.tx, ty: fx.end.ty - fx.start.ty };

			};

			// Apply updated style:
			newStyle = 'translate('
				+ ( fx.start.tx + fx.pos * fx.range.tx ) + fx.unit.tx + ','
				+ ( fx.start.ty + fx.pos * fx.range.ty ) + fx.unit.ty + ')';

			//$(fx.elem).css( $.support.transform, newStyle )
			//fx.elem.style[$.support.transform] = newStyle;	// Smoother
			// css transform may contain more than one transform function so we can't just replace it, we have to merge with it:
			//var before = fx.elem.style[$.support.transform];
			//console.log(
			fx.elem.style[$.support.transform] = fx.elem.style[$.support.transform].split(/translate\([^\)]*\)/).concat( newStyle ).join(' ')
			//)
			//console.log( 'before:', before, 'after:', fx.elem.style[$.support.transform] );
		}


	});

})(jQuery)