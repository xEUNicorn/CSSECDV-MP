//$('#elementId');
//$('.className');

$(document).ready(function() {
    //add button for item description in case more than one item
    $('#add-btn').click( async function(e) {
        e.preventDefault();
        var newItem = 
            $("<div class='add-item-container'>" + 
                "<div>" +
                    "<input type='number' min='1' class='qty-input' placeholder='Qty.' required><br>" +
                "</div>" +
                "<div>" +
                    "<input type='text' class='desc-input' placeholder='Item Description' required>" +
                    "<br>" +
                "</div>" +
                "<div>" +
                    "<input type='number' class='cost-input' min='1' placeholder='Cost' required>" +
                "</div>" +
                "<div id='x-button-div'>" +
                    "<img src='/img/x-circle-fill.svg' class='x-button' /><br>" +
                "</div>" +
            "</div>"); //new item to be placed in items-div
        $('#items-div').append(newItem);
        $('#charge-calc').text('');
        $('#total-calc').text('');
    });

    //removes the specific item based on x button
    $('#items-div').on('click', '.x-button', function () {
        $(this).closest('.add-item-container').remove();
        updateCharge();
    });

    //updates the charge based on quantity and cost, including discount
    $('#items-div').on('input', '.qty-input, .desc-input, .cost-input', function() {
        updateCharge();
    });

    $('#discount-input').on('input', function () {
        var final = 0;
        var charge = 0;
        var discount = 0;
        var filled = true;
        const inputCharge = $('#charge-calc').text();
        const inputDiscount = $('#discount-input').val();

        if (inputCharge === '') {
            filled = false;
        } else {
            charge = parseFloat(inputCharge);
        }

        if (inputDiscount !== '') {
            discount = parseFloat(inputDiscount);
            if (discount > charge) {
                $('#discount-input').val('');
                discount = 0;
            }
        }
        final = charge - discount;

        if (filled) {
            $('#total-calc').text(final.toFixed(2));
        } else {  // Clear display
            $('#total-calc').text('');
        }
    });

    //validates the order form when submit button is clicked
    $('#submit-btn').click(async function(e) {
        e.preventDefault(); 
        if (validateInput()) {
            //remove all inputs, save to database, confirm that
            await addToDatabase();
            clear();
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
    

    //clears all input then go back to view order
    $('#cancel-btn').click(function() { 
        clear();
        window.location.href = "/admin/view-orders";
    });

    //validates the order form when submit button is clicked
    $('#save-btn').click(function(e) {
        e.preventDefault(); 
        if (validateInput()) {
            //remove all inputs, save to database, confirm that
            updateDatabase();
            clear();
        } else {
            $('#order-popup').show();
        }
    });

    $('#dateInput').on('input', function() {
        if (checkDate()) { 
            $(this).css('background-color', '');
        } else {
            $(this).css('background-color', 'red');
        }
    });

    //updates the order status
    $('#update-btn').click(function(e) {
        e.preventDefault(); 
        if(checkDate()) {
            updateStatus();
        }
        
    });

    //delete order based on order
    $('#deleting-order').click(function() {
        var orderId = $("#delete-orderid").val();
        var deleteData = {
            id : orderId,
        };

        $.post('/admin/delete-order', deleteData, function(message, status) {
            console.log("response data: ", message, status);
            if (message.success) {
                setTimeout(function() {
                    window.location.href = "/admin/view-orders";
                }, 300);
            } else {
                console.log("not success");
            }
        });
    });
});

/*  validates all the required inputs by the user
    returns true if ALL is VALID; otherwise, false
*/
function validateInput() { //discount is optional
    const sender = $('#inputSender').val();
    const senderNum = $('#inputSenderNum').val();
    const receiver = $('#inputReceiver').val();
    const receiverNum = $('#inputReceiverNum').val();
    const date = $('#inputDate').val();
    const branch = $('#inputBranch').val();
    const destBranch = $('#inputDestBranch').val();

    var noError = true;
    $('.popup-table').empty(); //just in case

    if (checkEmpty(sender)) {
        noError = false;
        addError("SENDER NAME is empty!");
    }

    if (checkEmpty(senderNum)) {
        noError = false;
        addError("SENDER NUMBER is empty!");
    } else if (checkNumber(senderNum)) {
        noError = false;
        addError("SENDER NUMBER is in incorrect format! [Follow 9XX XXX XXXX where X is any digit.]");
    }
    
    if (checkEmpty(receiver)) {
        noError = false;
        addError("RECEIVER NAME is empty!");
    }

    if (checkEmpty(receiverNum)) {
        noError = false;
        addError("RECEIVER NUMBER is empty!");
    } else if (checkNumber(receiverNum)) {
        noError = false;
        addError("RECEIVER NUMBER is in incorrect format! [Follow 9XX XXX XXXX where X is any digit.]");
    }

    if (checkEmpty(date)) {
        noError = false;
        addError("Estimated TRANSPORT DATE is empty!");
    }

    if (checkEmpty(branch)) {
        noError = false;
        addError("Kindly pick one option in ORIGIN BRANCH.");
    }

    if (checkEmpty(destBranch)) {
        noError = false;
        addError("Kindly pick one option in DESTINATION BRANCH.");
    }

    var input = 0;
    $('.qty-input').each(function() {  //each quantity
        var qty = $(this).val();
        if (!qty) { //check if input is empty or not 
            noError = false;
            input++;
        }
    });

    if (input > 0) {
        addError("One of the QUANTITY inputs is empty!");
    }

    input = 0;
    $('.desc-input').each(function() {  //each description
        var desc = $(this).val();
        if (!desc) { //check if input is empty or not 
            noError = false;
            input++;
        }
    });

    if (input > 0) {
        addError("One of the DESCRIPTION inputs is empty!");
    }

    input = 0;
    $('.cost-input').each(function() {  //each cost
        var cost = $(this).val();
        if (!cost) { //check if input is empty or not 
            noError = false;
            input++;
        }
    });

    if (input > 0) {
        addError("One of the COST inputs is empty!");
    }

    return noError;
}

/*  starter pack of the website
    sets the date option limited to EDT onwards only
*/
function setDateLimit() {
    const givenEDT = $("#hidden-edt").val();
    console.log(givenEDT);
    const [mm, dd, yyyy] = givenEDT.split('-').map(Number); //split them into numbers
    const month = String(mm).padStart(2, '0');
    const day = String(dd).padStart(2, '0');
    const minDate = `${yyyy}-${month}-${day}`;  //format

    $('#dateInput').attr('min', minDate);
}

/*  validates the date the user inputs manually
    returns true and clears input if INVALID date; otherwise, false
*/
function checkDate() {
    const inputDate = new Date($('#dateInput').val());

    const givenEDT = $("#hidden-edt").val();
    console.log("INPUT", inputDate);
    const [mm, dd, yyyy] = givenEDT.split('-').map(Number); //split them into numbers
    const month = String(mm).padStart(2, '0');
    const day = String(dd).padStart(2, '0');
    const edtDate = new Date(`${yyyy}-${month}-${day}`); 
    console.log("EDT2", edtDate);
    console.log(inputDate < edtDate);

    if (inputDate < edtDate) {
        return false;
    }
    return true;
}

/*  checks if user input is empty or not
    returns true if EMPTY; otherwise, false
*/
function checkEmpty(value) {
    if (value === "" || value === null) 
        return true;
    return false;
}

function checkNumber(value) {
    const regex = /^9\d{2} \d{3} \d{4}$/;
    if (typeof value === 'string' && regex.test(value)) {
        return false;   //this means that there is no error
    }
    return true;
}

function addError(errorMsg) {
    $('.popup-table').append("<tr class='popup-tr'><td>"+ errorMsg + "</td></tr>");
}

function clear() {
    $('#inputSender').val('');
    $('#inputSenderNum').val();
    $('#inputReceiver').val('');
    $('#inputReceiverNum').val('');
    
    $('.qty-input').val('');
    $('.desc-input').val('');
    $('.cost-input').val('');
    $('#items-div .add-item-container').remove();

    $('#discount-input').val('');
    $('#inputDate').val('');
    $('#inputBranch').val('');
    $('#inputDestBranch').val('');
}

function updateCharge() {
    var totalCharge = 0;
    var discount = 0;
    var finalCharge = 0;
    var filled = true;

    // Loop through each item container
    $('.item-container').each(function() {
        const qty = $(this).find('.qty-input').val();
        const desc = $(this).find('.desc-input').val();
        const cost = $(this).find('.cost-input').val();

        if (qty === '' || cost === '' || desc === '') {    // If either one is blank, stop
            filled = false;
            return false; // Stop the loop
        }

        // Add to totals after converting to float
        var quantity = parseFloat(qty, 10);
        var charge = parseFloat(cost, 10);
        totalCharge += quantity * charge;
    });

    if ($('.add-item-container').length > 0) {  //check if this exists
        $('.add-item-container').each(function() {
            const qty = $(this).find('.qty-input').val();
            const desc = $(this).find('.desc-input').val();
            const cost = $(this).find('.cost-input').val();

            if (qty === '' || cost === '' || desc === '') {    // If either one is blank, stop
                filled = false;
                return false; // Stop the loop
            }

            // Add to totals after converting to float
            var quantity = parseFloat(qty, 10);
            var charge = parseFloat(cost, 10);
            totalCharge += quantity * charge;
        });
    }

    const inputDiscount = $('#discount-input').val();
    if (inputDiscount !== '') {
        discount = parseFloat(inputDiscount);
    }
    finalCharge = totalCharge - discount;

    // Update display
    if (filled) {
        $('#charge-calc').text(totalCharge.toFixed(2)); //2 decimal places
        $('#total-calc').text(finalCharge.toFixed(2));
    } else {  // Clear display
        $('#charge-calc').text('');
        $('#total-calc').text('');
    }
}

async function addToDatabase() {
    try {
        const ID = await generateTrackerID();
        const sender = $('#inputSender').val();
        const senderNum = parseInt($('#inputSenderNum').val().replace(/\s+/g, ''), 10);
        const receiver = $('#inputReceiver').val();
        const receiverNum = parseInt($('#inputReceiverNum').val().replace(/\s+/g, ''), 10);
        
        const date = $('#inputDate').val();
        const branch = $('#inputBranch').val();
        const destBranch = $('#inputDestBranch').val();

        const initial = parseFloat($('#charge-calc').text());
        const discount = parseFloat($('#discount-input').val()) || 0;
        const charge = parseFloat($('#total-calc').text());

        var allQty = [];
        var allDesc = [];
        var allCost = [];

        $('.qty-input').each(function() {
            var num = parseInt($(this).val(), 10);
            allQty.push(num);
        });

        $('.desc-input').each(function() {
            allDesc.push($(this).val());
        });

        $('.cost-input').each(function() {
            var num = parseFloat($(this).val());
            allCost.push(num.toFixed(2));
        });

        var [year, month, day] = date.split("-"); //date is yyyy-mm-dd
        var newDate = "" + month + "-" + day + "-" + year + "";

        var list = sender.split(" ");
        for (var i = 0; i < list.length; i++) {
            if (list[i]) { 
                list[i] = list[i][0].toUpperCase() + list[i].slice(1);
            }
        }
        const fixedSender = list.join(" ");

        list = receiver.split(" ");
        for (var i = 0; i < list.length; i++) {
            if (list[i]) { 
                list[i] = list[i][0].toUpperCase() + list[i].slice(1);
            }
        }
        const fixedReceiver = list.join(" ");

        var orderData = {
            orderId : ID,
            senderName : fixedSender,
            receiverName : fixedReceiver,
            senderNum : senderNum,
            receiverNum : receiverNum,

            itemNum : allQty,
            itemDesc : allDesc,
            itemPrice : allCost,

            transDate : newDate,
            originBranch : branch,
            destBranch : destBranch,

            initialCharge : initial,
            discount : discount,
            total : charge,

            status : "PROCESSING",
            arrivalDate : "---",
            updates : []
        };

        $.post('/admin/add-order', orderData, function(message, status) {
            console.log("response data: ", message, status);
            if (message.success) {
                setTimeout(function() {
                    window.location.href = "/admin/view-orders";
                }, 200);
            } else {
                console.log("not success");
            }
        });
    } catch (error) {
        console.error("Error in generating tracker ID:", error);
    }
}

function generateTrackerID() {    
    return new Promise((resolve, reject) => { //this is since there is loop in validating
        const dateInput = $('#inputDate').val();
        const date = new Date(dateInput);

        const constantDay = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const dayStr = constantDay[date.getDay()]; 

        const randomize = '0123456789';

        // Get all existing order IDs based on given dayStr
        $.post('/admin/validate', { prefix: dayStr }, function(response) {
            if (!response.success) {
                reject('Failed to fetch existing IDs');
                return;
            }

            const existingNumbers = response.orders.map(orderId => orderId.substring(3));

            function generateUniqueID() { // Generating a unique tracker ID
                var number;
                var trackID;

                do {
                    number = '';
                    trackID = dayStr;
                    
                    for (var i = 0; i < 5; i++) {   //randomize number
                        const randomNum = randomize[Math.floor(Math.random() * 10)];
                        trackID += randomNum;
                        number += randomNum;
                    }
                } while (existingNumbers.includes(number));  //make sure this random number is not existing
                return trackID;
            }

            const uniqueID = generateUniqueID();
            resolve(uniqueID);
        }).fail(function() {
            reject('Failed to fetch order IDs');
        });
    });
}

function updateDatabase() {
    const orderId = $('#orderId').val();
    const sender = $('#inputSender').val();
    const senderNum = parseInt($('#inputSenderNum').val().replace(/\s+/g, ''), 10);
    const receiver = $('#inputReceiver').val();
    const receiverNum = parseInt($('#inputReceiverNum').val().replace(/\s+/g, ''), 10);
    
    const date = $('#inputDate').val();
    const branch = $('#inputBranch').val();
    const destBranch = $('#inputDestBranch').val();

    const initial = parseFloat($('#charge-calc').text());
    const discount = parseFloat($('#discount-input').val()) || 0;
    const charge = parseFloat($('#total-calc').text());

    var allQty = [];
    var allDesc = [];
    var allCost = [];

    $('.qty-input').each(function() {
        var num = parseInt($(this).val(), 10);
        allQty.push(num);
    });

    $('.desc-input').each(function() {
        allDesc.push($(this).val());
    });

    $('.cost-input').each(function() {
        var num = parseFloat($(this).val());
        allCost.push(num.toFixed(2));
    });

    var [year, month, day] = date.split("-"); //date is yyyy-mm-dd
    var newDate = "" + month + "-" + day + "-" + year + "";

    var list = sender.split(" ");
    for (var i = 0; i < list.length; i++) {
        if (list[i]) { 
            list[i] = list[i][0].toUpperCase() + list[i].slice(1);
        }
    }
    const fixedSender = list.join(" ");

    list = receiver.split(" ");
    for (var i = 0; i < list.length; i++) {
        if (list[i]) { 
            list[i] = list[i][0].toUpperCase() + list[i].slice(1);
        }
    }
    const fixedReceiver = list.join(" ");

    var orderData = {
        orderId : orderId,
        senderName : fixedSender,
        receiverName : fixedReceiver,
        senderNum : senderNum,
        receiverNum : receiverNum,

        itemNum : allQty,
        itemDesc : allDesc,
        itemPrice : allCost,

        transDate : newDate,
        originBranch : branch,
        destBranch : destBranch,

        initialCharge : initial,
        discount : discount,
        total : charge,
    };

    $.post('/admin/edit-order', orderData, function(message, status) {
        console.log("response data: ", message, status);
        if (message.success) {
            setTimeout(function() {
                window.location.href = "/admin/view-orders";
            }, 500);
        } else {
            console.log("not success");
        }
    });
}

function updateStatus() {
    // for updating date
    const current = new Date(); 
    var month = String(current.getMonth() + 1).padStart(2, '0'); 
    var day = String(current.getDate()).padStart(2, '0');
    var year = current.getFullYear();
    const currentDate = `${month}-${day}-${year}`;
    
    // for updating time
    var hours = current.getHours(); //format time
    const minutes = String(current.getMinutes()).padStart(2, '0');
    const seconds = String(current.getSeconds()).padStart(2, '0');
    const check = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // since it is in military time, change to 12-hour format
    const currentTime = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${check}`;

    const orderId = $('#hidden-orderid').val();
    const date = $('#dateInput').val();
    const status = $('#edit-select').val();

    //reformat eda to mm-dd-yyyy for consistency
    [year, month, day] = date.split("-"); //date is yyyy-mm-dd
    var newDate = "" + month + "-" + day + "-" + year + "";

    var description = "";
    if (status === "PROCESSING") {
        description = "The order has been received and is being prepared for shipment";
    } else if (status === "IN TRANSIT") {
        description = "The package is on its way to the destination";
    } else if (status === "READY FOR PICKUP") {
        description = "The package is available at a local facility for the recipient to pick up";
    } else if (status === "DELIVERED") {
        description = "The package has been successfully delivered or claimed to the recipient";
    } else {
        description = "Unknown status";
    }

    var updateData = {
        id : orderId,
        newStatus : status,
        newEDA : newDate,
        newDate : currentDate,
        newTime : currentTime,
        statusDesc : description
    };

    $.post('/admin/update-order', updateData, function(message, status) {
        console.log("response data: ", message, status);
        if (message.success) {
            setTimeout(function() {
                window.location.href = "/admin/view-orders";
            }, 300);
        } else {
            console.log("not success");
        }
    });
}

// Dropdown menu toggle function
function dropDownMenu() {
    var links = document.getElementById('links');
    if (links.style.display === 'none' || links.style.display === '') {
        links.style.display = 'block';
    } else {
        links.style.display = 'none';
    }
}



