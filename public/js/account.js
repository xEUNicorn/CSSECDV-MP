//$('#elementId');
//$('.className');

$(document).ready(function() {
    $('#create-account-btn').click(async function(e) {
        e.preventDefault();
        if (await checkInputs()) {
            $('#security-questions').show();
            // makes the webpage automatically scroll down so the user can see additional questions
            $('html, body').animate({
                scrollTop: $('#security-questions').offset().top
            }, 1500); 
            disableChanges();
        } else {
            $('#order-popup').show();
        }
    });

    $('#close-error-btn').click(function() { 
        setTimeout(function() {
            $('.popup-table').empty();
        }, 500);
        $('#order-popup').fadeOut(300);
    });

    $('#register-account-button').click(async function(e) {
        e.preventDefault();
        if (checkSecurityInputs()) {
            await addToDatabase();
            clear();
        } else {
            $('#order-popup').show();
        }
    });

    $('#pass').on('input', function() {
        validatePassword(false);
    });

    $('select').on('change', function() {
        var selected = $('select').map(function() {
            return $(this).val();
        }).get();

        $('select option').prop('disabled', false) //return to default, all options are available

        $('select').each(function() {
            var current = $(this);
            selected.forEach(function(value) {
                if (value !== "") { // disable once it is already chosen
                    current.find('option[value="'+value+'"]').not(':selected').prop('disabled', true)
                }
            })
        });
    });
});

/*  validates all inputs for creating an account by the user
    returns true if it is VALID; otherwise, false
*/
async function checkInputs() {
    const username = $('#username').val();
    const firstname = $('#firstname').val();
    const lastname = $('#lastname').val();

    const password = $('#pass').val();
    const retype = $('#retype-pass').val();

    var check = true; //check if all inputs are valid or not
    var userInfo = { username: username }

    try {
        check = await checkUsername(userInfo);
    } catch (error) {
        console.error("Error in checking username:", error);
    }

    if (firstname.trim() === "") {
        check = false;
        addError("First Name is EMPTY!");
    }

    if (lastname.trim() === "") {
        check = false;
        addError("Last Name is EMPTY!");
    }

    if (!validatePassword(true)) {
        check = false;
    }

    if (password !== retype) {
        check = false;
        addError("Password and Retype Password are NOT THE SAME");
    }

    return check;
}

/*  checks if the username exists to the database
*/
function checkUsername(userInfo) {
    return $.post('/create_account/unique-username', userInfo)
        .then(response => {
            if (response.exists) {
                addError("Username ALREADY EXISTS!");
                return false; //return false since it already exists so there is error
            }
            else {
                return true;
            }
        })
        .catch(errorMsg => {
            console.error(errorMsg);
            return 0;
        })
}

