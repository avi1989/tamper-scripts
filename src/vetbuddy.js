// ==UserScript==
// @name         Cessna Bill Creator
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  A script to add functionality to the VetBuddy (Mainly for Cessna Lifeline) to make it usable. This script adds a summary of all the pets as well as a way to export pending invoices in a pdf format.
// @author       You
// @match        https://*.thevetbuddy.com/client_invoicedetails.html?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thevetbuddy.com
// @downloadURL   https://raw.githubusercontent.com/avi1989/tamper-scripts/master/src/vetbuddy.js
// @updateURL    https://raw.githubusercontent.com/avi1989/tamper-scripts/master/src/vetbuddy.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  var petTable = document.querySelector("#no-more-tables")

  var petObject = {};

  var pets = [...petTable.querySelectorAll("tr")].filter(x => x.className != "visible-md visible-lg")

  for (var pet of pets) {
    var petName = pet.querySelector("td[data-title=Patient]")?.innerText;
    var statusDiv = pet.querySelector("td[data-title=Status]");

    if (petName == null) {
      continue;
    }

    if (statusDiv == null) {
      debugger;
    }

    var invoiceLink = statusDiv.querySelector(".invoicelink").getAttribute("onclick");
    invoiceLink = invoiceLink.substring(invoiceLink.indexOf("(") + 1, invoiceLink.indexOf(","))
    invoiceLink = `https://cessnalifeline.thevetbuddy.com/invoiceview.html?cmdPrint=true&invoice=${invoiceLink}&disableprint=true&patientid=&problemid=`

    var petTotal = pet.querySelector("td[data-title=Total]").innerText;
    var petPaid = pet.querySelector("td[data-title=Paid]")?.innerText;
    var petBalance = pet.querySelector("td[data-title=Balance]")?.innerText;

    if (petObject[petName] == null) {
      petObject[petName] = {
        name: petName,
        balance: 0.00,
        total: 0.00,
        paid: 0.00,
        unpaidInvoices: ""
      }
    }

    petObject[petName].balance += parseFloat(petBalance);
    petObject[petName].total += parseFloat(petTotal);
    petObject[petName].paid += parseFloat(petPaid)
    if (parseFloat(petBalance) > 0) {
      petObject[petName].unpaidInvoices += `${invoiceLink},`
    }

  }

  var topForm = document.querySelector("form[name=frmGeneral]")

  var newText = document.querySelector(".avinash-test");

  if (newText == null) {
    newText = document.createElement("div")
  }



  newText.className = "avinash-test"

  newText.style.marginLeft = "10px"
  newText.style.marginTop = "10px"
  newText.innerHTML = `
<div style="display:flex; justify-content:space-between">
    <h4 style="display">Pet Breakdowns</h4>
</div>
`;

  var innerHtml = `
<table class="table table-condensed" style="margin-bottom: 50px">
<thead>
<tr style="font-weight: bold;">
    <th style="font-size: 16px !important; ">Pet Name</td>
  <th style="font-size: 16px !important; ">Paid</td>
  <th style="font-size: 16px !important; ">Balance</td>
  <th style="font-size: 16px !important; ">Total</td>
</tr>
</thead>
<tbody>
`

  window.copyLink = (string) => {
    string = string.replaceAll(",", "\n")
    navigator.clipboard.writeText(string);
  }

  for (var petName of Object.keys(petObject)) {
    var petData = petObject[petName];
    innerHtml += `
  <tr>
  `
    if (petData.balance > 0) {
      var encodedUrls = encodeURIComponent(petData.unpaidInvoices);
      innerHtml += `<td>${petName} <a href="https://www.sejda.com/html-to-pdf?save-link=${encodedUrls}" target="_blank">Export Unpaid Invoices</a></td>`
    } else {
      innerHtml += `<td>${petName}</td>`
    }

    innerHtml += `
  <td>${petData.paid.toLocaleString()}</td>
      <td>${petData.balance.toLocaleString()}</td>
      <td>${petData.total.toLocaleString()}</td>
  `;

    innerHtml += `
  </tr>
  `;
  }

  innerHtml += "</tbody></table>"

  newText.innerHTML += "" + innerHtml;

  topForm.insertBefore(newText, petTable);

  // Your code here...
})();