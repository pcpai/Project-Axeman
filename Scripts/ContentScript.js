/*

    ContentScript.json

    by
    Aleksandar Toplek,
    JustBuild 2011.

    LICENSE: 

        Copyright 2011 JustBuild Development. All rights reserved.

        Redistribution and use in source and binary forms, with or without 
        modification, are permitted provided that the following conditions 
        are met:

            1. Redistributions of source code must retain the above copyright 
               notice, this list of conditions and the following disclaimer.

            2. Redistributions in binary form must reproduce the above copyright 
               notice, this list of conditions and the following disclaimer in 
               the documentation and/or other materials provided with the 
               distribution.

        THIS SOFTWARE IS PROVIDED BY JUSTBUILD DEVELOPMENT ''AS IS'' AND ANY 
        EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
        IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR 
        PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JUSTBUILD DEVELOPMENT OR
        CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
        EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, 
        PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR 
        PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
        LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
        NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS 
        SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

        The views and conclusions contained in the software and documentation 
        are those of the authors and should not be interpreted as representing 
        official policies, either expressed or implied, of JustBuild Development

*/

//
// Global variables
//
var dev = true;
var settingsLoaded = 0;
var settingsAvailable = 9;
var startTime = 0;
// Settings
var checkGlobalRemoveInGameHelp;
var checkGlobalStorageOverflowTimeout;
var checkBuildBuildingResourceDifference;
var checkBuildUnitResourceDifference;
var checkMarketShowX2Shortcut;
var checkMarketListMyVillages;
var checkMarketShowJunkResource;
var checkMarketShowSumIncomingResources;
var checkSendTroopsListMyVillages;

//
// Global constants
//

// Initialization of extension script (travian page modification)
init();

/**
 * Initializes all extension functions
 *
 * @author Aleksandar Toplek
 */
function init() {
	if (dev) console.log("init - Initializing...");
    startTime = (new Date()).getTime();
	
    if (dev) console.log("init - Waiting for settings (0/" + settingsAvailable + ")");
    
    pageLoadSettings();
    
    /*
    var prevState = 0;
    while(settingsLoaded != settingsAvailable) { 
    	if (prevState != settingsLoaded) {
    		prevState = settingsLoaded;
    		if (dev) console.log("init - Waiting for settings (" + settingsLoaded + "/" + settingsAvailable + ")");
    	}
    }
    */
    
    // Initial settings configuration
    //globalInitializeSettings();
	
    // Calls for PageAction show
    chrome.extension.sendRequest({
        category: "extension", 
        name: "showActionPageMenu", 
        action: "set"
    }, function () { });
	
    //initPages();

    //var endTime = (new Date()).getTime();
    //if (dev) console.log("init - Finished successfully! (" + (endTime - startTime) + ")");
}

/**
 * Requests for all settings to load
 * 
 * @author Aleksandar Toplek
 */
function pageLoadSettings() {
	requestSetting("checkGlobalRemoveInGameHelp");
	requestSetting("checkGlobalStorageOverflowTimeout");
	requestSetting("checkBuildBuildingResourceDifference");
	requestSetting("checkBuildUnitResourceDifference");
	requestSetting("checkMarketShowX2Shortcut");
	requestSetting("checkMarketListMyVillages");
	requestSetting("checkMarketShowJunkResource");
	requestSetting("checkMarketShowSumIncomingResources");
	requestSetting("checkSendTroopsListMyVillages");
}

/**
 * Gets setting and sets it to variable
 * 
 * @author Aleksandar Toplek
 * 
 * @param {String} _settingName Name of setting to retrieve
 */
function requestSetting(_settingName) {
    chrome.extension.sendRequest({
        category: "settings", 
        name: _settingName, 
        action: "get"//, 
        //value: value
    }, function (response) { 
    	settingsLoaded++;
    	console.warn(_settingName + "[" + response + "]");
    	eval(_settingName + " = '" + response + "';");
    	
    	if (dev) console.log("init - Waiting for settings (" + settingsLoaded + "/" + settingsAvailable + ")");
    	if (settingsLoaded === settingsAvailable) {
    		initPages();
    	}
    });
}

