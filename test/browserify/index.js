var riot = require('riot');
var riotx = require('riotx');

// debug browser.
if (window) {
  window.riot = riot;
  window.riotx = riotx;
}

if (riot && riotx) {
  document.getElementById("result").innerText ='Successful';
} else {
  document.getElementById("result").innerText ='Failure';
}
