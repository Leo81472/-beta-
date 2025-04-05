window.addEventListener('load', () => {
    // 检查是否已经验证过
    const isVerified = localStorage.getItem('keyVerified');
    const calculatorElement = document.querySelector('.calculator');
    const keyVerifyOverlay = document.querySelector('.key-verify-overlay');
    const keyVerifyInput = document.querySelector('.key-verify-input');
    const keyVerifyButton = document.querySelector('.key-verify-button');
    const keyVerifyError = document.querySelector('.key-verify-error');

    // 如果已经验证过，直接显示计算器
    if (isVerified === 'true') {
        keyVerifyOverlay.style.display = 'none';
        calculatorElement.classList.add('verified');
    }

    // 验证按钮点击事件
    keyVerifyButton.addEventListener('click', () => {
        const key = keyVerifyInput.value;
        if (key === '8484') {
            localStorage.setItem('keyVerified', 'true');
            keyVerifyOverlay.style.display = 'none';
            calculatorElement.classList.add('verified');
            keyVerifyError.style.display = 'none';
        } else {
            keyVerifyError.style.display = 'block';
            keyVerifyInput.value = '';
        }
    });

    // 按回车键也可以验证
    keyVerifyInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            keyVerifyButton.click();
        }
    });


    const calculator = {
        displayHistory: document.querySelector('.history'),
        displayCurrent: document.querySelector('.current'),
        firstOperand: null,
        operator: null,
        waitingForSecondOperand: false,
        lastResult: null
    };

    const updateDisplay = () => {
        calculator.displayCurrent.textContent = calculator.displayCurrent.textContent.length > 12 ?
            parseFloat(calculator.displayCurrent.textContent).toExponential(6) :
            calculator.displayCurrent.textContent;
    };

    const inputDigit = (digit) => {
        const { displayCurrent, waitingForSecondOperand } = calculator;
        if (waitingForSecondOperand) {
            calculator.displayCurrent.textContent = digit;
            calculator.waitingForSecondOperand = false;
        } else {
            calculator.displayCurrent.textContent =
                displayCurrent.textContent === '0' ? digit : displayCurrent.textContent + digit;
        }
        updateDisplay();
    };

    const inputDecimal = () => {
        if (calculator.waitingForSecondOperand) {
            calculator.displayCurrent.textContent = '0.';
            calculator.waitingForSecondOperand = false;
            return;
        }
        if (!calculator.displayCurrent.textContent.includes('.')) {
            calculator.displayCurrent.textContent += '.';
        }
    };

    const handleOperator = (nextOperator) => {
        const { firstOperand, displayCurrent, operator } = calculator;
        const inputValue = parseFloat(displayCurrent.textContent);

        if (firstOperand === null && !isNaN(inputValue)) {
            calculator.firstOperand = inputValue;
        } else if (operator) {
            const result = calculate(firstOperand, inputValue, operator);
            calculator.displayCurrent.textContent = `${parseFloat(result.toFixed(7))}`;
            calculator.firstOperand = result;
            calculator.lastResult = result;
        }

        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
        calculator.displayHistory.textContent = `${calculator.firstOperand} ${nextOperator}`;
    };

    const calculate = (firstOperand, secondOperand, operator) => {
        switch (operator) {
            case '+':
                return firstOperand + secondOperand;
            case '-':
                return firstOperand - secondOperand;
            case '×':
                return firstOperand * secondOperand;
            case '÷':
                return firstOperand / secondOperand;
            case '%':
                return firstOperand % secondOperand;
            default:
                return secondOperand;
        }
    };

    const clear = () => {
        calculator.displayCurrent.textContent = '0';
        calculator.displayHistory.textContent = '';
        calculator.firstOperand = null;
        calculator.operator = null;
        calculator.waitingForSecondOperand = false;
        calculator.lastResult = null;
    };

    const deleteLastChar = () => {
        const currentDisplay = calculator.displayCurrent.textContent;
        calculator.displayCurrent.textContent = currentDisplay.length > 1 ?
            currentDisplay.slice(0, -1) : '0';
    };

    const buttons = document.querySelector('.buttons');
    buttons.addEventListener('click', (event) => {
        const { target } = event;
        if (!target.matches('button')) return;

        if (target.classList.contains('operator') && target.dataset.action === 'operator') {
            handleOperator(target.textContent);
            return;
        }

        if (target.classList.contains('decimal')) {
            inputDecimal();
            return;
        }

        if (target.classList.contains('clear')) {
            clear();
            return;
        }

        if (target.classList.contains('equals')) {
            if (calculator.firstOperand !== null && calculator.operator) {
                const secondOperand = parseFloat(calculator.displayCurrent.textContent);
                const result = calculate(calculator.firstOperand, secondOperand, calculator.operator);
                calculator.displayHistory.textContent += ` ${secondOperand} =`;
                calculator.displayCurrent.textContent = `${parseFloat(result.toFixed(7))}`;
                calculator.firstOperand = null;
                calculator.operator = null;
                calculator.waitingForSecondOperand = true;
                calculator.lastResult = result;
            }
            return;
        }

        if (target.dataset.action === 'delete') {
            deleteLastChar();
            return;
        }

        if (target.classList.contains('number')) {
            inputDigit(target.textContent);
        }
    });

    // 将键盘事件监听器移到这里，并添加条件判断
    document.addEventListener('keydown', (event) => {
        // 如果验证对话框可见，不处理计算器的键盘事件
        if (keyVerifyOverlay.style.display !== 'none') {
            return;
        }

        const key = event.key;
        if (key >= '0' && key <= '9') {
            event.preventDefault();
            inputDigit(key);
        } else if (key === '.') {
            event.preventDefault();
            inputDecimal();
        } else if (['+', '-'].includes(key)) {
            event.preventDefault();
            handleOperator(key);
        } else if (key === '*') {
            event.preventDefault();
            handleOperator('×');
        } else if (key === '/') {
            event.preventDefault();
            handleOperator('÷');
        } else if (key === '%') {
            event.preventDefault();
            handleOperator('%');
        } else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            document.querySelector('.equals').click();
        } else if (key === 'Escape') {
            event.preventDefault();
            clear();
        } else if (key === 'Backspace') {
            event.preventDefault();
            deleteLastChar();
        }
    });

    clear();
});