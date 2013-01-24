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

			// make sure a `thead` element is set:
			if ($table.find("thead").length == 0) {
				var $headrow = $("th", $table).parent();
				$table.prepend($("<thead/>").append($headrow));
			}

			// editable stuff
			$table.find("tbody td").on("click", function(){
				// bail out if the table is not editable:
				if ( ! $table.hasClass('editable'))
					return true;

				var   $cell = $(this)
					, $th = $("thead th", $table).eq($cell.index())
					, $activeCell = getActiveCell();
					;

				// if a cell is in non-editable column, let the window.onclick handle the `cancelEdit`
				if ( ! $th.attr('editable'))
					return true;

				if ($cell.hasClass('active'))
					console.log('already active');
				else {
					// the cell might abort the cancelEdit
					if ( ! cancelEdit($activeCell))
						return;
				}

				// if the cell is already active, do the edit
				// if ($cell.hasClass("active"))
					startEdit($cell, $activeCell);
					$cell.addClass('active');
				// else {
					// reactivate previously active cell, mark this one as active
					// cancelEdit(getActiveCell());
				// }
				return false;
			});

			$(window).on("click", function(){
				// $table.find("tbody td").removeClass('active');
				// console.log('window click');
				cancelEdit(getActiveCell());
			});

			function getActiveCell () {
				return $table.find("tbody td[class='active']");
			}

			function startEdit ($cell, $activeCell) {
				var fieldIndex = $cell.index()
					, $th = $("thead th", $table).eq(fieldIndex)
					, type = $th.attr("editable")
					, lookup = $th.data('lookup')
					, currentData = $cell.data('cellData')
					, newData = null
					, hasActiveCell = $activeCell.length>0
					;

				// if table just activated, do not do any edit
				if ( ! hasActiveCell)
					return;

				switch (type) {
					case "state" :
						newData = stateAdvance(currentData, lookup);
						submitEdit($cell, newData, lookup[newData])
						break;
					case "text" :
						$cell.data('cellData',$cell.text());
						addInput($cell);
				}
			}

			function submitEdit ($cell, newData, newDisplay) {
				var   fieldIndex = $cell.index()
					, $th = $("thead th", $table).eq(fieldIndex)
					, field = $th.attr('field')
					, tableId = $table.attr('id')
					, rowId = $cell.parent().attr('id')
					, url = $table.attr('submitUrl')
					;
				$.post(url, {
					  tableId : tableId
					, rowId : rowId
					, field : field
					, value : newData
				}, function(data) {

					var res     = data.split(':',2),
						status  = res[0],
						message = res[1];


					console.log('status: `' + status + '`');
					console.log('message: ' + message);

					// todo analyze data, if error - throw message
					if (status == 'ok') {
						$cell.data('cellData', newData);
						$cell.fadeOut(50, function(){
							$cell.html(newDisplay).fadeIn(50);
						});
					}
					else {
						$cell.html($cell.data('oldData'));
						return false;
					}


				});
			}

			function addInput ($cell) {
				var   $input = $("<div />")
						.height($cell.height())
						.css({padding:'0px', margin:'0px'})
						.append($("<input />", {type:"text", value:$cell.text()}).css({padding:'', margin:''}))
					, saved = {}
					, props = ['width', 'height', 'margin', 'padding', 'border']
					;

					$cell.height($cell.css('height'));

					for (var i in props) {
						var   k = props[i]
							, v = $cell.css(k);
						// console.log('k:'+k+' v:'+v);
						saved[k] = $cell.css(k);
					}

					// console.log(saved);

					$input.appendTo($cell.empty());
					for (var i in props) {
						var   k = props[i]
							, v = $cell.css(k);
						// console.log('k:'+k+' v:'+v);
					}

					for (k in props) {
						var   k = props[i]
						
						$input.css(k, saved[k]);
					}
				// .width($cell.innerWidth()).appendTo($cell.empty());
			}

			function stateAdvance (state, states) {
				var first, newState, found=false;
				for (var k in states) {
					if ( ! first)
						first = k;
					if (found) {
						newState = k;
						break;
					}
					if (k == state)
						found = true;
				}
				return newState ? newState : first;
			}

			function cancelEdit ($cell) {
				var fieldIndex = $cell.index()
					, $th = $("thead th", $table).eq(fieldIndex)
					, type = $th.attr("editable")
					, currentData = $cell.data('cellData') || 'abc'

				// no active cell, do nothing
				if ($cell.length == 0)
					return true;

				console.log('cancelEdit - ' + currentData);

				// todo: possibly, display dialog if the new data is unsaved. And return `false` here if edit should continue

				if (type == 'text') {
					console.log('here');
					$cell.html(currentData);
				}

				$cell.removeClass('active');

				return true;
			}

			$table.on("edit", function(event, action){
				var $cell = getActiveCell();
				if ($cell.length == 0)
					return;
				switch (action) {
					case "cancel" : cancelEdit($cell); break;
				}
			});


			// sort rows
			$table.on('sort', function(event, fieldname, numeric){
				var fieldIndex = $("thead th[field='"+fieldname+"']", $table).index()
					, $th = $("thead th", $table).eq(fieldIndex)
					, numeric = (numeric === 'numeric') || $th.attr("datatype") || false
					, direction = $th.hasClass('asc') ? 'desc' : 'asc'
					, res = direction == 'asc' ? -1 : 1
					, rows = $table.find("tbody tr").get();

				$th.removeClass('asc').removeClass('desc').addClass(direction);

				rows.sort(function(a,b){
					var   $A = $(a).children('td').eq(fieldIndex)
						, $B = $(b).children('td').eq(fieldIndex)
						, keyA = numeric ? parseInt($A.text(),10) : $A.text().toUpperCase()
						, keyB = numeric ? parseInt($B.text(),10) : $B.text().toUpperCase()
						;
						return (keyA < keyB) ? res : res*(-1);
				});

				$.each(rows, function(index,row){
					$table.children('tbody').append(row);
				});
			});

			$table.on("filter", function(event, fieldname, value, func){
				var   func = func || "eq"
					, fieldIndex = $("thead th[field='"+fieldname+"']", $table).index();

				$table.find("tbody tr").show();
				if ("undefined" !== typeof fieldname) {
					$table.find("tbody tr").each(function(){

						var v = $("td:eq("+fieldIndex+")", this).text();
						var cond = 
							func == "eq" ? [].concat(value).indexOf(v) !== -1 :
							func == "gte" ? parseInt(v,10) >= parseInt(value,10) :
							typeof func == "function" ? func(value, v) :
							true
							;
						if ( ! cond )
							$(this).hide();
					});
				}
				calcTotals();

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


				// todo: filter should be assigned to the table, not individual headers.
				// that would allow for multi-column filters. 
				// Additional argument to be passed - field name or field index
				// 
				if ($header.attr("filter")) {
					$header.get(0).filter = function(action, values, func){
						action = action ? action.toLowerCase() : 'clear';
						func = func || "eq";
						switch (action) {

							case 'apply' : 
							$table.find("tbody tr").each(function(){

								var v = $("td:eq("+index+")", this).text();
								var cond = 
									func == "eq" ? [].concat(values).indexOf(v) !== -1 :
									func == "gte" ? parseInt(v,10) >= parseInt(values,10) :
									true
									;
								if ( ! cond )
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