/**
 * Initializing page actions
 * 
 * @author Aleksandar Toplek
 */
function initPages() {
    var pathname = pageGetPathname();
    pageProcessAll(pathname);	
    
    var endTime = (new Date()).getTime();
    if (dev) console.log("init - Finished successfully! (" + (endTime - startTime) + ")");
}

/**
 * Pathname of current page.
 *
 * @author Aleksandar Toplek
 *
 * @return {String} Returns an pathname of current web page without query.
 */
function pageGetPathname() {
    if (dev) console.log("PageGetPathname - Reading current page...");
	
    var currentPath = window.location.pathname;
	
    if (dev) console.log("PageGetPathname - Current page pathname [" + currentPath + "]");
	
    return currentPath;
}

/**
 * Runs all scripts that changes page content.
 * This should be called after all information is retrieved from page.
 *
 * @author Aleksandar Toplek
 * 
 * @param {String} pathname Pathname of current page
 */
function pageProcessAll(pathname) {
    if (dev) console.log("PageProcessAll - Starting...");
	
    var where = pageGetWhere(pathname);
	
    if (dev) console.log("PageProcessAll - Pathname [" + pathname + "] mathched with [" + where + "]");
	
    if (checkGlobalRemoveInGameHelp === "On" | checkGlobalRemoveInGameHelp == undefined) 
    	globalRemoveInGameHelp();

    if (checkGlobalStorageOverflowTimeout === "On" | checkGlobalStorageOverflowTimeout == undefined) 
    	globalOverflowTimer();

    if (where === "Build") globalInBuild();
    else if (where === "SendTroops") globalInSendTroops();
    else return;
}

/**
 * Determines where in gameplay current page is.
 *
 * @author Aleksandar Toplek
 *
 * @return {String} Returns a name of gameply part.
 *					(e.g. Map, SendTroops, VillageIn, ...)
 */
function pageGetWhere(pathname) {
    if      (pathname.match(/dorf1.php/gi)) return "VillageOut";
    else if (pathname.match(/dorf2.php/gi)) return "VillageIn";
    else if (pathname.match(/dorf3.php/gi)) return "VillageOverview";
    else if (pathname.match(/build.php/i))  return "Build";
    else if (pathname.match(/karte.php/gi)) return "Map";
    else if (pathname.match(/a2b.php/gi))   return "SendTroops";

    return undefined;
}

/**
 * Filters all villages from right village list and only returns non active ones.
 *
 * @author Aleksandar Toplek
 *
 * @return {Array} Returns array of 'a' elemets with href to village view and name in text.
 */
function globalGetVillagesList() {
    if (dev) console.log("GlobalGetVillagesList - Getting village list...");
	
    var villagesList = $("div[id='villageList'] > div[class='list'] > ul > li[class*='entry'] > a[class!='active']");
	
    if (dev) console.log("GlobalGetVillagesList - Village list: " + villagesList);
    return villagesList;
}

/**
 * Removes in game help link from every travian page.
 * On some servers this wont remove stone and book since they are
 * on one static image, it will only remove question mark and link.
 *
 * @author Aleksandar Toplek
 */
function globalRemoveInGameHelp() {	
    if (dev) console.log("GlobalRemoveInGameHelp - Removing in game help...");
	
    $("#ingameManual").remove();
	
    if (dev) console.log("GlobalRemoveInGameHelp - In game help removed!");
}

/**
 * Informs about warehouse and granary overflow
 * 
 * @author Aleksandar Toplek
 */
