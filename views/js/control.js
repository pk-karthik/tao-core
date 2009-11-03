/**
 * initialize the naviguation into the ui components 
 */
function loadControls(){
	
	//left menu trees init by loading the tab content
	$.ajax({
		url: '/tao/Main/getSectionTrees',
		type: "GET",
		data: {
			section: $("li a[href=#" + $('.ui-tabs-panel')[$tabs.tabs('option', 'selected')].id + "]:first").text()		//get the link text of the selected tab
		},
		dataType: 'html',
		success: function(response){
			$('#section-trees').html(response);
			initNavigation();
		}
	});
	//left menu actions init by loading the tab content
	$.ajax({
		url: '/tao/Main/getSectionActions',
		type: "GET",
		data: {
			section: $("li a[href=#" + $('.ui-tabs-panel')[$tabs.tabs('option', 'selected')].id + "]:first").text()		//get the link text of the selected tab
		},
		dataType: 'html',
		success: function(response){
			$('#section-actions').html(response);
			initNavigation();
		}
	});
	
	$("#section-grid").fadeOut();
	
	initNavigation();
}

/**
 * @return {String} the current main container jQuery selector (from the opened tab)
 */
function getMainContainerSelector(){
	var uiTab = $('.ui-tabs-panel')[$tabs.tabs('option', 'selected')].id;
	return "div#"+uiTab+" div.main-container";
}

/**
 * change links and form behavior to load  content via ajax
 */
function initNavigation(){
	
	//links load the content into the main container
	$('a.nav').click(function() { 	
		 _load(getMainContainerSelector(), this.href);
		 return false;
	});
	//submit the form by ajax into the form container
	$("form").submit(function(){
		try{
			loading();
			$(getMainContainerSelector()).load(
				_href($(this).attr('action')),
				$(this).serializeArray(),
				loaded()
			);
		}
		catch(exp){console.log(exp);}
		return false;
	});
	
	
	$.ui.dialog.defaults.bgiframe = true;		//fix ie6 bug
	$("a#settings-loader").click(function(){
		try{
			var settingTitle = $(this).text();
			$("#settings-form").load(this.href).dialog({
				title: settingTitle,
				width: 500,
				height: 300
			});
		}
		catch(exp){console.log(exp);}
		
		return false;
	});
	
	_autoFx();
	_initForms();
}

/**
 * Load url asyncly into selector container
 * @param {String} selector
 * @param {String} url
 */
function _load(selector, url, data){
	if(data){
		data.nc = new Date().getTime();
	}
	else{
		data = {nc: new Date().getTime()}
	}
	loading();
	$(selector).load(url, data, loaded());
}

/**
 * Make a nocache url, using a timestamp
 * @param {String} ref
 */
function _href(ref){
	return  (ref.indexOf('?') > -1) ? ref + '&nc='+new Date().getTime() : ref + '?nc='+new Date().getTime(); 
}

/**
 * apply effect to elements that are only present
 */
function _autoFx(){
	setTimeout(function(){
		$(".auto-highlight").effect("highlight", {color: "#9FC9FF"}, 2500);
	}, 750);
	setTimeout(function(){
		$(".auto-hide").fadeOut("slow");
	}, 2000);
	setTimeout(function(){
		$(".auto-slide").slideUp(1500);
	}, 5000);
}

function _initForms(){
	 $("input.property-deleter").click(function(){
	 	groupNode = $(this).parents(".form-group").get(0);
		if(groupNode){
			$(groupNode).empty();
			$(groupNode).remove();
		}
	 })
}

/**
 * Check and cut the text of the selector container only if the text is longer than the maxLength parameter
 * @param {String} selector JQuery selector
 * @param {int} maxLength  
 */
function textCutter(selector, maxLength){
	if(!maxLength){
		maxLength = 100; 
	}
	$(selector).each(function(){
		if($(this).text().length > maxLength && !$(this).hasClass("text-cutted")){
			$(this).attr('title', $(this).text());
			$(this).css('cursor', 'pointer');
			$(this).html($(this).text().substring(0, maxLength) + "[...<img src='"+imgPath+"bullet_add.png' />]")
			$(this).addClass("text-cutted");
		}
	});
}

/**
 * Begin an async request, while loading:
 * - show the loader img
 * - disable the submit buttons
 */
function loading(){
	$("#ajax-loading").show('fast');
	$("input[type='submit']").attr('disabled', 'true');
}

/**
 * Complete an async request, once loaded:
 *  - hide the loader img
 *  - enable back the submit buttons
 */
function loaded(){
	$("#ajax-loading").hide('fast');
	$("input[type='submit']").attr('disabled', 'false');
}

var $tabs = null;
$(function(){
	//create tabs
	$tabs = $('#tabs').tabs({load: loadControls, collapsible: true});
});