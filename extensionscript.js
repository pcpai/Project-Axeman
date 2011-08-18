/*
	
	extensionscript.js
	
	by
	Aleksandar Toplek, 
	JustBuild 2011.
	
	This file is under FreeBSD license that
	can be found in README.txt that came
	with this code.
	  
*/

// Global variables
var MarketTraderMaxValue = 0;
var CurrentURL = "/dorf1.php";

// Global constants
var CMarketFillInJunkResourceTimerInterval = 250;

// Initialization of extension script (travian page modification)
Initialize();

function Initialize() {
	ReadCurrentPage();
	CheckPage();
}

function ReadCurrentPage() {
	CurrentURL = window.location.pathname;
}

function CheckPage() {
	var where = GetWhereInGame();

	if (where === "build") {
		InBuild();
	}
	else if (where === "sendTroops") {
		InSendTroops();
	}
}


function GetWhereInGame() {
	if (CurrentURL.match(/dorf1.php/gi)) return "villageOut";
	else if (CurrentURL.match(/dorf2.php/gi)) return "villageIn";
	else if (CurrentURL.match(/dorf3.php/gi)) return "villageOverview";
	else if (CurrentURL.match(/build.php/i)) return "build";
	else if (CurrentURL.match(/karte.php/gi)) return "map";
	else if (CurrentURL.match(/a2b.php/gi)) return "sendTroops";

	return "unknown";
}

function InBuild() {
	chrome.extension.sendRequest({ category: "settings", name: "checkBuildResourceNeeded", action: "get" }, function (response) {
		if (response === "On") CalculateResourcesDifference();
	});

	MarketCalls();
}

function CalculateResourcesDifference() {
	for (var index = 1; index < 5; index++) {
		var inWarehouse = parseInt($("#l" + index).text().split("/")[0]);

		$("span[class*='resources r" + index + "']").each(function (index) {
			var res = parseInt($(this).text());
			var diff = inWarehouse - res;
			var div = "<div style='color:" + (diff < 0 ? "#B20C08" : "#0C9E21");
			$(this).append(div + "'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(" + diff + ")</div>").text();
		});
	}
}

function MarketCalls() {
	chrome.extension.sendRequest({ category: "settings", name: "checkMarketListMyVillages", action: "get" }, function (response) {
		if (response === "On") MarketFillVillagesList();
	});

	MarketAddMoreFillInChoices();

	chrome.extension.sendRequest({ category: "settings", name: "checkMarketShowJunkResource", action: "get" }, function (response) {
		if (response === "On") RegisterMarketFillInJunkResourceTimer();
	});
}

function RegisterMarketFillInJunkResourceTimer() {
	window.setInterval(
		MarketFillInJunkResource,
		CMarketFillInJunkResourceTimerInterval);

	$("table[class='send_res'] > tbody").append("<tr><td></td><td></td><td class='currentLoaded'>0 </td><td class='maxRes'>/ 0</td></tr><tr><td></td><td></td><td>Junk:</td><td class='junkAmount'>0 (0)</td></tr>");
}

function MarketFillInJunkResource() {
	var tradersAvailable = GetTradersAvailableNumber();

	var resMax = tradersAvailable * MarketTraderMaxValue;
	var resSum = 0;

	var r1 = parseInt(($("#r1")).attr("value"));
	var r2 = parseInt(($("#r2")).attr("value"));
	var r3 = parseInt(($("#r3")).attr("value"));
	var r4 = parseInt(($("#r4")).attr("value"));

	r1 = isNaN(r1) ? 0 : r1;
	r2 = isNaN(r2) ? 0 : r2;
	r3 = isNaN(r3) ? 0 : r3;
	r4 = isNaN(r4) ? 0 : r4;

	resSum = r1 + r2 + r3 + r4;

	var tradersNeeded = 0;
	var tempRes = resSum;
	while (tempRes > 0) {
		tradersNeeded++;
		tempRes -= MarketTraderMaxValue;
	}

	var junkAmount = tradersNeeded * MarketTraderMaxValue - resSum;

	if (tradersNeeded > tradersAvailable) 
		$("td[class='currentLoaded']").attr("style", "color:red;");
	else $("td[class='currentLoaded']").attr("style", "");

	$("td[class='currentLoaded']").html(resSum + " ");
	$("td[class='maxRes']").html("/ " + resMax);
	$("td[class='junkAmount']").html(junkAmount + " (" + tradersNeeded + ")");
}

