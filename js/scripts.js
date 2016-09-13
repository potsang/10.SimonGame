var switchOn = false;
var strictOn = false;
var playerTurn = false;
var computerButtonSeries = [];
var playerButtonSeries = [];
var counter = 0;
var playTimeOut;
var blinkingTimeOut;
var addBtnTimeOut;
var noActionTimeOut;
var newGame = false;
var winCount = 20;
var colorNameMap = {
	1: "green",
	2: "red",
	3: "blue",
	4: "orange"
};

var playBtnDelayMap = {
	1: 1200,
	5: 1000,
	9: 850,
	13: 700
};

var animateDelayMap = {
	1: 550,
	5: 500,
	9: 450,
	13: 400
};

var audioMap = {
	green: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"),
	red: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"),
	blue: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"),
	orange: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3")
};

var error = new Audio("https://github.com/potsang/MyResourceFiles/blob/master/error.ogg?raw=true");
var win = new Audio("https://github.com/potsang/MyResourceFiles/blob/master/success.ogg?raw=true");

var colorMap = {
	green: "rgb(53, 94, 59)",
	red: "rgb(139, 0, 0)",
	blue: "rgb(0, 0, 255)",
	orange: "rgb(255, 69, 0)"
};

var activeColorMap = {
	green: "rgba(53, 94, 59, 0.3)",
	red: "rgba(139, 0, 0, 0.3)",
	blue: "rgba(0, 0, 255, 0.3)",
	orange: "rgba(255, 69, 0, 0.3)"
};

$(document).ready(function() {
    $("#switch").change(function() {
		switchOn = $(this).prop("checked");
		if (switchOn) {
			$(".number").html("--");
			playerTurn = false;
		}
		else {
			powerOff();
			$(".number").html("");			
			$("#strict-led").css("background-color", "black");
			playerTurn = false;
		}
			
    });	
	
	$(".strict-btn").click(function(){
		if (!switchOn)
			return;
		
		var color = $("#strict-led").css("background-color");
		if (strictOn == false) {
			$("#strict-led").css("background-color", "orange");
			strictOn = true;
		}
		else {
			$("#strict-led").css("background-color", "black");
			strictOn = false;
		}
	});
	
    $(".ring").mouseup(function(){
		if (!switchOn)
			return;		
        var color = $(this).attr("id");
		resetButtonColor(color);
    });
    $(".ring").mousedown(function(){
		if (!switchOn || !playerTurn)
			return;		
		
		clearTimeout(noActionTimeOut);
        var color = $(this).attr("id");
		setButtonActiveColor(color);
		if (matchButton(color)) {
			playAudio(color);
			setNoActionTimeOut();
			if (playerButtonSeries.length == 0) {
				clearTimeout(noActionTimeOut);
				if (computerButtonSeries.length == winCount) {
						notifyVictory();
				}
				else {
					addBtnTimeOut = setTimeout(function() {
						addAdditionalButton();
							}, 1500);				
				}
			}
		}
    });	
	
	$(".start-btn").click(function(){	
		if (!switchOn)
			return;	
		
		newGame = true;
		blinkingCounter("--", 500, 4);
	});
});

function matchButton(color) {
	var playerButton = playerButtonSeries.shift();
	
	if (color === playerButton) {
		if (playerButtonSeries.length == 0)
			playerTurn = false;
		
		return true;
	}
	else {
		playerTurn = false;
		
		if (strictOn)
			newGame = true;
		
		blinkingCounter("!!", 250, 4);
		error.play();
	}
	
	return false;
}

function notifyTimeout() {
	playerTurn = false;
	blinkingCounter("!!", 250, 4);
	error.play();	
}

function notifyVictory() {
	newGame = true;
	blinkingCounter("win", 550, 9);
	win.play();	
}

function blinkingCounter(value, delay, numOfBlink) {
	var i = 0;
	(function blinkCounter() {
		if (!switchOn)
			return;
		
		if ($(".number").html().length > 0)
			$(".number").html("");
		else
			$(".number").html(value);
		i++;
		
		blinkingTimeOut = setTimeout(function() {
			if (i < numOfBlink) {
				blinkCounter();
			} else {
				if (newGame)
					startGame();
				else
					repeatLastTime();
			}
			
		}, delay);
	})();		
}

function powerOff() {
	win.pause();
	error.pause();
	clearAllTimeout();
}

function clearAllTimeout() {
	clearTimeout(playTimeOut);
	clearTimeout(blinkingTimeOut);
	clearTimeout(addBtnTimeOut);
	clearTimeout(noActionTimeOut);
}

function startGame() {
	clearAllTimeout();
	computerButtonSeries = [];
	counter = 0;
	newGame = false;
	addAdditionalButton();
}

function addAdditionalButton() {
	if (!switchOn)
		return;		
	playerTurn = false;
	addButton();
	updateCounter(++counter);
	playButtonSeries();		
}

function repeatLastTime() {
	if (!switchOn)
		return;	

	updateCounter(counter);
	playButtonSeries();		
}

function addButton() {
	var i = getRandomInt(1,4);
	computerButtonSeries.push(colorNameMap[i]);
}

function updateCounter(count) {
	$(".number").html(count);
}

function playButtonSeries() {
	var i = 0;
	var idx = getDelayIndex(computerButtonSeries.length);
	(function playButton() {
		if (!switchOn || newGame)
			return;
		
		var color = computerButtonSeries[i];
		animateButton(color, idx);
		i++;
		
		playTimeOut = setTimeout(function() {
			if (i < computerButtonSeries.length) {
				playButton();
			} else {
				playerTurn = true;
				playerButtonSeries = computerButtonSeries.slice(0);
				setNoActionTimeOut();
			}
		}, playBtnDelayMap[idx]);
	})();	
}

function setNoActionTimeOut() {
	noActionTimeOut = setTimeout(function() {
		notifyTimeout();
			}, 5000);		
}

function getDelayIndex(count) {
	if (count < 5)
		return 1;
	else if (count < 9)
		return 5;
	else if (count < 13)
		return 9;
	else
		return 13;
}

function animateButton(color, idx) {
	var button = $(".ring." + color);

	button.animate({backgroundColor: activeColorMap[color]}, animateDelayMap[idx]);
	button.animate({backgroundColor: colorMap[color]}, 250);
	playAudio(color);
}

function resetButtonColor(color) {
	$(".ring." + color).css("background-color", colorMap[color]);	
} 

function setButtonActiveColor(color) {
	$(".ring." + color).css("background-color", activeColorMap[color]);
}

function playAudio(color) {
	audioMap[color].play();
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}