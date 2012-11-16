var mc;
$(document).ready(function() {
    mc = new MC();
    mc.loadContent();
    mc.render();


});


/**
 * @constructor
 * @param node
 * @param view
 * @returns
 */
function MC(node, view) {
	this.node = node;
	this.view = view;
	//this.content = node.getContent().getContentJSON();
    this.content = {};
    this.properties = {};
    this.correctResponse = [];
	this.choices = [];
	this.attempts = [];
	this.stages = [];
    this.states = [];

	//boolean to prevent shuffling after each answer submit
	this.previouslyRendered = false;
};

MC.prototype.loadContent = function() {
    var choices = this.choices;
    $('.choice').each(function() {
        var elem = $(this);
        var choice = {
            identifier: elem.attr('identifier'),
            text: elem.find('.text').html(),
            feedback: elem.find('.feedback').html()
        };
        choices.push(choice);
    });
    
    this.content.prompt = $('.prompt').html();
    this.properties.shuffle = $('#interaction').attr('shuffle');
    this.properties.maxChoices = $('#interaction').attr('maxchoices');
    var corrResponses = $('.correctResponse')
    for(var i = 0; i != corrResponses.length; i++){
        this.correctResponse.push($(corrResponses[i]).attr('identifier'));
    }


};

/**
 * Load the state for this MC given the node and view but do
 * not call render
 * @param node
 * @param view
 */
MC.prototype.loadForTicker = function(node, view) {
	this.view = view;
	this.node = node;
	this.loadState();
};

/**
 * Loads state from the view
 */
MC.prototype.loadState = function() {
	for (var i=0; i < this.view.getVLEState().visitedNodes.length; i++) {
		var nodeVisit = this.view.getVLEState().visitedNodes[i];
			for (var j=0; j<nodeVisit.nodeStates.length; j++) {
				this.states.push(nodeVisit.nodeStates[j]);
			};
    };
};

/**
 * Get the latest state
 * @returns the latest state
 */
MC.prototype.getLatestState = function(){
	var latestState = null;

	if(this.states && this.states.length>0){
		latestState = this.states[this.states.length -1];
	};

	return latestState;
};

/**
 * Get the student's latest submission for this node that has work.
 * The node is specific to a student.
 * @param nodeId the id of the node we want the student's work from
 * @return the newest NODE_STATE for this node
 */
MC.prototype.getLatestStateFromNodeId = function(nodeId) {
	var nodeVisits = this.view.getVLEState().getNodeVisitsByNodeId(nodeId);

	/*
	 * loop through all the nodeVisits and find the latest nodeVisit
	 * that has content in the nodeStates
	 */
	for(var x=0; x<nodeVisits.length; x++) {
		//loop through the nodeVisits starting from the end
		var nodeVisit = nodeVisits[nodeVisits.length - (x + 1)];
		if(nodeVisit != null) {
			//an array of nodeStates
			var nodeStates = nodeVisit.nodeStates;

			//check if there is anything in the nodeStates
			if(nodeStates != null && nodeStates.length > 0) {
				//get the latest nodeState
				var nodeState = nodeStates[nodeStates.length - 1];
				return nodeState;
			};
		};
	};
	return null;
};

//gets and returns a choice object given the choice's identifier
MC.prototype.getChoiceByIdentifier = function(identifier) {
	for (var i=0;i<this.choices.length;i++) {
		if (this.removeSpace(this.choices[i].identifier) == identifier) {
			return this.choices[i];
		};
	};
	return null;
};

function displayNumberAttempts(part1, part2, states) {
	var nextAttemptNum = states.length + 1;
	var nextAttemptString = "";
	if (nextAttemptNum == 1) {
		nextAttemptString = "1st";		
	} else if (nextAttemptNum == 2) {
		nextAttemptString = "2nd";		
	} else if (nextAttemptNum == 3) {
		nextAttemptString = "3rd";		
	} else {
		nextAttemptString = nextAttemptNum + "th";		
	}
	$('#numberAttemptsDiv').html(part1 + " " + nextAttemptString + " " + part2 +".");
};
MC.prototype.tryAgain = function(e) {
    if ($("#tryAgainButton").parent().hasClass("ui-state-disabled")) {
        return;
    }

    mc.render();
};