function globalOverflowTimer() {
    if (dev) console.log("GlobalOverflowTimer - Initializing...");
	
    var perHour 	= [0, 0, 0, 0];
    var  scriptText = $("script:contains('resources.production')").text();

    // From http://txt2re.com/index-javascript.php3?s=resources.production%20=%20{%20%27l1%27:%201250,%27l2%27:%201500,%27l3%27:%201250,%27l4%27:%20508};&15&13&12&11&17
    // Gets resource production from <script /> element in page
    var re = '.*?\\d+.*?(\\d+).*?\\d+.*?(\\d+).*?\\d+.*?(\\d+)+.*?\\d+.*?(\\d+)';
    var p = new RegExp(re, ["i"]);
    var m = p.exec(scriptText);
    if (m != null) {
        perHour[0] = m[1];
        perHour[1] = m[2];
        perHour[2] = m[3];
        perHour[3] = m[4];
	
        if (dev) console.log("GlobalOverflowTimer - Resources per hour: " + perHour[0] + " " + perHour[1] + " " + perHour[2] + " " + perHour[3]);
    }
	
    $("#res").children().each(function(index) {
        // Skips crop consumption
        if (index !== 4) {
            var current 	= globalGetWarehousAmount(index + 1);
            var max 		= globalGetWarehousMax(index + 1);
            var timeLeft 	= (max - current) / perHour[index];
	
            if (dev) console.log("GlobalOverflowTimer - l" + (index + 1) + " appended!");
			
            $(this).append("<div style='background-color: #EFF5FD;'><b><p id='paResourceOverflowTime" + index + "' style='text-align: right;'>" + _hoursToTime(timeLeft) + "</p></b></div>");
        }
    });
    
    setInterval(globalOverflowTimerFunction, 1000);
    if (dev) console.log("GlobalOverflowTimer - Timer registered!");
            
    if (dev) console.log("GlobalOverflowTimer - Finished!");
}

/**
 * Called by GlobalOverflow timer
 *
 * @author Aleksandar Toplek
 */
function globalOverflowTimerFunction() {
    for (var index = 0; index < 4; index++) {
        $("#paResourceOverflowTime" + index).each(function() {
            // Get current time from element
            var hours = _timeToHours($(this).text());
            
            //console.warn("l" + (index + 1) + "   " + $(this).text() + "    " + hours);
            
            // Not updating if 00:00:00
            if (hours > 0) { 
                // Subtracts one second and writes new text to element
                hours -= 0.0002777006777777; // 1 s -> 1/~3600 (3601 because of calculation error)
                $(this).text(_hoursToTime(hours));
            }

            // Changes element style (color) depending on current time state
            if (hours < 0.75) $(this).attr("style", "text-align: right; color:#B20C08;");
            else if (hours < 2) $(this).attr("style", "text-align: right; color:#FFCC33;");
            else $(this).attr("style", "text-align: right; color:black;");
        });
    }
}

/**
 * Warehouse current amount of [index] resource
 *
 * @author Aleksandar Toplek
 *
 * @param {Number} 	index 	An index of resource
 * 							1 for wood, 2 for clay, 3 for iron, 4 for crop
 *
 * @return {Number} 		Returns an amount of resource currently in storage 
 */
function globalGetWarehousAmount(index) {
    return parseInt(globalGetWarehousInfo(index).split("/")[0], 10);
}

/**
 * Warehouse maximum amount of [index] resource
 *
 * @author Aleksandar Toplek
 *
 * @param {Number} 	index 	An index of resource
 * 							1 for wood, 2 for clay, 3 for iron, 4 for crop
 *
 * @return {Number} 		Returns maximum amount of resource that could be stored in storage 
 */
function globalGetWarehousMax(index) {
    return parseInt(globalGetWarehousInfo(index).split("/")[1], 10);
}

/**
 * Warrehouse info about [index] resource
 *
 * @author Aleksandar Toplek
 *
 * @param {Number} 	index 	An index of resource
 * 							1 for wood, 2 for clay, 3 for iron, 4 for crop
 *
 * @return {Number} 		Returns an amount of resource currently in storage 
 */