/*  Checks current password of the user if it matches the rules set
    param: error - boolean that indicates whether to add the error messages or not
    returns true if it is VALID; otherwise, false
*/
function validatePassword(error) {
    /*
    PASSWORDS = Strong password
        Password length
        Password complexity
        Password topologies
    */
    var password = $('#pass').val();
    var password_length = password.length;
    var validated = true;

    //RULE: Must be 10 characters long
    if (password_length >= 10) {
        $('#rule-length').attr('src', '/img/valid.png')
    } else {
        $('#rule-length').attr('src', '/img/invalid.png')
        validated = false;
        if (error) {
            addError("Password is TOO SHORT.");
        }
    }

    // Checker for mix of uppercase, lowercase, number and symbol characters
    var listOfValidation = mixCharactersChecker(password, password_length)
    
    //RULE: Must have at least one (1) UPPERCASE character
    if (listOfValidation[0]) {
        $('#rule-uppercase').attr('src', '/img/valid.png')
    } else {
        $('#rule-uppercase').attr('src', '/img/invalid.png')
        validated = false;
        if (error) {
            addError("Password needs at least ONE (1) UPPERCASE character.");
        }
    }

    //RULE: Must have at least one (1) LOWERCASE character
    if (listOfValidation[1]) {
        $('#rule-lowercase').attr('src', '/img/valid.png')
    } else {
        $('#rule-lowercase').attr('src', '/img/invalid.png')
        validated = false;
        if (error) {
            addError("Password needs at least ONE (1) LOWERCASE character.");
        }
    }

    //RULE: Must have at least one (1) NUMERICAL character
    if (listOfValidation[2]) {
        $('#rule-numerical').attr('src', '/img/valid.png')
    } else {
        $('#rule-numerical').attr('src', '/img/invalid.png')
        validated = false;
        if (error) {
            addError("Password needs at least ONE (1) NUMERICAL character.");
        }
    }

    //RULE: Must have at least one (1) SYMBOL character
    if (listOfValidation[3]) {
        $('#rule-symbol').attr('src', '/img/valid.png')
    } else {
        $('#rule-symbol').attr('src', '/img/invalid.png')
        validated = false;
        if (error) {
            addError("Password needs at least ONE (1) SYMBOL character.");
        }
    }

    //RULE: Must not include your NAME or USERNAME
    if (nameInPassword()) {
        $('#rule-name').attr('src', '/img/valid.png')
    } else {
        $('#rule-name').attr('src', '/img/invalid.png')
        validated = false;
        if (error) {
            addError("Password MUST NOT include your NAME or USERNAME");
        }
    }

    return validated
}

/*  Checks all of the characters passed if they are a mix of uppercase, lowercase, number and symbols characters
    param: password - string of characters to be checked
    param: length - length of string passed
    returns list of boolean [uppercase, lowercase, number, symbol]
*/
function mixCharactersChecker(password, length) {
    var ctr = 0;
    var upper = false;
    var lower = false;
    var num = false;
    var symbol = false;

    while (ctr < length) {
        var char = password[ctr]
        if (char === char.toUpperCase() && char !== char.toLowerCase()) { //checks if uppercase character
            upper = true;
        }
        if (char !== char.toUpperCase() && char === char.toLowerCase()) { //checks if lowercase character
            lower = true;
        }
        if ($.isNumeric(char)) { //checks if numerical character
            num = true;
        }
        if (/^[a-zA-Z0-9 ]*$/.test(char) == false) { //checks if symbol character (space is not included)
            symbol = true;
        }
        ctr++;
    }

    return [upper, lower, num, symbol]
}

/*  Checks password contains their names/username, specifically if at least 4 characters are in there
    returns true if it is VALID; otherwise, false
*/
function nameInPassword() {
    const user = $('#username').val().toLowerCase();
    const first = $('#firstname').val().toLowerCase();
    const last = $('#lastname').val().toLowerCase();
    const pass = $('#pass').val().toLowerCase();

    const user4 = user.slice(0,4);
    const first4 = first.slice(0,4);
    const last4 = last.slice(0,4);

    var checker = true;

    if ((user && pass.includes(user4)) || (first && pass.includes(first4)) ||
        (last && pass.includes(last4))) {
            checker = false;
        }

    return checker
}

/*  Appends the description of error to be displayed in a pop-up alert to the table
    param: errorMsg - description of the error
*/
function addError(errorMsg) {
    $('.popup-table').append("<tr class='popup-tr'><td>"+ errorMsg + "</td></tr>");
}

/*  Keeps the username, first name, last name and password in a locked phase to prevent changes
*/
function disableChanges() {
    $('#username').prop('disabled', true);
    $('#firstname').prop('disabled', true);
    $('#lastname').prop('disabled', true);
    $('#pass').prop('disabled', true);
    $('#retype-pass').prop('disabled', true);
}