//var newWin = null;
//function popUp(strURL, strType, strHeight, strWidth) {
    //if (newWin != null && !newWin.closed)
        //newWin.close();
    //var strOptions="";
    //if (strType=="console")
        //strOptions="resizable,height="+
            //strHeight+",width="+strWidth;
    //if (strType=="fixed")
        //strOptions="status,height="+
            //strHeight+",width="+strWidth;
    //if (strType=="elastic")
        //strOptions="toolbar,menubar,scrollbars,"+
            //"resizable,location,height="+
            //strHeight+",width="+strWidth;
    //newWin = window.open(strURL, 'newWin', strOptions);
    //newWin.focus();
//}
/**
 * Render the MC
 */
MC.prototype.render = function() {
    if(!this.previouslyRendered) {
        $('body').html(pageTemplate);
    }
    /* set the question type title */
	$('#questionType').html('Multiple Choice');

	//get the latest state
	var latestState = this.getLatestState();

	if(latestState != null && latestState.isCorrect) {
		//the student previously answered the question correctly

		if(this.content.hideQuestionAndAnswersAfterAnsweredCorrectly) {
			//we do not want to show the question or the answers

			//hide the labels
			$('#questionLabelDiv').hide();
			$('#answersLabelDiv').hide();

			//display the message to the student
			$('#promptDiv').html('You have completed this step.');

			//we are done rendering the step
			//this.node.view.eventManager.fire('contentRenderComplete', this.node.id, this.node);
			return;
		}
	}

	/* render the prompt */
	$('#promptDiv').html(this.content.prompt);

	/* remove buttons */
	var radiobuttondiv = document.getElementById('radiobuttondiv');
	while(radiobuttondiv.hasChildNodes()) {
		radiobuttondiv.removeChild(radiobuttondiv.firstChild);
	}

	/*
	 * if shuffle is enabled, shuffle the choices when they enter the step
	 * but not each time after they submit an answer
	 */
	if(this.properties.shuffle && !this.previouslyRendered){
		this.choices.shuffle();
	}

	/* set variable whether this multiplechoice should be rendered with radio buttons or checkboxes */
	if(this.properties.maxChoices==1){
		var type = 'radio';
	} else {
		var type = 'checkbox';
	}

	/* render the choices */
	for(var i=0;i<this.choices.length;i++) {
		var choiceHTML = '<table><tbody><tr><td><input type="' + type + '" name="radiobutton" id="' + this.removeSpace(this.choices[i].identifier) +
			'" value="' + this.removeSpace(this.choices[i].identifier) + '" class="' + type + '"/></td><td><div id="choicetext:' + this.removeSpace(this.choices[i].identifier) +
			'">' + this.choices[i].text + '</div></td><td><div id="feedback_' + this.removeSpace(this.choices[i].identifier) + '" name="feedbacks"></div></td></tr></tbody></table>';

		$('#radiobuttondiv').append(choiceHTML);
		$('#' + this.removeSpace(this.choices[i].identifier)).click(function(){enableCheckAnswerButton('true');});

		if(this.selectedInSavedState(this.choices[i].identifier)){
			$('#' + this.removeSpace(this.choices[i].identifier)).attr('checked', true);
		}
	}

	$('#checkAnswerButton').parent().addClass('ui-state-disabled');
	$('#tryAgainButton').parent().addClass('ui-state-disabled');
	clearFeedbackDiv();

	if (this.correctResponse.length<1){
		// if there is no correct answer to this question (ie, when they're filling out a form),
		// change button to say "save answer" and "edit answer" instead of "check answer" and "try again"
		// and don't show the number of attempts.
		document.getElementById("checkAnswerButton").innerHTML = "Save Answer";
		document.getElementById("tryAgainButton").innerHTML = "Edit Answer";
	} else {
		displayNumberAttempts("This is your", "attempt", this.attempts);
	};

	if(latestState != null && latestState.isCorrect) {
		//the student previously answered the question correctly

		//display the message that they correctly answered the question
		var resultMessage = this.getResultMessage(latestState.isCorrect);

		//check if scoring is enabled
		if(this.isChallengeScoringEnabled()) {
			//display the score they received
			var score = this.getScore(this.attempts.length);
			resultMessage += " You received " + score + " point(s).";
		}

		$('#resultMessageDiv').html(resultMessage);
	} else {
		//student has not answered this question correctly

		//check if challenge question is enabled
		//if(this.isChallengeEnabled()) {
			////challenge question is enabled so we will create the constraint
			//eventManager.fire('addConstraint',{type:'WorkOnXBeforeAdvancingConstraint', x:{id:this.node.id, mode:'node'}, id:this.node.utils.generateKey(20), workCorrect:true, buttonName:"Check Answer"});
		//}
	}


	//turn this flag on so that the step does not shuffle again during this visit
	this.previouslyRendered = true;

	//this.node.view.eventManager.fire('contentRenderComplete', this.node.id, this.node);
};

