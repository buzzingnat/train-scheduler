// Initialize Firebase
  var config = {
    apiKey: "AIzaSyBleUN8UelDCdSBiwJgAShHK9-UIDRKhiw",
    authDomain: "trainscheduler-80ecf.firebaseapp.com",
    databaseURL: "https://trainscheduler-80ecf.firebaseio.com",
    projectId: "trainscheduler-80ecf",
    storageBucket: "",
    messagingSenderId: "981824876190"
  };
  firebase.initializeApp(config);
// Create a variable to reference the database.
var database = firebase.database();

// Initial Values
var name = "";
var destination = "";
var frequency = 0;
var startTime = "00:00";

var convertedDate = Date.now();
console.log(moment(convertedDate).format("MM/DD/YY"));
var auth = $(
// create an anonymous sign in with firebase
    firebase.auth().signInAnonymously().catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
    })
);
var currentUid;
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
    console.log("user is anon? "
        + isAnonymous
        + " and user is signed in: "
        + uid
        + " and user has name: "
        + displayName);
    currentUid = firebase.auth().currentUser.uid;
    // ...
  } else {
    // User is signed out.
    // ...
  }
});

// Capture Button Click
$("#submit").on("click", function(event) {
    event.preventDefault();

    // Grab values from text boxes
    name = $("#trainName").val().trim();
    destination = $("#destination").val().trim();
    frequency = parseInt($("#frequency").val().trim());
    startTime = $("#firstTrainTime").val().trim();

    firebase.database().ref('trains').push({
        name: name,
        destination: destination,
        frequency: frequency,
        startTime: startTime,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });



});

function buildTableRow (name, destination, frequency, nextArrival, minutesAway) {
    row = $(`<tr id=""></tr>`);
    row.append(`<td>${name}</td>`)
        .append(`<td>${destination}</td>`)
        .append(`<td>${frequency}</td>`)
        .append(`<td>${nextArrival}</td>`)
        .append(`<td>${minutesAway}</td>`);
    $("tbody").append(row);
}

// Get a reference to the root of the Database
var rootRef = database.ref();
// Firebase watcher + initial loader + order/limit HINT: .on("child_added"
database.ref("trains").orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
    // storing the snapshot.val() in a variable for convenience
    var snap = snapshot.val();
    // console.log(currentUid);

    // Console.logging the last user's data
    console.log(snap.name);
    console.log(snap.destination);
    console.log(snap.frequency);
    console.log(snap.startTime);
    var nextArrival = trainSchedule.getNextTrainArrivalString();
    var minutesAway = trainSchedule.getMinutesTillTrain();
    buildTableRow (snap.name, snap.destination, snap.frequency, nextArrival, minutesAway);
    // Handle the errors
}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

/*
// Firebase watcher + initial loader + order/limit HINT: .on("child_added"
database.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
    // storing the snapshot.val() in a variable for convenience
    var snap = snapshot.val();
    console.log(currentUid);

    // Console.logging the last user's data
    console.log(snap.name);
    console.log(snap.destination);
    console.log(snap.frequency);
    console.log(snap.startTime);

    // moment( Date.now() ).subtract(moment(snap.startDate).utc(), 'milliseconds');
    var calculatedMonths = parseInt( Date.now() ) - parseInt( moment(snap.startDate).utc() );
    // moment().diff(moment.unix(empStart, "X"), "months")
    // calculatedMonths = Math.floor( moment.duration(calculatedMonths).asMonths() );
    var savedDate = moment("08/03/1919");
    savedDate = moment(savedDate).format("MM/DD/YYYY");
    console.log("it was this many months ago: " + moment().diff(moment(savedDate), "months") );

    var convertedDate = moment(snap.startDate).format("MM/DD/YYYY");
    var monthsWorked = moment().diff(convertedDate, "months");
    var totalBilled = monthsWorked * snap.rate;
    console.log("monthly rate is: " + snap.rate);
    //moment(convertedDate).format("MM/DD/YY");

    // Change the HTML to reflect
    buildTableRow(
        snap.name,
        snap.destination,
        snap.frequency,
        trainSchedule.getNextTrainArrivalString(),
        trainSchedule.getMinutesTillTrain(),
        );
    // Handle the errors
}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});
*/

var trainSchedule = {
    frequency: 4,
    firstTime: "3:30",
    convertFirstTime() {
        return moment(this.firstTime, "hh:mm").subtract(1, "years");
    },
    currentTime: moment(),
    getDifference() {
        var firstTimeConverted = this.convertFirstTime();
        return moment().diff(moment(firstTimeConverted), "months");
    },
    getMinutesTillTrain() {
        var tRemainder = this.getDifference() % this.frequency;
        var tMinutesTillTrain = this.frequency - tRemainder;
        return tMinutesTillTrain;
    },
    getNextTrainArrivalString() {
        var nextTrain = moment().add(this.getMinutesTillTrain(), "minutes");
        return moment(nextTrain).format("hh:mm");
    },
};
console.log(trainSchedule);
console.log(trainSchedule.getMinutesTillTrain());
console.log(trainSchedule.getNextTrainArrivalString());
