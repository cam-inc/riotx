var riot = require('riot');
var riotx = require('riotx');

if (riot && riotx) {
  document.getElementById("result").innerText ='Successful';
} else {
  document.getElementById("result").innerText ='Failure';
}
