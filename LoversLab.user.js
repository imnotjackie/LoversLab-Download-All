// ==UserScript==
// @name         LoversLab Download All
// @namespace    N/A
// @version      0.3
// @description  Adds a download all button to loverslab
// @author       ImNotJackie
// @match        https://www.loverslab.com/*?do=download
// @icon         https://www.google.com/s2/favicons?sz=64&domain=loverslab.com
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js
// @grant        none
// @license      MIT
// ==/UserScript==
(function() {
    'use strict';

var seconds = 3;
var newRow = document.getElementsByClassName("ipsDataItem")[0].cloneNode(true);
var amount = document.querySelector("#ipsLayout_mainArea > div:nth-child(2) > div > p").innerHTML.toString();
var size = document.getElementsByClassName("ipsType_reset ipsDataItem_meta");
var num = 0;
for(i = 1; i < size.length; i++){
    var test = size[i].textContent.toString().replace("\n                       ","");
	test.substring(0, test.indexOf("\n") - 3);
	var temp = parseFloat(test.substring(0, 5));
	if(test.includes("kB") == true){
	temp = temp / 10000;
	}
	if(test.includes("MB") == true){
		temp = temp / 1000;
	}
	num = num + temp;
}

num = Math.round(num * 100) / 100
newRow.firstElementChild.children[1].textContent = "\n                       " + num + " GB Estimated";
newRow.firstElementChild.firstElementChild.firstElementChild.textContent = "Download all " + amount;
newRow.lastElementChild.className = "downloadAll";
newRow.lastElementChild.lastElementChild.removeAttribute("href");
var title = document.getElementsByClassName("ipsBreadcrumb ipsBreadcrumb_top ipsFaded_withHover")[0].lastElementChild.lastElementChild.lastElementChild.lastElementChild.textContent;

function downloadAll() {
    var buttons = document.getElementsByClassName("ipsButton ipsButton_primary ipsButton_small");
    var downloadList = [];
    var zip = new JSZip();  // Assuming you have included JSZip in your userscript

    // Create an array to store all fetch promises
    var fetchPromises = [];

    for (var i = 1; i < buttons.length; i++) {
        (function (i) {
            var href = buttons[i].href;
            if (isLoversLabDomain(href)) {
                downloadList.push(href);
                var folder = zip.folder(title);

                // Create a fetch promise and add it to the array
                var fetchPromise = fetch(href)
                    .then(response => response.blob())
                    .then(blob => {
                        // Add the file to the folder with a unique name
                        folder.file(buttons[i].parentElement.parentElement.firstElementChild.firstElementChild.textContent, blob);
                    });

                fetchPromises.push(fetchPromise);
            }
        }(i));
    }

    // Wait for all fetch promises to resolve
    Promise.all(fetchPromises)
        .then(() => {
            // If all files are processed, generate and download the zip
            if (downloadList.length === buttons.length - 1) {
                zip.generateAsync({ type: 'blob' })
                    .then(function (content) {
                        // Trigger download after generating the zip
                        var link = document.createElement('a');
                        link.href = URL.createObjectURL(content);
                        link.download = title + '.zip';
                        link.click();
                    });
            }
        });
}



function isLoversLabDomain(url) {
    // Replace "loverslab.com" with the actual domain you're checking for
    return url.includes("loverslab.com");
}
var myDiv = newRow.lastElementChild.lastElementChild;
if (myDiv) {
    myDiv.addEventListener ("click", downloadAll , false);
}
document.querySelector("#ipsLayout_mainArea > div:nth-child(2) > div > ul").insertBefore(newRow, document.querySelector("#ipsLayout_mainArea > div:nth-child(2) > div > ul").firstChild);
})();
