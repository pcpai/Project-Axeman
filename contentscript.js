/*
	
	contentscript.js
	
	by
	Aleksandar Toplek, 
	JustBuild 2011.
	
	This file is under FreeBSD license that
	can be found in README.txt that came
	with this code.
	  
*/

// Calls for PageAction show
chrome.extension.sendRequest({ category: "extension", name: "showActionPageMenu", action: "set" }, function (response) { });