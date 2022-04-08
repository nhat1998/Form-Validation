//  Đối tượng `Validator`
function Validator(options) {

    var selectorRules = {};

    //  Hàm thực hiện validate
    function validate(inputElement, rule) {
        var messageElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorMessage;
        // Lấy ra các rules của selectorRules
        var rules = selectorRules[rule.selector];
        // Lặp qua từng rule và kiểm tra
        for (let i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }
        
        if(errorMessage) {
            messageElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid')
        }
        else {
            messageElement.innerText = "";
            inputElement.parentElement.classList.remove('invalid')
        }
        return !!errorMessage;
    }
    
    //  Lấy element của form cần input
    const elementForm = document.querySelector(options.form);
    
    // Xử lý khi submit form
    elementForm.onsubmit = function(e) {
        e.preventDefault();
        var isFormValid = true;

        // Lặp qua từng rule và validate
        options.rules.forEach(function(rule) {
            var inputElement = elementForm.querySelector(rule.selector);
            var isValid = validate(inputElement, rule);
            if(isValid) {
                isFormValid = false;
            }
        });
        if (isFormValid) {
            if (typeof options.onSubmit === 'function') {
                var inputValues = elementForm.querySelectorAll('[name]');
                var values = Array.from(inputValues).reduce(function(value, index) {
                    value[index.name] = index.value;
                    return value;
                }, {});
                options.onSubmit(values);
            }
        }

    }

    if(elementForm) {
        // lặp qua mỗi rule 
        options.rules.forEach(function(rule) {
            var inputElement = elementForm.querySelector(rule.selector);

            // lưu các rule vào selectorRules
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            
            if(inputElement) { 
                // xử lý trường hợp blur khỏi input   
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }
                // xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function() {
                    var messageElement = inputElement.parentElement.querySelector(options.errorSelector);
                    messageElement.innerText = "";
                    inputElement.parentElement.classList.remove('invalid')
                }
            };
        })
    };

}

// Định nghĩa các rules
// Nguyên tắc của các rules:
// 1. không nhập giá trị hoặc giá trị k hợp lệ =>có lỗi => trả ra message lỗi
// 2. hợp lệ => không trả ra gì cả (undefined)
Validator.isRequired = function(selector, message) {
    return {
        selector,
        test(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector,
        test(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

Validator.minLength = function(selector, min, message) {
    return {
        selector,
        test(value) {
            return value.length >= min ? undefined : message || `Bạn phải nhập ít nhất ${min} ký tự`
        }
    }
}

Validator.isConfirmed = function(selector, confirmValue, message) {
    return {
        selector,
        test(value) {
            return value === confirmValue() ? undefined : message || `Giá trị nhập lại không đúng`
        }
    }
}