function globalGetWarehousInfo(index) {
    return $("#l" + (index)).text();
}

/**
 * Calls all Build related functions.
 *
 * @author Aleksandar Toplek
 */
function globalInBuild() {
    if (dev) console.log("GlobalInBuild - In buils calls...");
	
    if (checkBuildBuildingResourceDifference === "On" | checkBuildBuildingResourceDifference == undefined) 
    	buildCalculateBuildingResourcesDifference();
    
    if (checkBuildUnitResourceDifference === "On" | checkBuildUnitResourceDifference == undefined) 
    	buildCalculateUnitResourcesDifference();

    if ($(".gid17").length) buildMarketCalls();
	
    if (dev) console.log("GlobalInBuild - In build finished successfully!");
}

/**
 * Calls all Send troops related functions.
 *
 * @author Aleksandar Toplek
 */
function globalInSendTroops() {
    if (dev) console.log("GlobalInSendTroops - In send troops calls...");
	
    if (checkSendTroopsListMyVillages === "On" | checkSendTroopsListMyVillages == undefined) 
    	sendTroopsFillVillagesList();
	
    if (dev) console.log("GlobalInSendTroops - In send troops finished successfully!");
}

/**
 * Calculates resource difference.
 * A resource difference is between storage and cost.
 *
 * @author Aleksandar Toplek
 */
function buildCalculateBuildingResourcesDifference() {
    if (dev) console.log("buildCalculateBuildingResourcesDifference - Calculating building resource differences...");
    
    for (var rindex = 0; rindex < 4; rindex++) {
        var inWarehouse = globalGetWarehousAmount(rindex + 1);
        
        // Building cost
        // .costs are for town hall celebration
        // .contractCosts are for building/upgreding building
        $(".contractCosts > div > span[class*='resources r" + (rindex + 1) + "'],.costs > div > span[class*='resources r" + (rindex + 1) + "']").each(function() {
            var res = parseInt($(this).text(), 10);
            var diff = inWarehouse - res;
            var color = diff < 0 ? "#B20C08" : "#0C9E21";
            var div = "<div style='color:" + color + "'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(" + diff + ")</div>";

            $(this).append(div);

            if (dev) console.log("buildCalculateBuildingResourcesDifference - r" + (rindex + 1) + " diff[" + diff + "]");
        });        
    }
    
    if (dev) console.log("buildCalculateBuildingResourcesDifference - Building resource differences calculated!");
}

/**
 * Info about untit and storage resource difference
 * 
 * @author Aleksandar Toplek
 */
function buildCalculateUnitResourcesDifference() {
    if (dev) console.log("buildCalculateUnitResourcesDifference - Calculating unit resource difference...");
    
    var inputs = $("input[name*='t']");
    var costs = $(".details > .showCosts");

    for (var rindex = 0; rindex < 4; rindex++) {
        inputs.each(function(iindex) {
            $(costs[iindex]).children("span[class*='resources r" + (rindex + 1) + "']").append(
                "<div id='paUnitCostDifferenceI" + iindex + "R" + rindex + "' style='color:#0C9E21'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(0)</div>");
        });
    }
    
    setInterval(buildCalculateUnitResourcesDifferenceTimerFunction, 250, [inputs, costs]);
    
    if (dev) console.log("buildCalculateUnitResourcesDifference - Timer registerd!");
    
    if (dev) console.log("buildCalculateUnitResourcesDifference - Unit resource differences calculated!");
}

/**
 * Called by buildCalculateUnitResourceDifference timer
 * Function that actualy changes and calculates values
 * 
 * @author Aleksandar Toplek
 * 
 * @param {Array} args  Index 0 represents unit inputs
 *                      Index 1 represents unit cost
 */