/**
 * Get the table that displays the current possible scores
 */
MC.prototype.getCurrentPossibleScoreTableHtml = function() {
	var html = "";

	//check if there is an attempts object
	if(this.properties.attempts != null) {

		//get the latest state
		var latestState = this.getLatestState();

		//get the scores
		var scores = this.properties.attempts.scores;

		//get the number of attempts the student has made
		var numAttempts = this.attempts.length;

		if(latestState != null && !latestState.isCorrect) {
			/*
			 * the student has not answered the question correctly so their
			 * possible current possible score is if they answer it on their
			 * next attempt
			 */
			numAttempts += 1;
		}

		//generate the current possible score table
		html = getCurrentPossibleScoreTable(numAttempts, scores);
	}

	return html;
};

/**
 * Determine if challenge question is enabled
 */
MC.prototype.isChallengeEnabled = function() {
	return false;
};


/**
 * Determine if scoring is enabled
 */
MC.prototype.isChallengeScoringEnabled = function() {
	var result = false;

	if(this.properties.attempts != null) {
		var scores = this.properties.attempts.scores;

		//check if there are scores
		result = challengeScoringEnabled(scores);
	}

	return result;
};

/**
 * Given a choiceId, checks the latest state and if the choiceId
 * is part of the state, returns true, returns false otherwise.
 *
 * @param choiceId
 * @return boolean
 */
MC.prototype.selectedInSavedState = function(choiceId){
	if(this.states && this.states.length>0){
		var latestState = this.states[this.states.length -1];
		for(var b=0;b<latestState.length;b++){
			if(latestState.choices[b]==choiceId){
				return true;
			};
		};
	};

	return false;
};

/**
 * If prototype 'shuffle' for array is not found, create it
 */
if(!Array.shuffle){
	Array.prototype.shuffle = function (){
        for(var rnd, tmp, i=this.length; i; rnd=parseInt(Math.random()*i), tmp=this[--i], this[i]=this[rnd], this[rnd]=tmp);
    };
};

/**
 * Returns true if the choice with the given id is correct, false otherwise.
 */
MC.prototype.isCorrect = function(id){
	/* if no correct answers specified by author, then always return true */
	if(this.correctResponse.length==0){
		return true;
	};

	/* otherwise, return true if the given id is specified as a correct response */
	for(var h=0;h<this.correctResponse.length;h++){
		if(this.correctResponse[h]==id){
			return true;
		};
	};
	return false;
};

/**
 * Checks Answer and updates display with correctness and feedback
 * Disables "Check Answer" button and enables "Try Again" button
 */
MC.prototype.checkAnswer = function() {
	//if (hasClass("checkAnswerButton", "disabledLink")) {
	if ($('#checkAnswerButton').parent().hasClass('ui-state-disabled')) {
		return;
	}

	//clear the previous result message
	$('#resultMessageDiv').html('');

	this.attempts.push(null);

	var radiobuttondiv = document.getElementById('radiobuttondiv');
	var inputbuttons = radiobuttondiv.getElementsByTagName('input');
	var mcState = {};
	var isCorrect = true;

	if(!this.enforceMaxChoices(inputbuttons)){
		return;
	}

	enableRadioButtons(false);        // disable radiobuttons
	//addClassToElement("checkAnswerButton", "disabledLink");
	$('#checkAnswerButton').parent().addClass('ui-state-disabled'); // disable checkAnswerButton
	//removeClassFromElement("tryAgainButton", "disabledLink");
	$('#tryAgainButton').parent().removeClass('ui-state-disabled'); // show try again button

	for (var i=0;i<inputbuttons.length;i++) {
		var checked = inputbuttons[i].checked;
		var choiceIdentifier = inputbuttons[i].getAttribute('id');  // identifier of the choice that was selected
		// use the identifier to get the correctness and feedback
		var choice = this.getChoiceByIdentifier(choiceIdentifier);

		if (checked) {
			if (choice) {
			    $('#feedback_' + choiceIdentifier).html(choice.feedback);

				var choiceTextDiv = document.getElementById("choicetext:" + choiceIdentifier);
				if (this.isCorrect(choice.identifier)) {
					choiceTextDiv.setAttribute("class", "correct");
				} else {
					choiceTextDiv.setAttribute("class", "incorrect");
					isCorrect = false;
				}

				mcState.identifier = choice.identifier;

				//add the human readable value of the choice chosen
				mcState.text = choice.text;
			} else {
				//this.node.view.notificationManager('error retrieving choice by choiceIdentifier', 3);
                alert('error retrieving choice by choiceIdentifier');
			}
		} else {
			if(this.isCorrect(choice.identifier)){
				isCorrect = false;
			}
		}
	}

	mcState.isCorrect = isCorrect;

    if(isCorrect){
		//the student answered correctly

		//get the congratulations message and display it
		$('#resultMessageDiv').html(this.getResultMessage(isCorrect));

	}

	//fire the event to push this state to the global view.states object
	//eventManager.fire('pushStudentWork', mcState);

	//push the state object into this mc object's own copy of states
	this.states.push(mcState);
    return false;
};

