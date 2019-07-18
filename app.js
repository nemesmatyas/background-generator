//BUDGET CONTROLLER - Adatok tárolása, kiszámítása
let budgetController = (function(){

  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }
    calcPercentage(totalIncome) {
      if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
      }
      else {
        this.percentage = -1;
      }
    }
    getPercentage() {
      return this.percentage;
    }
  }


  class Income {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  let calculateTotal = function(type){
    let sum = 0;

    data.allItems[type].forEach(function(cur){
      sum += cur.value;
    });
    data.totals[type] = sum;
  }

  let data = {
    allItems: {
      inc: [],
      exp: []
    },
    totals: {
      inc: 0,
      exp: 0
    },
    budget: 0,
    percentage: -1
  };
  return {
    addItem: function(type, des, val){
      let newItem;

      if(data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      else {
        ID = 0;
      }

      if(type === 'exp'){
        newItem = new Expense(ID, des, val);
        
      }
      else if(type === 'inc'){
        newItem = new Income(ID, des, val);
        
      }
      data.allItems[type].push(newItem);
      return newItem;
    },
    deleteItem: function(type, id){
      let ids, index;
      ids = data.allItems[type].map(function(current){
        return current.id;
      });

      index = ids.indexOf(id);

      if(index !== -1){
        data.allItems[type].splice(index, 1);
      }
      
    },
    calculateBudget: function(){
      // Összes bevétel és kiadás kiszámítása
      calculateTotal('inc');
      calculateTotal('exp');

      // Budget kiszámítása (bevétel - kiadások)
      data.budget = data.totals.inc - data.totals.exp;

      // Százalék kiszámítása
      if(data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }
      else {
        data.percentage = -1;
      }
      
    },
    calculatePercentages: function(){
      
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function(){

      let allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget: function(){
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },
    testing: function(){
      return data;
    }

  }


})();





// UI CONTROLLER - UI módosítása (elem + összebüdzsé megjelenítése, törlése)
let UIController = (function(){

  let DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  let formatNumber =  function(num){

    // + vagy - jel a számok előtt
    // pontosan 2 tizedesjegy
    // három helyiértékenként vessző
    // pl.: 2310.4567 ---> 2,310.45

    let numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if(int.length > 3){
      int = int.substr(0, int.length - 3) +  ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return int + '.' + dec;
  }

  return {

    getInput: function(){
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      }
    },
    addListItem: function(obj, type){
      let html, element;
      if(type === 'inc'){
        html = `<div class="item clearfix" id="inc-${obj.id}">
        <div class="item__description">${obj.description}</div>
        <div class="right clearfix">
            <div class="item__value">+ ${formatNumber(obj.value)}</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div>
    </div>`;
        element = '.income__list';
      }
      else if(type === 'exp'){
        html = `<div class="item clearfix" id="exp-${obj.id}">
        <div class="item__description">${obj.description}</div>
        <div class="right clearfix">
            <div class="item__value">- ${formatNumber(obj.value)}</div>
            <div class="item__percentage">21%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div>
    </div>`;
        element = '.expenses__list';
      }
      document.querySelector(element).insertAdjacentHTML('beforeend', html);

    },
    deleteListItem: function(selectorID){
      let element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },
    clearInput: function(){
      document.querySelector(DOMStrings.inputDescription).value = '';
      document.querySelector(DOMStrings.inputDescription).focus();
      document.querySelector(DOMStrings.inputValue).value = '';


    },
    displayBudget: function(obj){
      if(obj.budget > 0){
        document.querySelector(DOMStrings.budgetLabel).textContent = '+ ' + formatNumber(obj.budget);
      }
      else {
        document.querySelector(DOMStrings.budgetLabel).textContent = '- ' + formatNumber(obj.budget);
      }
      
      document.querySelector(DOMStrings.incomeLabel).textContent = '+ ' + formatNumber(obj.totalInc);
      document.querySelector(DOMStrings.expensesLabel).textContent = '- ' + formatNumber(obj.totalExp);

      if(obj.percentage !== -1){
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      }
      else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
      }
      

    },
    displayPercentages: function(percentages){
      let fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

      let nodeListForEach = function(list, callback){
        for(let i = 0; i < list.length; i++){
          callback(list[i], i);
        }
      }

      nodeListForEach(fields, function(current, index){
        if(percentages[index] > 0){
          current.textContent = percentages[index] + '%';
        }
        else {
          current.textContent = '---';
        }
        
      });

    },
    displayMonth: function(){
      let now, year, month, months;

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

    },
    getDOMStrings: function(){
      return DOMStrings;
    }
  }

})();





// CONTROLLER - kommunikáció a többi controllerrel, event kezelés, inicializáció
let controller = (function(budgetCtrl, UICtrl){
  
  let setupEventListeners = function(){
    let DOM = UICtrl.getDOMStrings();
    document.addEventListener('keypress', function(e){
      if(e.keyCode === 13 || e.which === 13){
        ctrlAddItem();
      }
    });
  
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
  }


  let ctrlAddItem = function(){
    let input, newItem;

    // 1. User input beolvasása
    input = UICtrl.getInput();
    
    if(input.description !== '' && !isNaN(input.value) && input.value > 0){

      // 2. Létrehozott object tárolása az adatstruktúrában
      newItem = budgetController.addItem(input.type, input.description, input.value);
      
      // 3. Object megjelenítése a UI-ban
      UICtrl.addListItem(newItem, input.type);

      // 4. Input mezők törlése az item hozzáadása után
      UICtrl.clearInput();

      // 5. Budget kiszámító függvény meghívása
      updateBudget();

      // Százalék kiszámítása
      updatePercentages();
    }
    
  }

  let ctrlDeleteItem = function(e){

    // Törölni kívánt elem ID-ja és típusa
    let itemID, splitID, type, ID;
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemID){
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
    }

    // Elem törlése az adatstruktúrából
    budgetCtrl.deleteItem(type, ID);

    // Elemen törlése a DOM-ból
    UICtrl.deleteListItem(itemID);

    // Budget frissítése
    updateBudget();

    // Százalék kiszámítása
    updatePercentages();
  }

  let updatePercentages = function(){
    // Százalékok kiszámítás
    budgetCtrl.calculatePercentages();

    // Százalékok kiolvasása a budgetControllerből
    let percentages = budgetCtrl.getPercentages();
    

    // UI frissítése
    UICtrl.displayPercentages(percentages);
  }

  let updateBudget = function(){
    // 1. Budget kiszámítás
    budgetController.calculateBudget();
    // 2. Budget return-ölése
    let budget = budgetCtrl.getBudget();
    
    // 3. Budget megjelenítése a UI-ban
    UICtrl.displayBudget(budget);
  }

  return {
    init: function(){
      UICtrl.displayMonth();
      setupEventListeners();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
    }
  }
})(budgetController, UIController);

controller.init();