function buildCalculateUnitResourcesDifferenceTimerFunction(args) { 
    for (var rindex = 0; rindex < 4; rindex++) {
        var inWarehouse = globalGetWarehousAmount(rindex + 1);

        args[0].each(function(iindex) {
            var res = parseInt($(args[1][iindex]).children("span[class*='resources r" + (rindex + 1) + "']").text(), 10);
            var diff = inWarehouse - (res * parseInt($(this).attr("value") || 0, 10));
            var color = diff < 0 ? "#B20C08" : "#0C9E21";
            $("#paUnitCostDifferenceI" + iindex + "R" + rindex ).html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(" + diff + ")");
            $("#paUnitCostDifferenceI" + iindex + "R" + rindex ).attr("style", "color:" + color);
        });
    }
}

/**
 * Calls all marketplace related functions
 *
 * @author Aleksandar Toplek
 */
function buildMarketCalls() {
    if (dev) console.log("BuildMarketCalls - Marketplace calls...");
	
    var traderMaxTransport = buildMarketGetTraderMaxTransport();
    var tradersAvailable = buildMarketGetTradersAvailable();
	
    console.info("BuildMarketCalls - traderMaxTransport [" + traderMaxTransport + "]");
    console.info("BuildMarketCalls - tradersAvailable [" + tradersAvailable + "]");
	
    if (checkMarketListMyVillages === "On" | checkMarketListMyVillages == undefined) 
    	buildMarketFillVillagesList();

    buildMarketAddTransportShortcuts(traderMaxTransport);

    if (checkMarketShowJunkResource === "On" | checkMarketShowJunkResource == undefined) {
        buildMarketInsertJunkResourceTable();
        buildMarketRegisterTimerFillInJunkResource([tradersAvailable, traderMaxTransport]);
    }
	
    if (checkMarketShowSumIncomingResources === "On" | checkMarketShowSumIncomingResources == undefined) 
    	buildMarketIncomingSum();

    if (dev) console.log("BuildMarketCalls - Marketplace calls finished...");
}

/**
 * Registers an timer that calls buildMarketFillInJunkResource multiple times
 *
 * @author Aleksandar Toplek
 */
function buildMarketRegisterTimerFillInJunkResource(args) {
    setInterval(
        buildMarketFillInJunkResource,
        250,
        args);
		
    if (dev) console.log("BuildMarketRegisterTimerFillInJunkResource - Timer set to interval [250]");
}

/**
 * Inserts JunkResource rows in the end of resource selection table
 * 
 * @author Aleksandar Toplek
 */
function buildMarketInsertJunkResourceTable() {
    if (dev) console.log("buildMarketInsertJunkResourceTable - Inserting Junk resources table...");
    
    $(".send_res > tbody").append("<tr><td></td><td></td><td class='currentLoaded'>0 </td><td class='maxRes'>/ 0</td></tr><tr><td></td><td></td><td>Junk:</td><td class='junkAmount'>0 (0)</td></tr>");
    
    if (dev) console.log("buildMarketInsertJunkResourceTable - Junk resources table inserted successfully...");
}

/**
 * Called by FillInJunkResource timer
 * Actualy caltulates and fills values of pre-inserted table
 * 
 * @author Aleksandar Toplek
 * 
 * @param {Array} args  1 represents trader maximal transport amount
 *                      0 represents how mush traders is available
 */
function buildMarketFillInJunkResource(args) {
    var resMax = args[0] * args[1];
    var resSum = 0;
    var tradersNeeded = 0;

    // Get input values
    var r1 = _getAttrNumber("#r1", "value");
    var r2 = _getAttrNumber("#r2", "value");
    var r3 = _getAttrNumber("#r3", "value");
    var r4 = _getAttrNumber("#r4", "value");

    // Calulate sum of values
    resSum = r1 + r2 + r3 + r4;

    // Calculates min number of traders needed for transport
    var tempRes = resSum;
    while (tempRes > 0) {
        tradersNeeded++;
        tempRes -= args[1];
    }

    // Calculates junk amount
    var junkAmount = tradersNeeded * args[1] - resSum;

    // Styles of row (indicating too much resource requested / more traders needed)
    if (tradersNeeded > args[0]) 
        $(".currentLoaded").attr("style", "color:red;");
    else $(".currentLoaded").attr("style", "");

    // Changes value of pre-inserted rows
    $(".currentLoaded").html(resSum + " ");
    $(".maxRes").html("/ " + resMax);
    $(".junkAmount").html((tradersNeeded > args[0] ? "NA" : junkAmount) + " (" + tradersNeeded + ")");
}

