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

// Global variables
//var CurrentURL = "/dorf1.php";

// Global constants
var CBuildMarketFillInJunkResourceTimerInterval = 250;

// Initialization of extension script (travian page modification)
Initialize();

// TODO: Comment function
function Initialize() {
	console.log("Initialize - Initializing...");
	var startTime = (new Date()).getTime();
	
	var pathname = PageGetPathname();
	PageProcessAll(pathname);
	
	var endTime = (new Date()).getTime();		
	console.log("Initialize - Finished successfully! (" + (endTime - startTime) + ")");
};

// TODO: Comment function
function PageGetPathname() {
	console.log("PageGetPathname - Reading current page...");
	
	var currentPath = window.location.pathname;
	
	console.log("PageGetPathname - Current page pathname [" + currentPath + "]");
	
	return currentPath;
};

// TODO: Comment function
function PageProcessAll(pathname) {
	console.log("PageProcessAll - Starting...");
	
	var where = PageGetWhere(pathname);
	
	console.log("PageProcessAll - Pathname [" + pathname + "] mathched with [" + where + "]");
	
	chrome.extension.sendRequest({ category: "settings", name: "checkGlobalRemoveInGameHelp", action: "get" }, function (response) {
		if (response === "On") GlobalRemoveInGameHelp()
	});

	if (where === "Build") GlobalInBuild();
	else if (where === "SendTroops") GlobalInSendTroops();
	else return;
};

// TODO: Comment function
function PageGetWhere(pathname) {
	if 		(pathname.match(/dorf1.php/gi)) return "VillageOut";
	else if (pathname.match(/dorf2.php/gi)) return "VillageIn";
	else if (pathname.match(/dorf3.php/gi)) return "VillageOverview";
	else if (pathname.match(/build.php/i)) 	return "Build";
	else if (pathname.match(/karte.php/gi)) return "Map";
	else if (pathname.match(/a2b.php/gi)) 	return "SendTroops";

	return undefined;
};

// TODO: Comment function
function GlobalGetVillagesList() {
	return $("div[id='villageList'] > div[class='list'] > ul > li[class*='entry'] > a[class!='active']");
};

// TODO: Comment function
function GlobalRemoveInGameHelp() {	
	$("#ingameManual").remove();
};

// TODO: Comment function
function GlobalInBuild() {
	chrome.extension.sendRequest({ category: "settings", name: "checkBuildResourceNeeded", action: "get" }, function (response) {
		if (response === "On") BuildCalculateResourcesDifference();
	});

	if ($(".gid17").length) BuildMarketCalls();
};

// TODO: Comment function
function GlobalInSendTroops() {
	chrome.extension.sendRequest({ category: "settings", name: "checkSendTroopsListMyVillages", action: "get" }, function (response) {
		if (response === "On") SendTroopsFillVillagesList();
	});
};

// TODO: Comment function
function BuildCalculateResourcesDifference() {
	for (var index = 0; index < 4; index++) {
		var inWarehouse = parseInt($("#l" + (index + 1)).text().split("/")[0]);

		$("span[class*='resources r" + (index + 1) + "']").each(function (i) {
			var res = parseInt($(this).text());
			var diff = inWarehouse - res;
			var color = diff < 0 ? "#B20C08" : "#0C9E21";
			var div = "<div style='color:" + color + "'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(" + diff + ")</div>";
			
			$(this).append(div);
		});
	}
};

// TODO: Comment function
function BuildMarketCalls() {
	var traderMaxTransport = BuildMarketGetTraderMaxTransport();
	var tradersAvailable = BuildMarketGetTradersAvailable();
	
	console.info("BuildMarketCalls - traderMaxTransport: " + traderMaxTransport);
	console.info("BuildMarketCalls - tradersAvailable: " + tradersAvailable);
	
	chrome.extension.sendRequest({ category: "settings", name: "checkMarketListMyVillages", action: "get" }, function (response) {
		if (response === "On") BuildMarketFillVillagesList();
	});

	BuildMarketAddTransportShortcuts(traderMaxTransport);

	chrome.extension.sendRequest({ category: "settings", name: "checkMarketShowJunkResource", action: "get" }, function (response) {
		if (response === "On") {
			BuildMarketInsertJunkResourceTable();
			BuildMarketRegisterTimerFillInJunkResource(
				[tradersAvailable, traderMaxTransport]
			);
		}
	});
};

// TODO: Comment function
function BuildMarketRegisterTimerFillInJunkResource(args) {
	window.setInterval(
		BuildMarketFillInJunkResource,
		CBuildMarketFillInJunkResourceTimerInterval,
		args);
};

// TODO: Comment function
function BuildMarketInsertJunkResourceTable() {
	$(".send_res > tbody").append("<tr><td></td><td></td><td class='currentLoaded'>0 </td><td class='maxRes'>/ 0</td></tr><tr><td></td><td></td><td>Junk:</td><td class='junkAmount'>0 (0)</td></tr>");
};

// TODO: Comment function
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
function BuildMarketGetTraderMaxTransport() {
	return parseInt($(".send_res > tbody > tr:eq(0) > .max > a").text()) || 0;
};

// TODO: Comment function
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
function BuildMarketAddTransportShortcuts(traderMaxTransport) {
	// SAMPLE: "<a href='#' onmouseup='add_res(1);' onclick='return false;'>1000</a>"

	for (var index = 0; index < 4; index++) {
		var addCall = "add_res(" + (index + 1) + ");";
		var strX1 = "/ <a href='#' onmouseup='" + addCall + "' onclick='return false;'>" + traderMaxTransport + "</a><br>";
		$(".send_res > tbody > tr:eq(" + index + ") > .max").html(strX1);
	}

	chrome.extension.sendRequest({ category: "settings", name: "checkMarketShowX2Shortcut", action: "get" }, function (response) {
		if (response === "On") {
			for (var index = 0; index < 4; index++) {
				var addCall = "add_res(" + (index + 1) + ");";
				var strX2 = "/ <a href='#' onmouseup='" + addCall + addCall + "' onclick='return false;'>" + traderMaxTransport * 2 + "</a><br>";
				$(".send_res > tbody > tr:eq(" + index + ") > .max").append(strX2);
			}
		}
	});
};

// TODO: Comment function
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

