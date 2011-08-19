/*
	
	extensionscript.js
	
	by
	Aleksandar Toplek, 
	JustBuild 2011.
	
	This file is under FreeBSD license that
	can be found in LICENSE.txt that came
	with this code.
	  
*/

// TODO: 	Internationalization
// 			http://code.google.com/chrome/extensions/i18n.html

// TODO: Setting variables preloading

// Global variables


// Global constants
var CBuildMarketFillInJunkResourceTimerInterval = 250;

// Initialization of extension script (travian page modification)
Initialize();

/**
 * Initializes all extension functions
 *
 * @author Aleksandar Toplek
 */
function Initialize() {
	console.log("Initialize - Initializing...");
	var startTime = (new Date()).getTime();
	
	// Initial settings configuration
	GlobalInitializeSettings();
	
	// Calls for PageAction show
	chrome.extension.sendRequest({ category: "extension", name: "showActionPageMenu", action: "set" }, function (response) { });
	
	var pathname = PageGetPathname();
	PageProcessAll(pathname);
	
	var endTime = (new Date()).getTime();
	console.log("Initialize - Finished successfully! (" + (endTime - startTime) + ")");
};

/**
 * Pathname of current page.
 *
 * @author Aleksandar Toplek
 *
 * @return {String} Returns an pathname of current web page without query.
 */
function PageGetPathname() {
	console.log("PageGetPathname - Reading current page...");
	
	var currentPath = window.location.pathname;
	
	console.log("PageGetPathname - Current page pathname [" + currentPath + "]");
	
	return currentPath;
};

/**
 * Runs all scripts that changes page content.
 * This should be called after all information is retrieved from page.
 *
 * @author Aleksandar Toplek
 */
function PageProcessAll(pathname) {
	console.log("PageProcessAll - Starting...");
	
	var where = PageGetWhere(pathname);
	
	console.log("PageProcessAll - Pathname [" + pathname + "] mathched with [" + where + "]");
	
	chrome.extension.sendRequest({ category: "settings", name: "checkGlobalRemoveInGameHelp", action: "get" }, function (response) {
		console.log("PageProcessAll - checkGlobalRemoveInGameHelp [" + response + "]")
		if (response === "On" | response == undefined) GlobalRemoveInGameHelp()
	});

	if (where === "Build") GlobalInBuild();
	else if (where === "SendTroops") GlobalInSendTroops();
	else return;
};

/**
 * Determines where in gameplay current page is.
 *
 * @author Aleksandar Toplek
 *
 * @return {String} Returns a name of gameply part.
 *					(e.g. Map, SendTroops, VillageIn, ...)
 */
function PageGetWhere(pathname) {
	if 		(pathname.match(/dorf1.php/gi)) return "VillageOut";
	else if (pathname.match(/dorf2.php/gi)) return "VillageIn";
	else if (pathname.match(/dorf3.php/gi)) return "VillageOverview";
	else if (pathname.match(/build.php/i)) 	return "Build";
	else if (pathname.match(/karte.php/gi)) return "Map";
	else if (pathname.match(/a2b.php/gi)) 	return "SendTroops";

	return undefined;
};

/**
 * Initializes settings to default on first initialization.
 *
 * @author Aleksandar Toplek
 */
function GlobalInitializeSettings() {
	chrome.extension.sendRequest({ category: "settings", name: "wasInitialized", action: "get" }, function (response) {
		console.log("GlobalInitializeSettings - wasInitialized [" + response +"]")
		if (response == undefined) {
			console.log("GlobalInitializeSettings - First settings configuration...");
			
			chrome.extension.sendRequest({ category: "settings", name: "wasInitialized", action: "set", value: true }, function (response) { });
			// Check settings
			chrome.extension.sendRequest({ category: "settings", name: "checkGlobalRemoveInGameHelp", action: "set", value: "On" }, function (response) { });
			chrome.extension.sendRequest({ category: "settings", name: "checkBuildResourceNeeded", action: "set", value: "On" }, function (response) { });
			chrome.extension.sendRequest({ category: "settings", name: "checkMarketShowX2Shortcut", action: "set", value: "On" }, function (response) { });
			chrome.extension.sendRequest({ category: "settings", name: "checkMarketListMyVillages", action: "set", value: "On" }, function (response) { });
			chrome.extension.sendRequest({ category: "settings", name: "checkMarketShowJunkResource", action: "set", value: "On" }, function (response) { });
			chrome.extension.sendRequest({ category: "settings", name: "checkSendTroopsListMyVillages", action: "set", value: "On" }, function (response) { });
			
			console.log("GlobalInitializeSettings - All settings initialized!");
		}
	});
}