/**
 * Looks for value of available traders
 * 
 * @author Aleksandar Toplek
 * 
 * @return {Number} Available traders or 0 if undefined
 */
function buildMarketGetTradersAvailable() {
    if (dev) console.log("buildMarketGetTradersAvailable - Started...");
    
    var tradersSource = $("div[class*='traderCount'] > div:last").text();

    // NOTE: Regex code automated generator
    // http://txt2re.com/index-javascript.php3

    // Input sample: _16_/_22___... (where _ means space)
    // Return sample: 16 (integer)

    var p = new RegExp('(\\d+)', ["i"]);
    var result = p.exec(tradersSource);
    
    if (dev) console.log("buildMarketGetTradersAvailable - Finished! Traders available [" + result[1] + "]");

    return parseInt(result[1], 10) || 0;
}

/**
 * Gets how mush one trader can transport
 * 
 * @author Aleksandar Toplek
 * 
 * @return {Number} Trader maximal resource transport or 0 if undefined
 */
function buildMarketGetTraderMaxTransport() {
    return parseInt($(".send_res > tbody > tr:eq(0) > .max > a").text() || 0, 10);
}

/**
 * Replaces market village name text box with selection of players villages
 * 
 * @author Aleksandar Toplek
 */
function buildMarketFillVillagesList() {
    if (dev) console.log("buildMarketFillVillagesList - Started...");
    
    // Gets data
    var selectData = globalGetVillagesList();
    var selectInput = _selectB("EnterVillageName", "text village", "dname");
    
    if (dev) console.log("buildMarketFillVillagesList - Generating selection...");
    
    // Generated select tag
    selectInput += _selectOption(_gim("TravianSelectVillage"));
    $.each(selectData, function (current, value) {
        selectInput += _selectOption(value.text);
    });
    selectInput += _selectE();
    
    if (dev) console.log("buildMarketFillVillagesList - Selection generated!;");
    
    // Replaces textbox with selectionbox (drop-down)
    $(".compactInput").html(selectInput);
    
    if (dev) console.log("buildMarketFillVillagesList - Textbox successfully replaced!");
}

/**
 * Adds resource shortcuts (e.g. 1x, 2x traders maximal transport amount)
 * 
 * @author Aleksandar Toplek
 * 
 * @param {Number} traderMaxTransport Trader maximum resource transport amount
 */
function buildMarketAddTransportShortcuts(traderMaxTransport) {
    if (dev) console.log("buildMarketAddTransportShortcuts - Started...");
    
    // SAMPLE: "<a href='#' onmouseup='add_res(1);' onclick='return false;'>1000</a>"

    if (dev) console.log("buildMarketAddTransportShortcuts - Adding 1x shortcut");
    // 1x shortcut
    for (var index = 0; index < 4; index++) {
        var addCall = "add_res(" + (index + 1) + ");";
        var strX1 = "/ <a href='#' onmouseup='" + addCall + "' onclick='return false;'>" + traderMaxTransport + "</a><br>";
        $(".send_res > tbody > tr:eq(" + index + ") > .max").html(strX1);
    }

    if (dev) console.log("buildMarketAddTransportShortcuts - 1x shortcud added!");
    if (dev) console.log("buildMarketAddTransportShortcuts - Adding 2x shortcut");
    // 2x shortcut
    if (checkMarketShowX2Shortcut === "On" | checkMarketShowX2Shortcut == undefined) {
        for (var index = 0; index < 4; index++) {
            var addCall = "add_res(" + (index + 1) + ");";
            var strX2 = "/ <a href='#' onmouseup='" + addCall + addCall + "' onclick='return false;'>" + traderMaxTransport * 2 + "</a><br>";
            $(".send_res > tbody > tr:eq(" + index + ") > .max").append(strX2);
        }
        if (dev) console.log("buildMarketAddTransportShortcuts - 1x shortcud added!");
    }
    
    if (dev) console.log("buildMarketAddTransportShortcuts - Finished successfully!");
}

