
// Get the alarms, kick off the main clock loop, where everything happens
$(document).ready(function() {
    if (Cookies.getJSON('alarms')) {
        alarms = Cookies.getJSON('alarms');
        // This is where your call to the REST goes

        updateAlarmsDiv();
        updateClockAlarmArms();
    }
    else{
        alarms = {};
    }

    // Use the "presentTime()" function every 50 ms to loop draw the page, and check for an alarm
    setInterval(function(){
        presentTime();
    }, 50);

});

// This is the function that does the heavy lifting for alarms, and updating the clock hands
function presentTime() {
    var d = new Date();
    // Get them seconds/minutes
    var s = d.getSeconds() + (d.getMilliseconds()/1000);
    var m = d.getMinutes();

    // Hours are a bit more complex. This isn't required, but if time allows I'd like to support an AM/PM thing
    var h = hour12(d);
    var h24 = d.getHours();

    // Update the clock face
    $(".secondHand").css("transform", "translate(-50%, -100%) rotate(" + s*6 + "deg)");
    $(".minuteHand").css("transform", "translate(-50%, -100%) rotate(" + m*6 + "deg)");
    $(".hoursHand").css("transform", "translate(-50%, -100%) rotate(" + (h*30 + m*0.5) + "deg)");

    // This is where we check to see if the current time is an alarm.
    for(a in alarms){
        alarmHours       = alarms[a].split(':')[0];
        alarmMinutes     = alarms[a].split(':')[1];

        //console.log(s);
        if(m == alarmMinutes && h24 == alarmHours && s < .05){
            // This is where the alarm happens
            window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            console.log("ALARM");
        }
    }
}

// To handle 24 hour functions
function hour12(date) {
    var hour = date.getHours();

    if(hour >= 12) {
        hour = hour-12;
    }

    if(hour === 0) {
        h = 12;
    }

    return hour;
}

// Calls the appropriate updates; Saves the data to the cookie, updates clockface and text boxes
function alarmsUpdate(){
    Cookies.set('alarms',alarms); // Only if using cookies not REST
    updateAlarmsDiv();
    updateClockAlarmArms();
}

function editAlarm(alarmID,textBox){
    // Make sure it's a valid input, using REGEX (Thank you PERL)
    var valid = /^([01]\d|2[0-3]):?([0-5]\d)$/.test(textBox.value);
    if(valid) {
        alarms[alarmID] = textBox.value;
        // This is where your call to the REST goes
        alarmsUpdate();
    }
    else{
        // Let the user know, should be louder and preserve the value but TIME
        textBox.style.borderColor = "red";
    }
}

// Adds a new alarm, using the current time as the default value
function addAlarm(){
    var d = new Date();

    // Make sure things are formatted correctly.
    var m = d.getMinutes();
    m = (m < 10) ? ("0" + m) : m;

    var h24 = d.getHours();
    h24 = (h24 < 10) ? ("0" + h24) : h24;
    var alarm = h24 + ':' + m;

    var alarmCount = Object.keys(alarms).length;
    // Added to the end of the chain
    alarms[alarmCount + 1] = alarm;

    // This is where your call to the REST goes
    alarmsUpdate();
}

// Remove the alarm
function removeAlarm(id) {
    // This is where your call to the REST goes
    delete alarms[id];

    var y = 1;
    var alarms2 = {};
    for(x in alarms){
        alarms2[y] = alarms[x];
        y++;
    }
    alarms = alarms2;
    alarmsUpdate();
}


// Display alarms in Text Boxes
function updateAlarmsDiv(){
    $('#alarmsDiv').html('');
    for(x in alarms){
        addTextBox(alarms[x],x);
    }
}

function addTextBox(alarmBox, id){
    var newTextBoxDiv = $(document.createElement('div'))
        .attr("id", 'TextBoxDiv');

    newTextBoxDiv.after().html('<label for="alarmTime">Alarm # : '+id+'</label><a href="" onClick="removeAlarm(\''+ id + '\')" style="float: right">Remove </a>' +
        '<input type="text" name="textbox' +
        '" id="textbox' +  '" class="form-control" aria-describedby="alarmTime" value="'+ alarmBox + '" ' +
        'onblur="editAlarm(\''+ id + '\', this)"/ ><br />');

    newTextBoxDiv.appendTo("#alarmsDiv");
}


//Updates arms
function updateClockAlarmArms(){
    $('div.alarmHand').remove();
    for(x in alarms){
        var rotationHours       = alarms[x].split(':')[0] * 30;
        var rotationMinutes     = alarms[x].split(':')[1] * .5;
        var totalRotation       = rotationHours + rotationMinutes;

        $('#clockFace').append("<div class=\"alarmHand hand\" style=\"transform: translate(-50%, -100%) rotate("+ totalRotation +"deg);\"></div>");
    }


}

// AJAX Rest Examples for JSON alarms by user
function exampleRESTCallForJSON(){
    $.ajax({
        type: "GET",                            // Get/Post/Put/Delete
        url: 'http://{serverNAME}/userID/',     // URL varies by thing you're doing
        data: "",                               // This is where you'd you'd put the JSON alarms
        dataType: 'application/json',
        success: function(data) {
            alarms = data;                      // Return the data if it's appropriate
        },
        error: function(e) {
            alert(e);
        }
    });
}

