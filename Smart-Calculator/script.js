// --- CHANGE MODE --- 
function changeMode() {
  const on = document.getElementById('bulb-on');
  const off = document.getElementById('bulb-off');
  const scientific = document.getElementById("keyboard-scientific");
  const basic = document.getElementById("keyboard-basic");

  if (on.style.display == 'none') {
    on.style.display = 'block';
    off.style.display = 'none';

    scientific.style.display = 'block';
    basic.style.display = 'none';
  } else {
    on.style.display = 'none';
    off.style.display = 'block';

    scientific.style.display = 'none';
    basic.style.display = 'block';
  }
}
document.getElementById('bulb-on').addEventListener('click', changeMode);
document.getElementById('bulb-off').addEventListener('click', changeMode);




// --- CHANGE COLOR THEME ---
const themeToggle = document.getElementById('themeToggle');
const themeKnob = themeToggle.querySelector('.theme-knob');
const themeIcon = themeToggle.querySelector('.theme-icon-wrapper');

// array of objects *themes[0].name → "light", and themes[0].icon → sun*
const themes = [
  { name: 'light', icon: '<i class="fa-solid fa-sun"></i>' },
  { name: 'dark', icon: '<i class="fa-solid fa-moon"></i>' },
  { name: 'green', icon: '<i class="fa-solid fa-seedling"></i>' },
  { name: 'blue', icon: '<i class="fa-solid fa-snowflake"></i>' }
];

// array of positions for each theme
const knobPositions = ['5px', '30px', '55px', '80px'];


const savedThemeName = localStorage.getItem('selectedTheme');

if (savedThemeName) {
  for (let i = 0; i < themes.length; i++) {
    if (themes[i].name == savedThemeName) {
      currentThemeIndex = i;
      break;
    }
  }
}
else {
  currentThemeIndex = 0;
}


// Apply theme
function applyTheme(index) {
  const theme = themes[index];
  const name = theme.name;
  const icon = theme.icon;

  // Update theme
  document.documentElement.setAttribute('data-theme', name);

  // Update UI
  themeIcon.innerHTML = icon;
  themeKnob.style.left = knobPositions[index];

  // Save theme to LocalStorage
  localStorage.setItem('selectedTheme', name);
}

applyTheme(currentThemeIndex);


// --- INTERACTIONS ---
themeToggle.addEventListener('click', () => {
  currentThemeIndex = currentThemeIndex + 1;  // move to next theme
  if (currentThemeIndex >= themes.length) {
    currentThemeIndex = 0;
  }


  // knob bounce animation
  themeKnob.style.transform = 'scale(0.9)';
  setTimeout(() => (themeKnob.style.transform = 'scale(1)'), 200);

  // Fade icon out/in
  themeIcon.style.opacity = '0';
  setTimeout(() => {
    applyTheme(currentThemeIndex);
    themeIcon.style.opacity = '1';
  }, 200);
});




// --- CALCULATOR LOGIC ---
const equationDisplayElement = document.getElementById('equation-display');
const resultDisplay = document.getElementById('result-display');
const historyList = document.getElementById('history-list');
const buttons = document.querySelectorAll('.buttons button');

let currentEquation = '';
let displayEquation = '';

// Map button text to inter9nal value and display value
const buttonMap = {
  '÷': { value: '/', display: '÷' },
  '×': { value: '*', display: '×' },
  '+': { value: '+', display: '+' },
  '-': { value: '-', display: '-' },
  'x²': { value: '**2', display: '²' },
  'x³': { value: '**3', display: '³' },
  'π': { value: 'Math.PI', display: 'π' },
  'sin()': { value: 'Math.sin(', display: 'sin(' },
  'cos()': { value: 'Math.cos(', display: 'cos(' },
  'tan()': { value: 'Math.tan(', display: 'tan(' },
  'log()': { value: 'Math.log10(', display: 'log(' },
  'ln()': { value: 'Math.log(', display: 'ln(' },
  '√': { value: 'Math.sqrt(', display: '√' },
  'n!': { value: '!', display: '!' }
};

// -- Add to History --
function addToHistory(equation, result) {
  const li = document.createElement('li');
  li.textContent = `${equation} = ${result}`;

  li.addEventListener('click', () => {
    currentEquation = equation;
    equationDisplayElement.textContent = equation;
    resultDisplay.textContent = result;
  });

  historyList.prepend(li); // insert in the beginning
}

// -- Clear history --
function clearHistory() {
  historyList.innerHTML = '';
}
document.getElementById('historyClear').addEventListener('click', clearHistory);


// -- CALCULATIONS --

// Fix unbalanced parentheses before eval
function balanceParentheses(eq) {
  const open = (eq.split('(').length - 1);
  const close = (eq.split(')').length - 1);

  if (open > close) {
    const missing = open - close;
    eq += ')'.repeat(missing);
  }
  return eq;
}

// Transform equation for eval()
function transformEquation(eq) {
  let newEq = eq;
  
  // numbers followed by !
  let match = newEq.match(/\d+!/);
  
  while (match) {
    const numWithExcl = match[0];
    const num = numWithExcl.slice(0, -1); // remove !
    
    // Replace 5! with "factorial(5)"
    newEq = newEq.replace(numWithExcl, `factorial(${num})`);
    
    match = newEq.match(/\d+!/); 
  }
  return newEq;
}


function factorial(n) {
  if (n < 0){
    return null;
  }

  let res = 1;
  for (let i = 2; i <= n; i++) {
    res = res * i;
  }
  return res;
}


// Buttons
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.textContent;

    // CLEAR
    if (value == 'C') {
      currentEquation = '';
      displayEquation = '';
      equationDisplayElement.textContent = '';
      resultDisplay.textContent = '0';
      return;
    }

    // BACKSPACE
    if (value == 'CE') {
      currentEquation = currentEquation.slice(0, -1);
      displayEquation = displayEquation.slice(0, -1);
      equationDisplayElement.textContent = displayEquation;
      return;
    }

    // EQUALS
    if (value == '=') {
      try {
        // Show displayEquation with missing parentheses added
        equationDisplayElement.textContent = balanceParentheses(displayEquation);

        const expression = transformEquation(balanceParentheses(currentEquation));
        const result = eval(expression);

        if (Number.isInteger(result)) {
          resultDisplay.textContent = result;
          addToHistory(balanceParentheses(displayEquation), result);
        } else {
          resultDisplay.textContent = result.toFixed(6);
          addToHistory(balanceParentheses(displayEquation), result.toFixed(6));
        }
        
        return;
      } catch {
        resultDisplay.textContent = 'Error';
        return;
      }
    }

    // Check if button is in map
    if (buttonMap[value]) {
      currentEquation += buttonMap[value].value;
      displayEquation += buttonMap[value].display;
    } else {
      currentEquation += value;
      displayEquation += value;
    }
    equationDisplayElement.textContent = displayEquation;
  });
});