/**
 * Filters all villages from right village list and only returns non active ones.
 *
 * @author Aleksandar Toplek
 *
 * @return {Array} Returns array of 'a' elemets with href to village view and name in text.
 */
function GlobalGetVillagesList() {
	console.log("GlobalGetVillagesList - Getting village list...");
	
	var villagesList = $("div[id='villageList'] > div[class='list'] > ul > li[class*='entry'] > a[class!='active']");
	
	console.log("GlobalGetVillagesList - Village list: " + villagesList);
	return villagesList;
};

/**
 * Removes in game help link from every travian page.
 * On some servers this wont remove stone and book since they are
 * on one static image, it will only remove question mark and link.
 *
 * @author Aleksandar Toplek
 */
function GlobalRemoveInGameHelp() {	
	console.log("GlobalRemoveInGameHelp - Removing in game help...");
	
	$("#ingameManual").remove();
	
	console.log("GlobalRemoveInGameHelp - In game help removed!");
};

/**
 * Calls all Build related functions.
 *
 * @author Aleksandar Toplek
 */
function GlobalInBuild() {
	console.log("GlobalInBuild - In buils calls...");
	
	chrome.extension.sendRequest({ category: "settings", name: "checkBuildResourceNeeded", action: "get" }, function (response) {
		console.log("GlobalInBuild - checkBuildResourceNeeded [" + response + "]");
		if (response === "On" | response == undefined) BuildCalculateResourcesDifference();
	});

	if ($(".gid17").length) BuildMarketCalls();
	
	console.log("GlobalInBuild - In build finished successfully!");
};

/**
 * Calls all Send troops related functions.
 *
 * @author Aleksandar Toplek
 */
function GlobalInSendTroops() {
	console.log("GlobalInSendTroops - In send troops calls...");
	
	chrome.extension.sendRequest({ category: "settings", name: "checkSendTroopsListMyVillages", action: "get" }, function (response) {
		console.log("GlobalInSendTroops - checkSendTroopsListMyVillages [" + response + "]")
		if (response === "On" | response == undefined) SendTroopsFillVillagesList();
	});
	
	console.log("GlobalInSendTroops - In send troops finished successfully!");
};

/**
 * Calculates resource difference.
 * A resource difference is between storage and cost.
 *
 * @author Aleksandar Toplek
 */
function BuildCalculateResourcesDifference() {
	// TODO: Seperate building cost and unit cost 
	// TODO: Unit cost should be difference between NUMBER units and storage
	console.log("BuildCalculateResourcesDifference - Calculating resource differences...");
	
	for (var index = 0; index < 4; index++) {
		var inWarehouse = parseInt($("#l" + (index + 1)).text().split("/")[0]);

		$("span[class*='resources r" + (index + 1) + "']").each(function (i) {
			var res = parseInt($(this).text());
			var diff = inWarehouse - res;
			var color = diff < 0 ? "#B20C08" : "#0C9E21";
			var div = "<div style='color:" + color + "'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(" + diff + ")</div>";
			
			$(this).append(div);
			
			console.log("BuildCalculateResourcesDifference - r" + (index + 1) + " diff[" + diff + "]");
		});
	}
	
	console.log("BuildCalculateResourcesDifference - Resource differences calculated!");
};

/**
 * Calls all marketplace related functions
 *
 * @author Aleksandar Toplek
 */
function BuildMarketCalls() {
	console.log("BuildMarketCalls - Marketplace calls...");
	
	var traderMaxTransport = BuildMarketGetTraderMaxTransport();
	var tradersAvailable = BuildMarketGetTradersAvailable();
	
	console.info("BuildMarketCalls - traderMaxTransport [" + traderMaxTransport + "]");
	console.info("BuildMarketCalls - tradersAvailable [" + tradersAvailable + "]");
	
	chrome.extension.sendRequest({ category: "settings", name: "checkMarketListMyVillages", action: "get" }, function (response) {
		console.log("BuildMarketCalls - checkMarketListMyVillages [" + response + "]");
		if (response === "On" | response == undefined) BuildMarketFillVillagesList();
	});

	BuildMarketAddTransportShortcuts(traderMaxTransport);

	chrome.extension.sendRequest({ category: "settings", name: "checkMarketShowJunkResource", action: "get" }, function (response) {
		console.log("BuildMarketCalls - checkMarketShowJunkResource [" + response + "]");
		if (response === "On" | response == undefined) {
			BuildMarketInsertJunkResourceTable();
			BuildMarketRegisterTimerFillInJunkResource(
				[tradersAvailable, traderMaxTransport]
			);
		}
	});
	
	chrome.extension.sendRequest({ category: "settings", name: "checkMarketShowSumIncomingResources", action: "get" }, function (response) {
		console.log("BuildMarketCalls - checkMarketShowSumIncomingResources [" + response + "]");
		if (response === "On" | response == undefined) BuildMarketIncomingSum();
	});
	
	console.log("BuildMarketCalls - Marketplace calls finished...");
};

