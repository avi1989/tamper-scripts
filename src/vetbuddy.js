// ==UserScript==
// @name         Cessna Bill Creator
// @namespace    http://tampermonkey.net/
// @version      0.5.1
// @description  A script to add functionality to the VetBuddy (Mainly for Cessna Lifeline) to make it usable. This script adds a summary of all the pets as well as a way to export pending invoices in a pdf format.
// @author       You
// @match        https://*.thevetbuddy.com/client_invoicedetails.html?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thevetbuddy.com
// @downloadURL   https://raw.githubusercontent.com/avi1989/tamper-scripts/master/src/vetbuddy.js
// @updateURL    https://raw.githubusercontent.com/avi1989/tamper-scripts/master/src/vetbuddy.js
// @grant        none
// ==/UserScript==

function getPetData(petTable) {
  var petObject = {};

  var pets = [...petTable.querySelectorAll("tr")].filter(x => x.className != "visible-md visible-lg")

  for (var pet of pets) {
    var casedPetName = pet.querySelector("td[data-title=Patient]")?.innerText;
    var petName = casedPetName?.toLowerCase();
    var statusDiv = pet.querySelector("td[data-title=Status]");

    if (petName == null) {
      continue;
    }

    var invoiceLink = statusDiv.querySelector(".invoicelink").getAttribute("onclick");
    invoiceLink = invoiceLink.substring(invoiceLink.indexOf("(") + 1, invoiceLink.indexOf(","))
    invoiceLink = `https://cessnalifeline.thevetbuddy.com/invoiceview.html?cmdPrint=true&invoice=${invoiceLink}&disableprint=true&patientid=&problemid=`

    var invoiceDate = statusDiv.querySelector("div:nth-child(3)").innerText;

    var petTotal = pet.querySelector("td[data-title=Total]").innerText;
    var petPaid = pet.querySelector("td[data-title=Paid]")?.innerText;
    var petBalance = pet.querySelector("td[data-title=Balance]")?.innerText;

    if (petObject[petName] == null) {
      petObject[petName] = {
        name: casedPetName,
        balance: 0.00,
        total: 0.00,
        paid: 0.00,
        unpaidInvoices: "",
        paidInvoices: "",
        dateOfAdmission: invoiceDate,
      }
    }

    petObject[petName].balance += parseFloat(petBalance);
    petObject[petName].total += parseFloat(petTotal);
    petObject[petName].paid += parseFloat(petPaid)

    if (new Date(petObject[petName].dateOfAdmission) > new Date(invoiceDate)) {
      petObject[petName].dateOfAdmission = invoiceDate;
    }

    if (parseFloat(petBalance) > 0) {
      petObject[petName].unpaidInvoices += `${invoiceLink},`;
    } else {
      petObject[petName].paidInvoices += `${invoiceLink},`;
    }
  }

  return petObject;
}

function fixAccountBalance() {
  const fontElement = document.querySelector("#planactionpagecontent table tr:nth-child(2) font");
  console.debug({fontElement});
  const priceText = fontElement.innerHTML.substr(fontElement.innerHTML.indexOf("Rs. ") + 4);
  console.debug({priceText});
  const price = parseFloat(priceText);
  console.debug({price});

  var outerHtml = `
    <font size="4" color="blue"><span class="languagetranslator">Account balance</span> - Rs. ${price.toLocaleString("hi")} </font>
  `;

  console.warn({outerHtml})

  fontElement.innerHTML = outerHtml;
}