function GetTradersAvailableNumber() {
	var tradersSource = $("div[class*='traderCount'] > div:last").text();

	// NOTE: Regex code automated generator
	// http://txt2re.com/index-javascript.php3

	// Input sample: _16_/_22___... (where _ means space)
	// Return sample: 16 (integer)

	var re1 = '(\\d+)'; // Integer Number 1
	var p = new RegExp(re1, ["i"]);
	var result = p.exec(tradersSource);

	return result[1];
}

function MarketFillVillagesList() {
	// gid17 - market id
	if ($("div[class='gid17']").length) {
		var selectSource = "<select id='enterVillageName' class='text village' name='dname' tabindex='5'><option selected>(please select city)</option>";
		var selectData = GetVillagesList();
		$.each(selectData, function (current, val) {
			selectSource = selectSource + "<option>" + val.text + "</option>";
		});
		$("td[class='compactInput']").html(selectSource + "</select>");
	}
}

function MarketAddMoreFillInChoices() {
	MarketTraderMaxValue = $("table[class='send_res'] > tbody > tr:eq(0) > td[class='max'] > a").text();
	if (MarketTraderMaxValue.length) {
		// SAMPLE: "<a href='#' onmouseup='add_res(1);' onclick='return false;'>1000</a>"

		for (var index = 0; index < 4; index++) {
			var addCall = "add_res(" + (index + 1) + ");";
			var strX1 = "/ <a href='#' onmouseup='" + addCall + "' onclick='return false;'>" + MarketTraderMaxValue + "</a><br>";
			$("table[class='send_res'] > tbody > tr:eq(" + index + ") > td[class='max']").html(strX1);
		}

		chrome.extension.sendRequest({ category: "settings", name: "checkMarketShowX2Shortcut", action: "get" }, function (response) {
			if (response === "On") {
				for (var index = 0; index < 4; index++) {
					var addCall = "add_res(" + (index + 1) + ");";
					var strX2 = "/ <a href='#' onmouseup='" + addCall + addCall + "' onclick='return false;'>" + MarketTraderMaxValue * 2 + "</a><br>";
					$("table[class='send_res'] > tbody > tr:eq(" + index + ") > td[class='max']").append(strX2);
				}
			}
		});
		/*
		chrome.extension.sendRequest({ category: "settings", name: "checkMarketShowXAllShortcut", action: "get" }, function (response) {
			if (response === "On") {
				for (var index = 0; index < 4; index++) {
					var addCall = "add_res(" + (index + 1) + ");";
					var strXAll = "/ <a href='#' onmouseup='" + addCall + addCall + addCall + "' onclick='return false;'>" + MarketTraderMaxValue * 3 + "</a><br>";
					$("table[class='send_res'] > tbody > tr:eq(" + index + ") > td[class='max']").append(strXAll);
				}
			}
		});
		*/
	}
}

function GetVillagesList() {
	return $("div[id='villageList'] > div[class='list'] > ul > li[class*='entry'] > a[class!='active']");
}

function InSendTroops() {
	chrome.extension.sendRequest({ category: "settings", name: "checkSendTroopsListMyVillages", action: "get" }, function (response) {
		if (response === "On") SendTroopsAddMoreFillInChoices();
	});
}

function SendTroopsAddMoreFillInChoices() {
	if ($("div[class='a2b']").length) {
		var selectSource = "<select id='enterVillageName' class='text village' name='dname'><option selected>(please select city)</option>";
		var selectData = GetVillagesList();
		$.each(selectData, function (current, val) {
			selectSource = selectSource + "<option>" + val.text + "</option>";
		});
		$("td[class='compactInput']").html(selectSource + "</select>");
	}
}