/**
 * Registers an timer that calls BuildMarketFillInJunkResource multiple times
 *
 * @author Aleksandar Toplek
 */
function BuildMarketRegisterTimerFillInJunkResource(args) {
	window.setInterval(
		BuildMarketFillInJunkResource,
		CBuildMarketFillInJunkResourceTimerInterval,
		args);
		
	console.log("BuildMarketRegisterTimerFillInJunkResource - Timer set to interval [" + CBuildMarketFillInJunkResourceTimerInterval + "]")
};

// TODO: Comment function
// TODO: Log function
function BuildMarketInsertJunkResourceTable() {
	$(".send_res > tbody").append("<tr><td></td><td></td><td class='currentLoaded'>0 </td><td class='maxRes'>/ 0</td></tr><tr><td></td><td></td><td>Junk:</td><td class='junkAmount'>0 (0)</td></tr>");
};

// TODO: Comment function
// TODO: Log function
function BuildMarketFillInJunkResource(args) {
	// args
	// 		- 1: traderMaxTransport
	//		- 0: tradersAvailable

	var resMax = args[0] * args[1];
	var resSum = 0;
	var tradersNeeded = 0;

	var r1 = _getAttrNumber("#r1", "value");
	var r2 = _getAttrNumber("#r2", "value");
	var r3 = _getAttrNumber("#r3", "value");
	var r4 = _getAttrNumber("#r4", "value");

	resSum = r1 + r2 + r3 + r4;

	var tempRes = resSum;
	while (tempRes > 0) {
		tradersNeeded++;
		tempRes -= args[1];
	}

	var junkAmount = tradersNeeded * args[1] - resSum;

	if (tradersNeeded > args[0]) 
		$(".currentLoaded").attr("style", "color:red;");
	else $(".currentLoaded").attr("style", "");

	$(".currentLoaded").html(resSum + " ");
	$(".maxRes").html("/ " + resMax);
	$(".junkAmount").html((tradersNeeded > args[0] ? "NA" : junkAmount) + " (" + tradersNeeded + ")");
};

// TODO: Comment function
// TODO: Log function
function BuildMarketGetTradersAvailable() {
	var tradersSource = $("div[class*='traderCount'] > div:last").text();

	// NOTE: Regex code automated generator
	// http://txt2re.com/index-javascript.php3

	// Input sample: _16_/_22___... (where _ means space)
	// Return sample: 16 (integer)

	var p = new RegExp('(\\d+)', ["i"]);
	var result = p.exec(tradersSource);

	return parseInt(result[1]) || 0;
};

// TODO: Comment function
// TODO: Log function
function BuildMarketGetTraderMaxTransport() {
	return parseInt($(".send_res > tbody > tr:eq(0) > .max > a").text()) || 0;
};

// TODO: Comment function
// TODO: Log function
function BuildMarketFillVillagesList() {
	var selectData = GlobalGetVillagesList();
	var selectInput = _selectB("EnterVillageName", "text village", "dname");
	// TODO: Internationalization
	selectInput += _selectOption("(Please select village)");
	$.each(selectData, function (current, value) {
		selectInput += _selectOption(value.text);
	});
	selectInput += _selectE();
	
	$(".compactInput").html(selectInput);
};

// TODO: Comment function
// TODO: Log function
function BuildMarketAddTransportShortcuts(traderMaxTransport) {
	// SAMPLE: "<a href='#' onmouseup='add_res(1);' onclick='return false;'>1000</a>"

	for (var index = 0; index < 4; index++) {
		var addCall = "add_res(" + (index + 1) + ");";
		var strX1 = "/ <a href='#' onmouseup='" + addCall + "' onclick='return false;'>" + traderMaxTransport + "</a><br>";
		$(".send_res > tbody > tr:eq(" + index + ") > .max").html(strX1);
	}

	chrome.extension.sendRequest({ category: "settings", name: "checkMarketShowX2Shortcut", action: "get" }, function (response) {
		if (response === "On" | response == undefined) {
			for (var index = 0; index < 4; index++) {
				var addCall = "add_res(" + (index + 1) + ");";
				var strX2 = "/ <a href='#' onmouseup='" + addCall + addCall + "' onclick='return false;'>" + traderMaxTransport * 2 + "</a><br>";
				$(".send_res > tbody > tr:eq(" + index + ") > .max").append(strX2);
			}
		}
	});
};

