/*
* Better 1.0.0 - jQuery Plugins
* https://github.com/nmakarov
* Copyright (c) 2012 Nick Makarov 
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
* Date: 2013-01-22
* 
*//*
* Description:
*   A set of jQuery plugins to help simplify common tasks - make a table downloadable, insert a panel etc.
*/
;(function($){

	// some private vars
	var xyz='xyz';

	$.better = function(){
		return 'better';
	}

	$.better.test = function(){
		return "better test";
	}

	$.better.defaults = {};
	$.better.plugins = {};

	// $.better = {
	// 	 id : 'Better'
	// 	,version : 0.1
	// 	,test : function(){console.log('Better test.');}
	// };

	$.fn.better = function(plugin){
		var args = [this];

		for (i=1; i<arguments.length; i++)
			args.push(arguments[i]);

		if (typeof $.better.plugins[plugin] == 'function')
			return $.better.plugins[plugin].apply(this,args);
		else
			console.log('plugin `' + plugin + '` is not defined.');
	};


})(jQuery);


;(function($){
	$.extend($.better.defaults, {
		  downloadUrl : '/bouncefile.php'
		, downloadType : 'text/plain'
		, downloadFilename : 'somefile.txt'
		, downloadMethod : 'bounce' // 'console'
	});

	$.extend($.better, {
		download : function(options){
			if ( ! options)
				throw ">>> better.download: no parameters provided.";
			// if a string is passed, it is the data.
			$.isPlainObject(options) || (options.data = options);
			var   url  = options.downloadUrl || $.better.defaults.downloadUrl
				, data = options.data
				, filename = options.filename || $.better.defaults.filename || 'somefile.txt'
				, type = options.downloadType || $.better.defaults.downloadType
				, method = options.downloadMethod || options.method || $.better.defaults.downloadMethod
				;

			if (method == 'bounce') {
				if ( ! url) throw(">>> better.download: no downloadUrl provided.");

				var $form = $('<form />', {
					  method : 'post'
					, action : url
					, style : 'display:hidden'
				}).append($('<input />', {
					  type : 'hidden'
					, name : 'filename'
					, value : filename
				})).append($('<input />', {
					  type : 'hidden'
					, name : 'data'
					, value : data
				})).append($('<input />', {
					  type : 'hidden'
					, name : 'type'
					, value : type
				})).appendTo('html').submit().remove();
			}
			else if (method == 'console') {
				console.log(data);
			}
		}

	});


	$.better.plugins.download = function (that, options) {
		return that.each(function(){
			var $table = $(this)
				, data = ''
				, csv = ''
				;
			$("th", $table).each(function(){
				csv += $(this).text() + ',';
			});
			$("tr", $table).each(function(index, tr){
				if ($(tr).css('display') == 'none')
					return;
				$("td", tr).each(function(){
					csv += $(this).text() + ',';
				});
				csv += "\n";
			});

			// console.log(csv);

			$.better.download({data: csv, type : 'text/csv', filename: options.filename});
		});
	};



/*
Issues

-	$container should have explicit dimensions set, otherwise outer* functions won't work
-	see how it works with various box model usage - with borders, margins and padding for container and panel
-	add option `attrs` - hash will be added to the panel as a set of attrs
 */

	$.extend($.better.defaults, {
		panel : {
			returnPanel : true
		}
	});

	// an array of all created panels:
 	$.better.plugins.panels = [];

 	/**
 	 * Recalc dimensions for all panels (called by `onresize` handler)
 	 * @return void
 	 */
 	$.better.plugins.panels.recalc = function() {
 		$.each($.better.plugins.panels, function(index, panel){
			panel.recalc();
 		});
 	}

 	/**
 	 * Main .better.panel plugin.
 	 * 
 	 * @param  {[jQuery]} that    Whatever was selected by jQuery selector
 	 * @param  {hash} options     Plugin options
 	 * @return {[jQuery]}         Original set of jQuery els or a reference to the newly created panel.
 	 */
	$.better.plugins.panel = function (that, options) {
		var $objects = that
			, ret = [];

		that.each(function(){
			var $container = $(this)
				, $panel = options.panel || $("<div />", {class:'panel'})
				;
			$panel.appendTo('html');

			$panel.recalc = function() {
	 			var   parentWidth = $container.outerWidth(false)
					, parentHeight = $container.outerHeight(true)
					, parentLeft = $container.offset().left
					, parentTop = $container.offset().top
					, offsets = options.offset ? options.offset.split(' ') : [0,0]
					, offsetTop = offsets[0] || 0
					, offsetLeft = offsets[1] || 0
					, left = +parentLeft + +offsetLeft
					, top = +parentTop + +offsetTop
					;

				// left calculations
				if (options.height == 'inherit')
					$panel.css('height', parentHeight);

				if (options.stick.match(/right/))
					left += parentWidth;

				if (options.pivot.match(/right/))
					left -= $panel.outerWidth(true);

				// top calculations
				if (options.pivot.match(/middle/))
					top -= $panel.outerHeight(true)/2;

				// make sure dimensions are set:
				$panel.css({
					  position : 'absolute'
					, width : $panel.width()
					, height : $panel.height()
					, top : top
					, left : left
				});
			}

			$panel.recalc();

			$.better.plugins.panels.push($panel);

			ret.push($.better.defaults.panel.returnPanel ? $panel.get(0) : $container.get(0));
		});

		$objects.length = 0;
		Array.prototype.push.apply($objects,ret);

		return $objects;
	}

	// if window resized, containers will resize as well, specifically, if stick == 'right/bottom'.
	// panel positions should be adjusted accordingly.
	$(window).resize(function(event){
		$.better.plugins.panels.recalc();
	});


	/*
		table attributes:

		header attributes:

		-	lookup - JSON string (like '{"0":"No","1":"Yes"}'). If set, column data will be transformed according to this rule.
	 */

	$.extend($.better.defaults, {
		table : {
			  headerSelector : "th"
		}
	});

	$.better.plugins.table = function(that, options) {
		return that.each(function(){
			var   $table = $(this)
				, t = time()
				, totals = {}
				, options = $.extend({}, $.better.defaults.table, options);

			// see if table attributes are set
			$.each(options, function(index){
				if ($table.attr(index))
					options[index] = $table.attr(index);
			});



			// walk the headers and make adjustments to the data
			$table.find(options.headerSelector).each(function(index){
				var $header = $(this);

				if ($header.attr("lookup")) {
					var lookup = $.parseJSON($(this).attr("lookup"));
					$(this).data('lookup', lookup);
					$('tbody tr > td:nth-child('+(index+1)+')',$table).each(function(){
						// get the cell text...
						var cellData = $(this).text();
						// save it as `cellData` data attribute and transform the cell contents
						$(this).html(lookup[cellData]).data('cellData', cellData);
					});					
				}


				if ($header.attr("filter")) {
					$header.get(0).filter = function(action, values){
						action = action ? action.toLowerCase() : 'clear';
						values = [].concat(values);
						switch (action) {

							case 'apply' : 
							$table.find("tbody tr").each(function(){

								var v = $("td:eq("+index+")", this).text();
								if ( values.indexOf(v))
									$(this).hide();
							});
							break;

							// clear filters
							default : $table.find("tbody tr").show(); break;
						}
						calcTotals();
						return '123';
					};
				}

				if ($header.attr('total')) {
					var total = $header.attr('total');
						totals[index] = total;
				}
			});

			function calcTotals() {
				var $row = $("<tr />");

				$table.find(options.headerSelector).each(function(index){
					var   t = totals[index]
						, res = 0;

					try {
						// try JSON.
						t=JSON.parse(t);

						// It is JSON indeed, walk each column
						$table.find("tbody").find("td:nth-child("+(index+1)+")").each(function(){
							if ($(this).parent().css('display') == 'none')
								return;

							switch (t.func) {
								case 'sum' : res += parseInt($(this).text()); break;
								default : res += 1;
							}
						});
						$row.append($("<td />", {html:t.format.sprintf(res)}));
					} catch (e) {
						// JSON failed - so it is either an empty total or some plain text:
						$row.append($("<td />", {html:t}));
					}

				});
				$table.find("tfoot tr").remove();
				$table.find("tfoot").append($row);

			}

			// deal with totals (if any)
			if ( ! $.isEmptyObject(totals)) {
				// create a `tfoot` element if none:
				if ($table.find("tfoot").length == 0)
					$table.append($("<tfoot/>").append($("<tr />")));
				
				calcTotals();
			}
			 
			console.log("elapsed: " + (time()-t));
		});
	}


	function time () {
		var d = new Date();
		return d.getTime();
	}

// fix for IE < 8
if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === needle) {
                return i;
            }
        }
        return -1;
    };
}

if ( ! String.prototype.sprintf) {
	String.prototype.sprintf = function() {
		var args = Array.prototype.slice.call( arguments );
		return this.replace(/%(i)/g, function (match, number){
			return args.shift();
		});
	}
}

// if ( ! Object.prototype.isEmpty1) {
// 	Object.prototype.isEmpty1 = function() {
// 		var empty=true;
// 		for (var i in this)
// 			if (this.hasOwnProperty(i)) {empty=false;break;}
// 		return empty;
// 	}
// }
})(jQuery);