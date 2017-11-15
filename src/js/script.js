"use strict";
;(function() {

//Если на проекте нет jQuery, но хочется $( document ).ready... (IE9+)
function ready(fn) {
  if (document.attachEvent ? document.readyState === "compvare" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function(){

  function httpGet(url) {

    return new Promise(function(resolve, reject) {

      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);

      xhr.onload = function() {
        if (this.status == 200) {
          resolve(this.response);
        } else {
          var error = new Error(this.statusText);
          error.code = this.status;
          reject(error);
        }
      };

      xhr.onerror = function() {
        reject(new Error("Network Error"));
      };

      xhr.send();
    });

  }

  //GetTodayCurrency
  httpGet("https://api.fixer.io/latest?base=USD")
  .then(response => {

    var todayCurrency = JSON.parse(response);
    showTicker();

    function showTicker(){
      var ticker = document.getElementById('ticker');
      var tickerWrapper = document.createElement("div");
      var ourCurrencies = ["BGN", "CAD", "CHF", "RUB", "EUR", "GBP" , "CNY", "CZK", "DKK" ,"HKD", "HRK", "HUF",
     "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "RON",
     "SEK", "SGD", "THB", "TRY", "ZAR"];
      var distance = ourCurrencies.length * 150;
      tickerWrapper.classList.add("ticker__wrapper");

      var cssAnimation = document.createElement('style');
      cssAnimation.type = 'text/css';
      var rules = document.createTextNode('@keyframes move {'+
      'from {transform: translateX(0)}'+
      `to {transform: translateX(-${distance}px)}`);
      cssAnimation.appendChild(rules);
      document.getElementsByTagName("head")[0].appendChild(cssAnimation);


      ourCurrencies.forEach(function(curency, i) {
          var item = document.createElement("span");
          item.classList.add("ticker__cur");
          var currencyRate = todayCurrency["rates"][curency];
          item.innerHTML = `${curency}/USD ${currencyRate}`;
          tickerWrapper.appendChild(item);
      });


      ticker.appendChild(tickerWrapper);
    }

    return todayCurrency;
  })
  .then(todayCurrency => {
    //GetYesterdayyCurrency
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);

    var dd = yesterday.getDate();
    var mm = yesterday.getMonth()+1;

    var yyyy = yesterday.getFullYear();

    if(dd<10){
      {dd='0'+dd}
    }

    if(mm<10){
      mm='0'+mm
    }

    yesterday = yyyy +'-'+ mm + '-' + dd;

    httpGet(`https://api.fixer.io/${yesterday}?base=USD`).then(response => {

      var yesterdayCurrency = JSON.parse(response);
      var ourCurrencies = ["RUB", "EUR", "GBP" , "BGN", "CAD", "CHF", "CNY", "CZK", "DKK" ,"HKD", "HRK", "HUF",
                           "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "RON",
                           "SEK", "SGD", "THB", "TRY", "ZAR"];

      var ourCurrenciesRate = getChange(ourCurrencies);
      showCurencyRate(ourCurrenciesRate);

      function getChange(currencies){
        var currenciesValue = {};

        currencies.forEach(function(item, i) {
          var temp = {};
          var todayCur = todayCurrency["rates"][item];
          var yesterdayCur = yesterdayCurrency["rates"][item];
          var change = todayCur / yesterdayCur;

          if (change > 1){
            temp = (change -1).toFixed(5);
          }
          temp = (1 - change).toFixed(5);

          currenciesValue[item] = temp;

        });

        return currenciesValue;
      }

      function showCurencyRate(ourCurrenciesRate){
        var rates = document.createElement("ul");
        rates.classList.add("rates");
        rates.id = "rates";
        //var rates = document.getElementById('rates');

        for (var key in ourCurrenciesRate) {

            var item = document.createElement("li");
            item.classList.add("rates__item");

            var itemCurrency = document.createElement("span");
            itemCurrency.classList.add("rates__item-currency");
            itemCurrency.innerHTML = key;


            var itemDirection = document.createElement("span");
            itemDirection.classList.add("rates__item-direction");

            if (ourCurrenciesRate[key][0] == "-"){
              itemDirection.classList.add("rates__item-direction--down");
              ourCurrenciesRate[key] = ourCurrenciesRate[key].slice(1);
            }

            var itemPercent = document.createElement("span");
            itemPercent.classList.add("rates__item-percent");
            itemPercent.innerHTML = `${ourCurrenciesRate[key]} %`;


            item.appendChild(itemCurrency);
            item.appendChild(itemDirection);
            item.appendChild(itemPercent);


            rates.appendChild(item);
        }

        var infoWrapper = document.getElementById('info-wrapper');
        var twitter = document.getElementById('twitter');
        infoWrapper.insertBefore(rates, twitter);

      }
    });
  })

  changeTab();
  helicopterDown();

  function changeTab(){
    var tabs = document.getElementsByClassName("tabs");


    for (var i = 0; i< tabs.length; i++) {
      tabs[i].addEventListener( "click", function(event) {
        event = event || window.event;

          if (event.preventDefault) { // если метод существует
            event.preventDefault(); // то вызвать его
          } else { // иначе вариант IE8-:
            event.returnValue = false;
          }

        var activeTab = document.querySelector(".tabs--active");
        activeTab.classList.remove('tabs--active');
        this.classList.add('tabs--active');

        var activePromo = document.querySelector(".promo__tab--active");

        activePromo.classList.remove('promo__tab--active');

        switch(this.id){
          case 'tabs-how':
            activePromo = document.querySelector("#promo-how");
          break;

          case 'tabs-about':
            activePromo = document.querySelector("#promo-about");
          break;

          case 'tabs-contact':
            activePromo = document.querySelector("#promo-contact");
          break;
        }

        activePromo.classList.add('promo__tab--active');
      });
    }
  }

  function helicopterDown(){
    var helicopter = document.getElementById("promo-helicopter");
    helicopter.addEventListener( "click", function(event) {
        helicopter.classList.add('promo__helicopter--down');
        setTimeout(function() { helicopter.style.display="none"}, 3000);
      }
    );
  }

});
})();
