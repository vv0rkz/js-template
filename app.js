const calcBtn = document.querySelectorAll(".calc-item")
const result = document.getElementById("result")

const EMPTY_VAL = "0"

const validateRes = (val) => {
    // Валдиация выражения перед получением результата
    if (val.length === 0) {
        // пустая строка не валидна
        return false
    }
    let valTrimStr = val.trim()
    const firstToken = valTrimStr[0]
    if (firstToken !== "-" && isNaN(firstToken)) {
        // __запрещено: (*|+|/)123...
        return false
    }
    const lastToken = valTrimStr.at(-1)
    if (isNaN(lastToken)) {
        // __запрещено: ...123(*|+|/|-)
        return false
    }

    // __запрещено: ...++...
    // пример  1 + 3 ✅
    // пример  1 + + 3 ❌
    // правило: кол-во операндов = кол-во чисел - 1
    if (/[+*\/\-][+*\/\-]/.test(valTrimStr)) {
        return false
    }

    return true
}

const updateRes = (val) => {
    try {
        let result = document.getElementById("result")
        if (val === "=" || val === "Enter") {
            if (validateRes(result.textContent)) {
                result.textContent = eval(result.textContent)
                result.classList.remove("error")
            } else {
                throw new Error("Ошибка: введено некоретное значение")
            }
        } else if (val === "RM") {
            result.textContent = EMPTY_VAL
        } else if (val === "⌫" || val === "Backspace") {
            if (result.textContent && result.textContent !== "0") {
                result.textContent = result.textContent.slice(0, -1)
            } else {
                result.textContent = EMPTY_VAL
            }
        } else {
            result.textContent += val
        }
    } catch (e) {
        result.classList.add("error")
    }
}

for (let btn of calcBtn) {
    btn.addEventListener("click", function () {
        const val = this.textContent
        updateRes(val)
    })
}

document.addEventListener("keydown", function (event) {
    const val = event.key
    if (!isNaN(val) || ["+", "-", "*", "/", "Enter", "Backspace"].includes(val)) {
        updateRes(val)
    }
})