/*  validates all inputs for creating an account by the user
    returns true if it is VALID; otherwise, false
*/
function checkSecurityInputs() {
    const secQ1 = $('#question1').val();
    const secQ2 = $('#question2').val();
    const secQ3 = $('#question3').val();

    const ans1 = $('#answer1').val();
    const ans2 = $('#answer2').val();
    const ans3 = $('#answer3').val();

    var check = true;

    if (secQ1 === "") {
        check = false;
        addError("Pick a Question for Security Question 1");
    }

    if (ans1.trim() === "") {
        check = false;
        addError("Security Answer for Question 1 is EMPTY!");
    }

    if (secQ2 === "") {
        check = false;
        addError("Pick a Question for Security Question 2");
    }

    if (ans2.trim() === "") {
        check = false;
        addError("Security Answer for Question 2 is EMPTY!");
    }

    if (secQ3 === "") {
        check = false;
        addError("Pick a Question for Security Question 3");
    }

    if (ans3.trim() === "") {
        check = false;
        addError("Security Answer for Question 3 is EMPTY!");
    }

    return check;
}

/*  adds all information needed to create an account and saves it to the database
*/
async function addToDatabase() {
    try {
        const userId = await generateUserID();
        const username = $('#username').val().trim();
        const firstname = $('#firstname').val().trim();
        const lastname = $('#lastname').val().trim();
        const password = $('#pass').val();

        const name = firstname + " " + lastname;

        const secQ1 = parseInt($('#question1').val());
        const secQ2 = parseInt($('#question2').val());
        const secQ3 = parseInt($('#question3').val());

        const ans1 = $('#answer1').val();
        const ans2 = $('#answer2').val();
        const ans3 = $('#answer3').val();

        const dateNow = formatDateNow();
        
        var orderData = {
            userId: userId,
            username: username,
            name: name,  // First Name Last Name (Format)
            password: password,
            securityQuestions: [secQ1, secQ2, secQ3], // Ex: ["1","2","4"]
            secAns1: ans1,
            secAns2: ans2,
            secAns3: ans3,
            date: dateNow
        };

        $.post('/create_account/register', orderData, function(message, status) {
            console.log("response data: ", message, status);
            if (message.success) {
                const nextPath = $('#path').val()
                setTimeout(function() {
                    window.location.href = nextPath + '/login';
                }, 200);
            } else {
                console.log("not success");
            }
        });
    } catch (error) {
        console.error("Error in generating tracker ID:", error);
    }
}

/*  generate user ID and ask database for the last user ID as its basis
*/
function generateUserID() {
    return $.post('/create_account/generate')
        .then(response => {
            if (response.success) return response.userId;
            else {
                throw new Error("Generation failed");
            }
        })
        .catch(errorMsg => {
            console.error(errorMsg);
            return 0;
        })
}

/*  generate and format the date now for the lastChanged item
*/
function formatDateNow() {
    const dateNow = new Date();

    var month = dateNow.getMonth() + 1;
    var day = dateNow.getDate();
    var year = dateNow.getFullYear();

    var hours = dateNow.getHours();
    var mins = dateNow.getMinutes();
    var secs = dateNow.getSeconds();

    var abbr = hours >= 12 ? 'pm' : 'am';   // abbreviations
    hours = hours % 12;                     // not military time
    hours = hours ? hours : 12;             // 0 means 12

    month = formatWithZeros(month);
    day = formatWithZeros(day);
    hours = formatWithZeros(hours);
    mins = formatWithZeros(mins);
    secs = formatWithZeros(secs);

    // format: mm-dd-yyyy hh:mm:ss am/pm
    var formatted = [month, day, year].join('-') + ' ' + [hours, mins, secs].join(':') + ' ' + abbr;
    return formatted;
}

/*  check and add leading zeros to the numbers
*/
function formatWithZeros(number) {
    return String(number).padStart(2, '0'); //add leading zeros and two digits
}

function clear() {
    $('#username').val();
    $('#firstname').val('');
    $('#lastname').val('');

    $('#pass').val('');
    $('#retype-pass').val('');

    $('#question1').val('');
    $('#answer1').val('');
    $('#question2').val('');
    $('#answer2').val('');
    $('#question3').val('');
    $('#answer3').val('');
}