/**
 * Puts table with resource sum of incoming trades to beginning
 *
 * @author Aleksandar Toplek
 */
function buildMarketIncomingSum() {
    if (dev) console.log("BuildMarketIncomingSum - Generating table...");
    // FIXME: Incoming not scaned properly
	
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
                sum[i] += parseInt(resSplit[i + 1], 10);
            }
        }
    });
	
    // Checks if any incoming trade exists
    if (count > 0) {
        // Recreate table with custom text
        var sourceTable = $(".traders:eq(" + tableIndex + ")");
		
        var customTable = $(sourceTable.outerHTML());
	
        // Head customization
        customTable.children("thead").children().children().each(function(index) {
            if (index === 0) $(this).html(_gim("TravianTotalIncoming"));
            else $(this).html(_gim("TravianIncomingFrom") + " " + count + " " + _gim("TravianVillagesLC"));
        });
		
        customTable.children("tbody:first").children().children("td").children(".in").children().attr("id", "paIncomingSumTimer");
		
        // Resource customization
        customTable.children("tbody:last").children().children("td").children().html(
            "<img class='r1' src='img/x.gif' alt='wood'> " + sum[0] + "&nbsp;&nbsp;" + 
            "<img class='r2' src='img/x.gif' alt='clay'> " + sum[1] + "&nbsp;&nbsp;" + 
            "<img class='r3' src='img/x.gif' alt='iron'> " + sum[2] + "&nbsp;&nbsp;" + 
            "<img class='r4' src='img/x.gif' alt='crop'> " + sum[3] + "&nbsp;&nbsp;"
            );
		
        if (dev) console.log("BuildMarketIncomingSum - Table generated! Appending table to beginning...");
		
        // Appends custom table to beginning
        $(".traders:first").before(customTable.outerHTML());
		
        if (dev) console.log("BuildMarketIncomingSum - Table appended successfully! Asigning timer...");
		
        // Updates incoming left time every 100 ms to original table value
        setInterval(function() {
            $("#paIncomingSumTimer").text(
                sourceTable.children("tbody:first").children().children("td").children(".in").children().text());
        }, 100);
    }
	
    if (dev) console.log("BuildMarketIncomingSum - Finished successfully!");
}

/**
 * Replaces SendToops village name text box with selection of players villages
 * 
 * @author Aleksandar Toplek
 */
function sendTroopsFillVillagesList() {
    if (dev) console.log("sendTroopsFillVillagesList - Started...");
    
    var selectData = globalGetVillagesList();
    var selectInput = _selectB("enterVillageName", "text village", "dname");
    
    if (dev) console.log("sendTroopsFillVillagesList - Generating selection...");
    
    selectInput += _selectOption(_gim("TravianSelectVillage"));
    $.each(selectData, function(current, value) {
        selectInput += _selectOption(value.text);
    });
    selectInput += _selectE();
    
    if (dev) console.log("sendTroopsFillVillagesList - Selection generated!");
    if (dev) console.log("sendTroopsFillVillagesList - Appending table...");
    
    $(".compactInput").html(selectInput);
    
    if (dev) console.log("sendTroopsFillVillagesList - Finished successfully!");
}

/**
 * Transforms given time string into hours number
 * 
 * @author Aleksandar Toplek
 * 
 * @param {String} time     Time as string
 * 
 * @return {Number} Hours as number
 *                  For input [02:19:59] output would be [2.333055555555556]
 */