function updateTotals(petObject, petTable, topForm, addedSection) {
  let totals = document.getElementById("avinash-totals")
  if (totals == null) {
    totals = document.createElement("div");
    totals.id = "avinash-totals";
    totals.style.marginBottom = "25px";
    totals.style.marginLeft = "10px"
    totals.style.marginTop = "10px"
  }
  
  // totals.innerHTML = `
  //   <h4>Totals</h4>
  // `;

  let balance = 0.0;
  let paid = 0.0;
  let total = 0.0; 

  var checkedBoxes = [...addedSection.querySelectorAll('input[type=checkbox]:checked')].map(x => x.value);
  for(const petName of Object.keys(petObject)) {
    if (checkedBoxes.indexOf(petName) < 0)  {
      continue;
    }

    const petData = petObject[petName];
    balance += petData.balance;
    paid += petData.paid;
    total += petData.total;
  }

  totals.innerHTML = `
    <h4>Totals</h4>
    <p>Paid: ${paid.toLocaleString("hi")}</p>
    <p>Balance: ${balance.toLocaleString("hi")}</p>
    <p>Total: ${total.toLocaleString("hi")}</p>
  `;

  console.info({balance, paid, total});

  topForm.insertBefore(totals, petTable);
}



(function () {
  'use strict';
  var petTable = document.querySelector("#no-more-tables")
  var petObject = getPetData(petTable);
  var topForm = document.querySelector("form[name=frmGeneral]")
  var newText = document.querySelector(".avinash-test");
  if (newText == null) {
    newText = document.createElement("div")
    newText.className = "avinash-test"

    newText.style.marginLeft = "10px"
    newText.style.marginTop = "10px"
    newText.style.marginBottom = "5px"
  }

  newText.innerHTML = `
<div style="display:flex; justify-content:space-between">
    <h4 style="display">Pet Breakdowns</h4>
    <a href="javascript:copyPaidInvoicesToClipboard()">Copy Link to Paid</a>
</div>
`;

  var innerHtml = `
<table class="table table-condensed" style="margin-bottom: 50px">
<thead>
<tr style="font-weight: bold;">
  <th style="width: 20px"></th>
  <th style="font-size: 16px !important; ">Pet Name</th>
  <th style="font-size: 16px !important; ">Date of Admission</th>
  <th style="font-size: 16px !important; ">Paid</th>
  <th style="font-size: 16px !important; ">Balance</th>
  <th style="font-size: 16px !important; ">Total</th>
</tr>
</thead>
<tbody>
`

  window.copyLink = (string) => {
    string = string.replaceAll(",", "\n")
    navigator.clipboard.writeText(string);
  }

  var petList = Object.keys(petObject);

  petList.sort((a, b) => {
    var petA = petObject[a];
    var petB = petObject[b];
    return new Date(petB.dateOfAdmission).getTime() - new Date(petA.dateOfAdmission).getTime()
  })

  for (var petName of petList) {
    var petData = petObject[petName];
    var casedPetName = petData.name;
    innerHtml += `
  <tr>
    <td> <input type="checkbox" value="${petName}" onclick="updateTotalsInternal()"/></td>
  `
    if (petData.balance > 0) {
      var encodedUrls = encodeURIComponent(petData.unpaidInvoices);
      innerHtml += `<td>${casedPetName} <a href="https://www.sejda.com/html-to-pdf?save-link=${encodedUrls}" target="_blank">Export Unpaid Invoices</a></td>`
    } else {
      innerHtml += `<td>${casedPetName}</td>`
    }

    innerHtml += `
      <td>${petData.dateOfAdmission}</td>
      <td>${petData.paid.toLocaleString("hi")}</td>
      <td>${petData.balance.toLocaleString("hi")}</td>
      <td>${petData.total.toLocaleString("hi")}</td>
  `;

    innerHtml += `
  </tr>
  `;
  }

  innerHtml += "</tbody></table>"

  newText.innerHTML += "" + innerHtml;

  topForm.insertBefore(newText, petTable);

  updateTotals(petObject, petTable, topForm, newText);  

  window.updateTotalsInternal =() => {
    updateTotals(petObject, petTable, topForm, newText);
  }

  window.copyPaidInvoicesToClipboard = () => {
    let paidInvoices = "";
    for(var petName of Object.keys(petObject)) {
      let petData = petObject[petName];
      if (petData.paidInvoices != null && petData.paidInvoices != "") {
        paidInvoices += petData.paidInvoices;
      }
    }
    window.copyLink(paidInvoices)
    // paidInvoices = paidInvoices.replaceAll(",", "\n");
    // console.debug({paidInvoices});
  }

  fixAccountBalance();
})();