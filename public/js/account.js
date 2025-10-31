//$('#elementId');
//$('.className');

$(document).ready(function() {
    /*
    $('#create-account-btn').click(function(e) {
        e.preventDefault();
        valid = validatePassword(true)
    });
    */

    /*
    $('#close-error-btn').click(function(e) {
        e.preventDefault();
        $('#popup').fadeOut(300);
    })
    */

    $('#pass').on('input', function() {
        validatePassword(false);
    });
});

/*  validates all inputs for creating an account by the user
    returns true if it is VALID; otherwise, false
*/
function checkTrackerID() {
    const id = $('#trackingNumber').val().trim();
    var capitalize = id.slice(0, 3).toUpperCase() + id.slice(3);
    var idData = {
        id: capitalize
    }

    $.post('/search_parcel', idData, function(message, status) {
        if (message.exists) {
            $('#trackingNumber').val("");
            window.location.href = "/search_parcel/track=" + capitalize;
        } else {    
            $('#popup').show();    
            
            setTimeout(function() {
                if ($('#popup').is(':visible')) {
                    $('#popup').hide();
                }
            }, 10000);
        }
    });
}

/*  Checks current password of the user if it matches the rules set
    parameter error - boolean that indicates whether to add the error messages or not
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
    if (false) {
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
        if ($.isNumeric(char)) { //checks if lowercase character
            num = true;
        }
        if (false) { //checks if lowercase character
            symbol = true;
        }
    }

    return [upper, lower, num, symbol]
}

function addError(errorMsg) {
    $('.popup-table').append("<tr class='popup-tr'><td>"+ errorMsg + "</td></tr>");
}

/*
HELPERS:

USERNAME = Case Insensitive but Unique

*/
