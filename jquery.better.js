/*! Better 1.0.0
* Copyright (c) 2012 Nick Makarov https://github.com/nmakarov
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
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

	$.extend($.better.defaults, {
		panel : {
			returnPanel : true
		}
	});



/*
Issues

-	$container should have explicit dimensions set, otherwise outer* functions win't work
-	fixed: on resize panels are not following the `stick` guidelines (fix in progress)
-	see how it works with various box model usage - with borders, margins and padding for container and panel
-	add option `attrs` - hash will be added to the panel as a set of attrs
-	when a panel is appended to some parent, there might be some complications due to this parent's position settings.
	// quick hack - parent for the panel insertion is hardcoded as `html`, `parent` is used just to get dimensions.
 */

 	$.better.plugins.panels = [];
 	$.better.plugins.panels.recalc = function() {
 		$.each($.better.plugins.panels, function(index, panel){
 			var   $panel = panel.panel
 				, options = panel.options
 				, $container = panel.container
				, parentWidth = $container.outerWidth(false)
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

			$panel.css({
				  position : 'absolute'
				, width : $panel.width()
				, height : $panel.height()
				, top : top
				, left : left
			});
 		});
 	}
	$.better.plugins.panel = function (that, options) {
		var $objects = that
			, ret = [];


		that.each(function(){
			var $container = $(this)
				, $panel = options.panel || $("<div />", {class:'panel'})
				;
			$panel.appendTo('html');

			$.better.plugins.panels.push({
				  panel : $panel
				, container : $container
				, options : options
			});
			$.better.plugins.panels.recalc();

			// ret.push($panel.get(0));
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



})(jQuery);