/**
 * Returns true iff this.maxChoices is less than two or
 * the number of checkboxes equals this.maxChoices. Returns
 * false otherwise.
 */
MC.prototype.enforceMaxChoices = function(inputs){
	var maxChoices = parseInt(this.properties.maxChoices);
	if(maxChoices>1){
		var countChecked = 0;
		for(var x=0;x<inputs.length;x++){
			if(inputs[x].checked){
				countChecked += 1;
			};
		};

		if(countChecked>maxChoices){
			//this.node.view.notificationManager.notify('You have selected too many. Please select only ' + maxChoices + ' choices.',3);
            var maxChoices = 3
            alert('You have selected too many. Please select only ' + maxChoices + ' choices.')
			return false;
		} else if(countChecked<maxChoices){
			//this.node.view.notificationManager.notify('You have not selected enough. Please select ' + maxChoices + ' choices.',3);
            var maxChoices = 3
            alert('You have not selected enough. Please select ' + maxChoices + ' choices.')
			return false;
		};
	};
	return true;
};

/**
 * Look up and return the score in the content that corresponds with the
 * given number of attempts. If one does not exist in the object, work
 * backwards until we find the latest. If no scores exist, return null.
 *
 * @param int - numOfAttempts
 * @return int - score
 */
MC.prototype.getScore = function(numAttempts){
	var score = 0;

	if(this.properties.attempts != null) {
		//get the scores object
		var scores = this.properties.attempts.scores;

		score = getCurrentScore(numAttempts, scores);
	}

	return score;
};

/**
 * Given whether this attempt is correct, adds any needed linkTo and
 * constraints and returns a message string.
 *
 * @param boolean - isCorrect
 * @param boolean - noFormat, return plain text
 * @return string - html response
 */
MC.prototype.getResultMessage = function(isCorrect){
	var message = '';

	/* we need to retrieve the attempt object corresponding to the current number of attempts */
	var attempt = this.properties.attempts;

	/* if this attempt is correct, then we only need to return a msg */
	if(isCorrect){
		message = "You have successfully completed this question!";
    }
	//} else {
		/* this is not correct, so we need to set up a linkTo and constraint
		 * and return a message with the linkTo if a step has been specified
		 * to navigate to otherwise, we need to return an empty string */
		//if(attempt.navigateTo && attempt.navigateTo != ''){
			//var msg = 'Please review ';
			//var position = this.node.view.getProject().getPositionById(attempt.navigateTo);

			//if(position != null) {
				//var stepNumberAndTitle = this.node.view.getProject().getStepNumberAndTitle(attempt.navigateTo);

				//// create the link to the revisit step
				//msg += "<a style='color:blue;text-decoration:underline;font-weight:bold;cursor:pointer' onclick='eventManager.fire(\"renderNode\", \"" + position + "\")'>Step " + stepNumberAndTitle + "</a> before trying again.";

				////create the message that will display in the alert
				//var optsMsg = 'You must visit "Step ' + stepNumberAndTitle + '" before trying this step again.';

                //alert(optsMsg);
				/* create the constraint to disable this step until students have gone to
				 * the step specified by this attempt */
				////this.node.view.eventManager.fire('addConstraint', {type:'VisitXBeforeYConstraint', x:{id:attempt.navigateTo, mode:'node'}, y:{id:this.node.id, mode:'node'}, status: 1, menuStatus:0, effective: Date.parse(new Date()), id:this.node.utils.generateKey(20), msg:optsMsg});

				//message = msg;
			//}
		//}
	//}

	return message;
};