/**
 * Puts table with resource sum of incoming trades to beginning
 *
 * @author Aleksandar Toplek
 */
function BuildMarketIncomingSum() {
	console.log("BuildMarketIncomingSum - Generating table...");
	
	var sum 		= [0, 0, 0, 0];
	var count 		= 0;
	var tableIndex 	= 0;
	
	var maxTime 	= 0; // Temp variable
	$(".traders").each(function(index) {
		var bodys = $(this).children("tbody");
		if (bodys.length === 2) {
			// Gets max time and timer name
			var timeSpan 	= $(bodys[0].children).children("td").children("div:first").children();
			var time 		= timeSpan.text();
			var timeSplit 	= time.split(":");
			var timeInteger = timeSplit[0] * 3600 + timeSplit[1] * 60 + timeSplit [2];
			
			if (timeInteger > maxTime) {
				maxTime 	= timeInteger;
				tableIndex 	= index;
				count++;
			}
			
			// Gets resources and sums it to total
			var res 		= $(bodys[1].children).children("td").children().text();
			var resSplit 	= res.split(" ");
			
			for (var i = 0; i < 4; ++i) {
				sum[i] += parseInt(resSplit[i + 1]);
			};
		}
	});
	
	// Checks if any incoming trade exists
	if (count > 0) {
		// Recreate table with custom text
		var sourceTable = $(".traders:eq(" + tableIndex + ")");
		
		var customTable = $(sourceTable.outerHTML());
	
		// Head customization
		customTable.children("thead").children().children().each(function(index) {
			if (index === 0) $(this).html("Total incoming");
			else $(this).html("Incoming from " + count + " villages");
		});
		
		customTable.children("tbody:first").children().children("td").children(".in").children().attr("id", "paIncomingSumTimer");
		
		// Resource customization
		customTable.children("tbody:last").children().children("td").children().html(
			"<img class='r1' src='img/x.gif' alt='wood'> " + sum[0] + "&nbsp;&nbsp;" + 
			"<img class='r2' src='img/x.gif' alt='clay'> " + sum[1] + "&nbsp;&nbsp;" + 
			"<img class='r3' src='img/x.gif' alt='iron'> " + sum[2] + "&nbsp;&nbsp;" + 
			"<img class='r4' src='img/x.gif' alt='crop'> " + sum[3] + "&nbsp;&nbsp;"
		);
		
		console.log("BuildMarketIncomingSum - Table generated! Appending table to beginning...");
		
		// Appends custom table to beginning
		$(".traders:first").before(customTable.outerHTML());
		
		console.log("BuildMarketIncomingSum - Table appended successfully! Asigning timer...");
		
		// Updates incoming left time every 100 ms to original table value
		setInterval(function() {
			$("#paIncomingSumTimer").text(
				sourceTable.children("tbody:first").children().children("td").children(".in").children().text());
		}, 100);
	}
	
	console.log("BuildMarketIncomingSum - Finished successfully!");
}

// TODO: Comment function
// TODO: Log function
function SendTroopsFillVillagesList() {
	var selectData = GlobalGetVillagesList();
	var selectInput = _selectB("enterVillageName", "text village", "dname");
	// TODO: Internationalization
	selectInput += _selectOption("(Please select city)");
	$.each(selectData, function(current, value) {
		selectInput += _selectOption(value.text);
	});
	selectInput += _selectE();
	
	$(".compactInput").html(selectInput);
};

// TODO: Comment function
function _getAttrNumber (element, attribute) {
	return _toInt(($(element)).attr(attribute)); 
}

// TODO: Comment function
function _toInt(value) {
	var num = parseInt(value);
	return isNaN(num) ? 0 : num;
};

// TODO: Comment function
function _selectB (_id, _class, _name) {
	return 	"<select " + 
			(_id == undefined 		? "" : "id='" 		+ _id 		+ "' ") + 
			(_class == undefined 	? "" : "class='" 	+ _class 	+ "' ") + 
			(_name == undefined 	? "" : "name='" 	+ _name 	+ "' ") + 
			">";
};

// TODO: Comment function
function _selectOption (_value, _id, _selected) {
	return "<option " + (_id == undefined ? "" : "id='" + _id + "' ") + (_selected == undefined ? "" : "selected") + ">" + _value + "</option>";
};

// TODO: Comment function
function _selectE () {
	return "</select>";
};

