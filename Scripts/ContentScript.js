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

// TODO: Setting variables preloading

// Global variables


// Global constants

// Initialization of extension script (travian page modification)
init();

/**
 * Initializes all extension functions
 *
 * @author Aleksandar Toplek
 */
function init() {
    console.log("Initialize - Initializing...");
    var startTime = (new Date()).getTime();
	
    // Initial settings configuration
    globalInitializeSettings();
	
    // Calls for PageAction show
    chrome.extension.sendRequest({
        category: "extension", 
        name: "showActionPageMenu", 
        action: "set"
    }, function () { });
	
    var pathname = pageGetPathname();
    pageProcessAll(pathname);
	
    var endTime = (new Date()).getTime();
    console.log("Initialize - Finished successfully! (" + (endTime - startTime) + ")");
}

/**
 * Pathname of current page.
 *
 * @author Aleksandar Toplek
 *
 * @return {String} Returns an pathname of current web page without query.
 */
function pageGetPathname() {
    console.log("PageGetPathname - Reading current page...");
	
    var currentPath = window.location.pathname;
	
    console.log("PageGetPathname - Current page pathname [" + currentPath + "]");
	
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
    console.log("PageProcessAll - Starting...");
	
    var where = pageGetWhere(pathname);
	
    console.log("PageProcessAll - Pathname [" + pathname + "] mathched with [" + where + "]");
	
    chrome.extension.sendRequest({
        category: "settings", 
        name: "checkGlobalRemoveInGameHelp", 
        action: "get"
    }, function (response) {
        console.log("PageProcessAll - checkGlobalRemoveInGameHelp [" + response + "]");
        if (response === "On" | response == undefined) globalRemoveInGameHelp();
    });

    chrome.extension.sendRequest({
        category: "settings", 
        name: "checkGlobalStorageOverflowTimeout", 
        action: "get"
    }, function (response) {
        console.log("PageProcessAll - checkGlobalStorageOverflowTimeout [" + response + "]");
        if (response === "On" | response == undefined) globalOverflowTimer();
    });

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
 * Initializes settings to default on first initialization.
 *
 * @author Aleksandar Toplek
 */
function globalInitializeSettings() {
    chrome.extension.sendRequest({
        category: "settings", 
        name: "wasInitialized", 
        action: "get"
    }, function (response) {
        console.log("GlobalInitializeSettings - wasInitialized [" + response +"]");
        if (response == undefined) {
            console.log("GlobalInitializeSettings - First settings configuration...");
			
            chrome.extension.sendRequest({
                category: "settings", 
                name: "wasInitialized", 
                action: "set", 
                value: true
            }, function () { });
            // Check settings
            chrome.extension.sendRequest({
                category: "settings", 
                name: "checkGlobalRemoveInGameHelp", 
                action: "set", 
                value: "On"
            }, function () { });
            chrome.extension.sendRequest({
                category: "settings", 
                name: "checkGlobalStorageOverflowTimeout", 
                action: "set", 
                value: "On"
            }, function () { });
            chrome.extension.sendRequest({
                category: "settings", 
                name: "checkBuildBuildingResourceDifference", 
                action: "set", 
                value: "On"
            }, function () { });
            chrome.extension.sendRequest({
                category: "settings", 
                name: "checkBuildUnitResourceDifference", 
                action: "set", 
                value: "On"
            }, function () { });
            chrome.extension.sendRequest({
                category: "settings", 
                name: "checkMarketShowX2Shortcut", 
                action: "set", 
                value: "On"
            }, function () { });
            chrome.extension.sendRequest({
                category: "settings", 
                name: "checkMarketListMyVillages", 
                action: "set", 
                value: "On"
            }, function () { });
            chrome.extension.sendRequest({
                category: "settings", 
                name: "checkMarketShowJunkResource", 
                action: "set", 
                value: "On"
            }, function () { });
            chrome.extension.sendRequest({
                category: "settings", 
                name: "checkMarketShowSumIncomingResources", 
                action: "set", 
                value: "On"
            }, function () { });
            chrome.extension.sendRequest({
                category: "settings", 
                name: "checkSendTroopsListMyVillages", 
                action: "set", 
                value: "On"
            }, function () { });
			
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
function globalGetVillagesList() {
    console.log("GlobalGetVillagesList - Getting village list...");
	
    var villagesList = $("div[id='villageList'] > div[class='list'] > ul > li[class*='entry'] > a[class!='active']");
	
    console.log("GlobalGetVillagesList - Village list: " + villagesList);
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
    console.log("GlobalRemoveInGameHelp - Removing in game help...");
	
    $("#ingameManual").remove();
	
    console.log("GlobalRemoveInGameHelp - In game help removed!");
}

/**
 * Informs about warehouse and granary overflow
 * 
 * @author Aleksandar Toplek
 */
function globalOverflowTimer() {
    console.log("GlobalOverflowTimer - Initializing...");
	
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
	
        console.log("GlobalOverflowTimer - Resources per hour: " + perHour[0] + " " + perHour[1] + " " + perHour[2] + " " + perHour[3]);
    }
	
    $("#res").children().each(function(index) {
        // Skips crop consumption
        if (index !== 4) {
            var current 	= globalGetWarehousAmount(index + 1);
            var max 		= globalGetWarehousMax(index + 1);
            var timeLeft 	= (max - current) / perHour[index];
	
            console.log("GlobalOverflowTimer - l" + (index + 1) + " appended!");
			
            $(this).append("<div style='background-color: #EFF5FD;'><b><p id='paResourceOverflowTime" + index + "' style='text-align: right;'>" + _hoursToTime(timeLeft) + "</p></b></div>");
        }
    });
    
    setInterval(globalOverflowTimerFunction, 1000);
    console.log("GlobalOverflowTimer - Timer registered!");
            
    console.log("GlobalOverflowTimer - Finished!");
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
    return parseInt(globalGetWarehousInfo(index).split("/")[0]);
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
    return parseInt(globalGetWarehousInfo(index).split("/")[1]);
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
    console.log("GlobalInBuild - In buils calls...");
	
    chrome.extension.sendRequest({
        category: "settings", 
        name: "checkBuildBuildingResourceDifference", 
        action: "get"
    }, function (response) {
        console.log("GlobalInBuild - checkBuildBuildingResourceDifference [" + response + "]");
        if (response === "On" | response == undefined) buildCalculateBuildingResourcesDifference();
    });
    
    chrome.extension.sendRequest({
        category: "settings", 
        name: "checkBuildUnitResourceDifference", 
        action: "get"
    }, function (response) {
        console.log("GlobalInBuild - checkBuildUnitResourceDifference [" + response + "]");
        if (response === "On" | response == undefined) buildCalculateUnitResourcesDifference();
    });

    if ($(".gid17").length) buildMarketCalls();
	
    console.log("GlobalInBuild - In build finished successfully!");
}

/**
 * Calls all Send troops related functions.
 *
 * @author Aleksandar Toplek
 */
function globalInSendTroops() {
    console.log("GlobalInSendTroops - In send troops calls...");
	
    chrome.extension.sendRequest({
        category: "settings", 
        name: "checkSendTroopsListMyVillages", 
        action: "get"
    }, function (response) {
        console.log("GlobalInSendTroops - checkSendTroopsListMyVillages [" + response + "]");
        if (response === "On" | response == undefined) SendTroopsFillVillagesList();
    });
	
    console.log("GlobalInSendTroops - In send troops finished successfully!");
}

/**
 * Calculates resource difference.
 * A resource difference is between storage and cost.
 *
 * @author Aleksandar Toplek
 */
function buildCalculateBuildingResourcesDifference() {
    console.log("buildCalculateBuildingResourcesDifference - Calculating building resource differences...");
    
    for (var rindex = 0; rindex < 4; rindex++) {
        var inWarehouse = globalGetWarehousAmount(rindex + 1);
        
        // Building cost
        // .costs are for town hall celebration
        // .contractCosts are for building/upgreding building
        $(".contractCosts > div > span[class*='resources r" + (rindex + 1) + "'],.costs > div > span[class*='resources r" + (rindex + 1) + "']").each(function() {
            var res = parseInt($(this).text());
            var diff = inWarehouse - res;
            var color = diff < 0 ? "#B20C08" : "#0C9E21";
            var div = "<div style='color:" + color + "'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(" + diff + ")</div>";

            $(this).append(div);

            console.log("buildCalculateBuildingResourcesDifference - r" + (rindex + 1) + " diff[" + diff + "]");
        });        
    }
    
    console.log("buildCalculateBuildingResourcesDifference - Building resource differences calculated!");
}

/**
 * Info about untit and storage resource difference
 * 
 * @author Aleksandar Toplek
 */
function buildCalculateUnitResourcesDifference() {
    console.log("buildCalculateUnitResourcesDifference - Calculating unit resource difference...");
    
    var inputs = $("input[name*='t']");
    var costs = $(".details > .showCosts");

    for (var rindex = 0; rindex < 4; rindex++) {
        inputs.each(function(iindex) {
            $(costs[iindex]).children("span[class*='resources r" + (rindex + 1) + "']").append(
                "<div id='paUnitCostDifferenceI" + iindex + "R" + rindex + "' style='color:#0C9E21'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(0)</div>");
        });
    }
    
    setInterval(buildCalculateUnitResourcesDifferenceTimerFunction, 250, [inputs, costs]);
    
    console.log("buildCalculateUnitResourcesDifference - Timer registerd!");
    
    console.log("buildCalculateUnitResourcesDifference - Unit resource differences calculated!");
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
            var res = parseInt($(args[1][iindex]).children("span[class*='resources r" + (rindex + 1) + "']").text());
            var diff = inWarehouse - (res * parseInt($(this).attr("value") || 0));
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
    console.log("BuildMarketCalls - Marketplace calls...");
	
    var traderMaxTransport = buildMarketGetTraderMaxTransport();
    var tradersAvailable = buildMarketGetTradersAvailable();
	
    console.info("BuildMarketCalls - traderMaxTransport [" + traderMaxTransport + "]");
    console.info("BuildMarketCalls - tradersAvailable [" + tradersAvailable + "]");
	
    chrome.extension.sendRequest({
        category: "settings", 
        name: "checkMarketListMyVillages", 
        action: "get"
    }, function (response) {
        console.log("BuildMarketCalls - checkMarketListMyVillages [" + response + "]");
        if (response === "On" | response == undefined) buildMarketFillVillagesList();
    });

    buildMarketAddTransportShortcuts(traderMaxTransport);

    chrome.extension.sendRequest({
        category: "settings", 
        name: "checkMarketShowJunkResource", 
        action: "get"
    }, function (response) {
        console.log("BuildMarketCalls - checkMarketShowJunkResource [" + response + "]");
        if (response === "On" | response == undefined) {
            buildMarketInsertJunkResourceTable();
            buildMarketRegisterTimerFillInJunkResource(
                [tradersAvailable, traderMaxTransport]
                );
        }
    });
	
    chrome.extension.sendRequest({
        category: "settings", 
        name: "checkMarketShowSumIncomingResources", 
        action: "get"
    }, function (response) {
        console.log("BuildMarketCalls - checkMarketShowSumIncomingResources [" + response + "]");
        if (response === "On" | response == undefined) buildMarketIncomingSum();
    });
	
    console.log("BuildMarketCalls - Marketplace calls finished...");
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
		
    console.log("BuildMarketRegisterTimerFillInJunkResource - Timer set to interval [250]");
}

/**
 * Inserts JunkResource rows in the end of resource selection table
 * 
 * @author Aleksandar Toplek
 */
function buildMarketInsertJunkResourceTable() {
    console.log("buildMarketInsertJunkResourceTable - Inserting Junk resources table...");
    
    $(".send_res > tbody").append("<tr><td></td><td></td><td class='currentLoaded'>0 </td><td class='maxRes'>/ 0</td></tr><tr><td></td><td></td><td>Junk:</td><td class='junkAmount'>0 (0)</td></tr>");
    
    console.log("buildMarketInsertJunkResourceTable - Junk resources table inserted successfully...");
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
    console.log("buildMarketGetTradersAvailable - Started...");
    
    var tradersSource = $("div[class*='traderCount'] > div:last").text();

    // NOTE: Regex code automated generator
    // http://txt2re.com/index-javascript.php3

    // Input sample: _16_/_22___... (where _ means space)
    // Return sample: 16 (integer)

    var p = new RegExp('(\\d+)', ["i"]);
    var result = p.exec(tradersSource);
    
    console.log("buildMarketGetTradersAvailable - Finished! Traders available [" + result[1] + "]");

    return parseInt(result[1]) || 0;
}

/**
 * Gets how mush one trader can transport
 * 
 * @author Aleksandar Toplek
 * 
 * @return {Number} Trader maximal resource transport or 0 if undefined
 */
function buildMarketGetTraderMaxTransport() {
    return parseInt($(".send_res > tbody > tr:eq(0) > .max > a").text() || 0);
}

/**
 * Replaces market village name text box with selection of players villages
 * 
 * @author Aleksandar Toplek
 */
function buildMarketFillVillagesList() {
    console.log("buildMarketFillVillagesList - Started...");
    
    // Gets data
    var selectData = globalGetVillagesList();
    var selectInput = _selectB("EnterVillageName", "text village", "dname");
    
    console.log("buildMarketFillVillagesList - Generating selection...");
    
    // Generated select tag
    selectInput += _selectOption(_gim("TravianSelectVillage"));
    $.each(selectData, function (current, value) {
        selectInput += _selectOption(value.text);
    });
    selectInput += _selectE();
    
    console.log("buildMarketFillVillagesList - Selection generated!;");
    
    // Replaces textbox with selectionbox (drop-down)
    $(".compactInput").html(selectInput);
    
    console.log("buildMarketFillVillagesList - Textbox successfully replaced!");
}

/**
 * Adds resource shortcuts (e.g. 1x, 2x traders maximal transport amount)
 * 
 * @author Aleksandar Toplek
 * 
 * @param {Number} traderMaxTransport Trader maximum resource transport amount
 */
function buildMarketAddTransportShortcuts(traderMaxTransport) {
    console.log("buildMarketAddTransportShortcuts - Started...");
    
    // SAMPLE: "<a href='#' onmouseup='add_res(1);' onclick='return false;'>1000</a>"

    console.log("buildMarketAddTransportShortcuts - Adding 1x shortcut");
    // 1x shortcut
    for (var index = 0; index < 4; index++) {
        var addCall = "add_res(" + (index + 1) + ");";
        var strX1 = "/ <a href='#' onmouseup='" + addCall + "' onclick='return false;'>" + traderMaxTransport + "</a><br>";
        $(".send_res > tbody > tr:eq(" + index + ") > .max").html(strX1);
    }

    console.log("buildMarketAddTransportShortcuts - 1x shortcud added!");
    console.log("buildMarketAddTransportShortcuts - Adding 2x shortcut");
    // 2x shortcut
    chrome.extension.sendRequest({
        category: "settings", 
        name: "checkMarketShowX2Shortcut", 
        action: "get"
    }, function (response) {
        console.log("buildMarketAddTransportShortcuts - checkMarketShowX2Shortcut [" + response + "]");
        if (response === "On" | response == undefined) {
            for (var index = 0; index < 4; index++) {
                var addCall = "add_res(" + (index + 1) + ");";
                var strX2 = "/ <a href='#' onmouseup='" + addCall + addCall + "' onclick='return false;'>" + traderMaxTransport * 2 + "</a><br>";
                $(".send_res > tbody > tr:eq(" + index + ") > .max").append(strX2);
            }
            console.log("buildMarketAddTransportShortcuts - 1x shortcud added!");
        }
    });
    
    console.log("buildMarketAddTransportShortcuts - Finished successfully!");
}

/**
 * Puts table with resource sum of incoming trades to beginning
 *
 * @author Aleksandar Toplek
 */
function buildMarketIncomingSum() {
    console.log("BuildMarketIncomingSum - Generating table...");
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
                sum[i] += parseInt(resSplit[i + 1]);
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

/**
 * Replaces SendToops village name text box with selection of players villages
 * 
 * @author Aleksandar Toplek
 */
function sendTroopsFillVillagesList() {
    csonsole.log("sendTroopsFillVillagesList - Started...");
    
    var selectData = globalGetVillagesList();
    var selectInput = _selectB("enterVillageName", "text village", "dname");
    
    console.log("sendTroopsFillVillagesList - Generating selection...");
    
    selectInput += _selectOption(_gim("TravianSelectVillage"));
    $.each(selectData, function(current, value) {
        selectInput += _selectOption(value.text);
    });
    selectInput += _selectE();
    
    console.log("sendTroopsFillVillagesList - Selection generated!");
    console.log("sendTroopsFillVillagesList - Appending table...");
    
    $(".compactInput").html(selectInput);
    
    console.log("sendTroopsFillVillagesList - Finished successfully!");
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
	
    var hours = parseInt(split[0]) + (parseInt(split[1]) / 60) + (parseInt(split[2]) / 3600);
	
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
	
    var _seconds = hours;
    _seconds = Math.floor(_seconds);
	
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
    var num = parseInt(value);
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