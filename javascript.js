document.addEventListener('DOMContentLoaded', function () {
    let container = document.getElementById('cal-buttons');
    let matches = container.querySelectorAll("td");
    for(let i = 0, length = matches.length; i < length; i++) {
        matches[i].addEventListener('click', () => onButtonClicked(matches[i].textContent, matches[i].id));
    }
});

const TYPE_NUMBER = 0;
const TYPE_ACTION = 1;

let currentAction = null,
    currentNumber = null,
    currentAnswer = null,
    currentString = null,
    currentEquation = '',
    equatOpen = false,
    lastClicked = null;


function onButtonClicked(buttonValue, elementId) {
    let mainInput = document.getElementById('mathInput');
    let equationInput = document.getElementById('mathSave');
    if (elementId == 'clear') {
        mathInput.value = '';
        equationInput.textContent = '';
        currentAction = null,
        currentNumber = null,
        currentAnswer = null,
        currentString = null,
        lastClicked = null;
    } else if (elementId == 'clearentry') {
        mathInput.value = '';
        currentAction = null,
        currentNumber = null,
        currentAnswer = null,
        currentString = null,
        lastClicked = null;
    } else if (elementId == 'backspace') {
        if (isNaN(currentString.charAt(currentString.length-1)) || currentString.charAt(currentString.length-1) == ' ') {
            currentString = currentString.slice(0, currentString.length - 3);
        } else {
            currentString = currentString.slice(0, currentString.length - 1);
        }
        mathInput.value = currentString;
    } else {
        // Number or dot
        if (!isNaN(buttonValue) || (buttonValue == '.')) {
            if (buttonValue == '.') {
                if ((lastClicked && lastClicked == TYPE_ACTION && currentAction != 'equals') || !currentString) { 
                        return; 
                }
                if (currentString.match(/\./g)) {
                    let numbers = currentString.replace(/\s/g,"").split(toOperatorChar(currentAction));
                    let dots = currentString.match(/\./g).length;
                    let decimalCount = 0;
                    for (let i = 0; i < numbers.length; i++) {
                        if (numbers[i] % 1 != 0) {
                            decimalCount++;
                        }
                    }
                    switch (numbers.length) {
                        case 1:
                            if (dots == 1) {
                                return;
                            }
                        case 2:
                            if(decimalCount == 2 || dots >= 2 || (numbers[0] % 1 == 0 && dots >= 1)) {
                                return;
                            }
                    }
                }
            }
            if (currentString) {
                mainInput.value = `${currentString}${buttonValue}`; 
            } else { 
                mathInput.value = buttonValue; 
            }
            if (currentEquation && isNaN(currentString)) {
                equationInput.textContent = '';
            }
            currentNumber = parseFloat(mathInput.value);
            currentString = mathInput.value;
            lastClicked = TYPE_NUMBER;
            currentEquation += buttonValue;
        // Operator
        } else {
            if (!currentString) { return; }
            if (currentString.charAt(currentString.length-1) == '.') {
                currentString = currentString.slice(0, currentString.length - 1);
                mathInput.value = currentString;
            }
            if (lastClicked == TYPE_ACTION && currentAction != 'equals') {
                if (currentAction == elementId) { 
                    return; 
                } else {
                    currentString = currentString.slice(0, currentString.length - 3) + ` ${buttonValue} `;
                    mathInput.value = currentString;
                    currentNumber = parseInt(currentString);
                    currentAction = elementId;
                    return;
                }
            }
            // Result
            if (elementId == 'equals' || isNaN(currentString)) {
                if (!isNaN(currentString)) {
                    return;
                }
                let autoEqual = (isNaN(currentString) && elementId != 'equals') ? true : false;
                currentString = convertActionToMath(currentAction, currentNumber, parseFloat(currentString.substr(currentString.indexOf(' ')+2, currentString.length))).toString();
                currentNumber = parseFloat(currentString);
                if (autoEqual) { currentString += ` ${buttonValue} `; }
                mathInput.value = currentString;
                lastClicked = TYPE_ACTION;
                currentAction = elementId;
                currentEquation += ' =';
                equationInput.textContent = currentEquation;
                return;
            }
            mathInput.value += ` ${buttonValue} `;
            currentString = mathInput.value;
            currentAction = elementId;
            lastClicked = TYPE_ACTION;
            currentEquation += ` ${buttonValue} `;
        }
        equationInput.textContent = currentEquation;
    }
}

function isMathAction(elementId) {
    switch(elementId) {
        case 'divide':
        case 'times':
        case 'minus':
        case 'plus':
        case 'equals':
            return true;
        default: 
            return false;
    }
}

function convertActionToMath(action, value1, value2) {
    switch(action) {
        case 'divide': 
            return value1 / value2;
        case 'times':
            return value1 * value2;
        case 'minus': 
            return value1 - value2;
        case 'plus': 
            return value1 + value2;
        default: 
            return -1;
    }
}

function toOperatorChar(elementId) {
    switch(elementId) {
        case 'divide': 
            return [...'\u00F7'];
        case 'times': 
            return [...'\u00D7'];
        case 'minus': 
            return [...'\u2212'];
        case 'plus': 
            return [...'\u002B'];
        default: return [...'\u002B'];
    }
}