/**
 * Returns a string of the given string with all spaces removed.
 */
MC.prototype.removeSpace = function(text){
	return text.replace(/ /g,'');
};

/**
 * Given an id from a choice in the html, returns the identifier as specified
 * in the content. We need to do this because when setting ids in the html, we
 * needed to remove spaces and authors that created their content NOT using the
 * authoring tool may have included spaces.
 *
 * @param string - id
 * @return string - id
 */
MC.prototype.resolveIdentifier = function(id){
	for(var a=0;a<this.choices.length;a++){
		if(this.removeSpace(this.choices[a].identifier)==id){
			return this.choices[a].identifier;
		}
	}
};

/**
 * Get the max possible score the student can receive for this step
 * @returns the max possible score
 */
MC.prototype.getMaxPossibleScore = function() {
	var maxScore = null;

	if(this.properties.attempts != null) {
		//get the scores object
		var scores = this.properties.attempts.scores;

		if(scores != null) {
			//get the max score
			maxScore = getMaxScore(scores);
		}
	}

	return maxScore;
};

/**
 * enable checkAnswerButton
 * OR
 * disable checkAnswerButton
 */
function enableCheckAnswerButton(doEnable) {
	if (doEnable == 'true') {
		//removeClassFromElement("checkAnswerButton", "disabledLink");
		$('#checkAnswerButton').parent().removeClass('ui-state-disabled'); // disable checkAnswerButton
	} else {
		//addClassToElement("checkAnswerButton", "disabledLink");
		$('#tryAgainButton').parent().addClass('ui-state-disabled'); // disable checkAnswerButton
	}
};


/**
 * Enables radiobuttons so that user can click on them
 */
function enableRadioButtons(doEnable) {
	var radiobuttons = document.getElementsByName('radiobutton');
	for (var i=0; i < radiobuttons.length; i++) {
		if (doEnable == 'true') {
			radiobuttons[i].removeAttribute('disabled');
		} else {
			radiobuttons[i].setAttribute('disabled', 'true');
		};
	};
};

/**
 * Clears HTML inside feedbackdiv
 */
function clearFeedbackDiv() {
	var feedbackdiv = document.getElementById('feedbackdiv');
	feedbackdiv.innerHTML = "";

	var feedbacks = document.getElementsByName('feedbacks');
	for(var z=0;z<feedbacks.length;z++){
		feedbacks[z].innerHTML = "";
	};
};

var pageTemplate = '<div id="centeredDiv"> <div id="questionCountBox" class="bg7"> <div id="previousWorkDiv"></div> <div id="questionTable"> <div id="questionType"> Multiple Choice </div> </div> </div> <!-- end of questionCountBox --> <div id="currentQuestionBox"> <div id="leftColumn" class="bg8"> <div id="questionLabelDiv" class="itemLabel color1"> question </div> <div id="promptDiv"> Prompt goes here. This text will automatically be replaced by actual prompt.  </div> <div id="answersLabelDiv" class="itemLabel color1"> answers </div> <div id="radiobuttondiv"> </div> <div id="feedbackdiv">&nbsp;</div> </div> <div id="rightColumn" class="bg2"> <img src="images/multi_choice.png" alt="Robot Art Open Response"  border="0" /> </div> <div id="clearBoth"> </div> <div id="statusMessages"> <div id="numberAttemptsDiv">&nbsp;</div> <div id="scoreDiv">&nbsp;</div> <div id="resultMessageDiv" style="font-size:16px">&nbsp;</div> </div> <!-- Anchor-Based Button Layout using TABLE --> <div id="buttonDiv"> <table id="buttonTable"> <tr> <td> <div class="buttonDiv ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"> <a class="firstButton" id="checkAnswerButton" href="#" onclick="mc.checkAnswer();">Check Answer</a> </div> </td> <td> <div class="buttonDiv ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"> <a id="tryAgainButton" class="disabledLink" href="#" onclick="mc.tryAgain();">Try Again</a> </div> </td> </tr> </table> </div> </div> </div> ';