function _timeToHours(time) {
    var split = time.split(":");
	
    var hours = parseInt(split[0], 10) + (parseInt(split[1], 10) / 60) + (parseInt(split[2], 10) / 3600);
    //console.warn(time + "    {" + split + "} =>  " + hours + " split(0)" + parseInt(split[0], 10) + " split(1)" + parseInt(split[1], 10) + " split(2)" + parseInt(split[2], 10));
	
    return hours;
}

/**
 * Transforms given hours number to time string
 * 
 * @author Aleksandar Toplek
 * 
 * @param {Number} hours    Number representing hours (e.g. 1.253343333, ...)
 * 
 * @return {String} Time as string
 *                  For input [2.333055555555556] output would be [02:19:59]
 *                  
 * @private
 */
function _hoursToTime(hours) {
	
    var _hours = hours;
    _hours = Math.floor(_hours);
    hours -= _hours;
    hours *= 60;
	
    var _minutes = hours; 
    _minutes = Math.floor(_minutes);
    hours -= _minutes;
    hours *= 60;
	
    var _seconds = parseInt(hours, 10);
    //_seconds = Math.floor(_seconds);
	
    return 	(_hours < 10 ? '0' + _hours : _hours) + ":" + 
    (_minutes < 10 ? '0' + _minutes : _minutes) + ":" + 
    (_seconds < 10 ? '0' + _seconds : _seconds);
}

/**
 * Trys to parse given attribute to Number
 * 
 * @author Aleksandar Toplek
 * 
 * @param {Object} _element     Elemet with wanted attribute
 * @param {object} _attribute   Attribute to parse
 * 
 * @return {Number} Number or 0 if attribute is NaN
 * 
 * @private
 */
function _getAttrNumber (_element, _attribute) {
    return _toInt(($(_element)).attr(_attribute)); 
}

/**
 * Trys to parse given value to Number
 * 
 * @author Aleksandar Toplek
 * 
 * @param {Object} value Value to try parse
 * 
 * @return {Number} Number or 0 if value is NaN
 * 
 * @private 
 */
function _toInt(value) {
    var num = parseInt(value, 10);
    return isNaN(num) ? 0 : num;
}

/**
 * (Helper) Selection element begining tag
 * 
 * @author Aleksandar Toplek
 * 
 * @param {String}  _id     ID attribute
 * @param {String}  _class  Class attribute
 * @param {String}  _name   Name attribute
 * 
 * @return {String} Selection begning tag (e.g. <select ...>)
 * 
 * @private
 */
function _selectB (_id, _class, _name) {
    return 	"<select " + 
    (_id == undefined 		? "" : "id='" 		+ _id 		+ "' ") + 
    (_class == undefined 	? "" : "class='" 	+ _class 	+ "' ") + 
    (_name == undefined 	? "" : "name='" 	+ _name 	+ "' ") + 
    ">";
}

/**
 * (Helper) Selection element -> Child option tag
 *
 * @author Aleksandar Toplek
 * 
 * @param {String}  _value      Value attribute
 * @param {String}  _id         ID attribute
 * @param {Boolean} _selected   Selected attribute
 * 
 * @return {String} Option tag (e.g. <option ...>...</option>)
 * 
 * @private
 */
function _selectOption (_value, _id, _selected) {
    return "<option " + (_id == undefined ? "" : "id='" + _id + "' ") + (_selected == undefined ? "" : "selected") + ">" + _value + "</option>";
}

/**
 * (Helper) Selection element end tag
 * 
 * @author Aleksandar Toplek
 * 
 * @return Selection end tag (e.g. </select>)
 * 
 * @private
 */
function _selectE () {
    return "</select>";
}

/**
 * (Helper) Gets locale message
 * 
 * @author Aleksandar Toplek
 * 
 * @param {String} name Name of locale message
 * 
 * @return {String} Message from current locale language
 */
function _gim(name) {
    return chrome.i18n.getMessage(name);
}