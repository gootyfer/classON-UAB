//Load session id
var scripts = document.getElementsByTagName('script');
var index = scripts.length - 1;
var myScript = scripts[index];
var src = myScript.src;
var session = src.substr(src.indexOf('=')+1);

//Load sections
var sections = document.getElementsByTagName("section");

//Create navigation menu
var menu = document.createElement("div");
menu.id = "menu";
var questions_div = document.createElement("div");
questions_div.id = "questions";
questions_div.className = "hide";
var bg = document.createElement("div");
bg.id = "bg";
var content = document.createElement("div");
content.id = "content";

var header = document.getElementsByTagName("header")[0];

sections[0].parentNode.insertBefore(menu, header);
sections[0].parentNode.insertBefore(questions_div, header);
sections[0].parentNode.insertBefore(bg, header);
sections[0].parentNode.insertBefore(content, header);

content.appendChild(header);

var menuItems = []; //menu items array
for(var i=0; i<sections.length; i++){
	if(sections[i].id != "refs" && sections[i].id != "bash"){ 
		var itemName = sections[i].getElementsByTagName("h2")[0].childNodes[0].nodeValue; //collect section names
		//Create menu item
		var menuitem = document.createElement("div");
		menuitem.innerHTML = "<a class='menuitem' href='#"+sections[i].id+"'>"+itemName+"</a> ";
		menuitem.className = "menuitem";
		menu.appendChild(menuitem);
		//Create led indicator
		var progress = document.createElement("div");
		//progress.innerHTML = "<img src='images/white-off-16.png' />";
		progress.className = "progressIcon off";
		menu.appendChild(progress);
		menuItems.push(menuitem);
		sections[i].classList.add("hide");
	}
	content.appendChild(sections[i]); //append sections to the new content div
}

var footer = document.getElementsByTagName("footer")[0];
content.appendChild(footer);

var progressdiv = document.createElement("div");
progressdiv.className = "progressdiv";
var progressbar = document.createElement("meter");
progressbar.max = 100;
progressbar.min = 0;
progressbar.low = 20;
progressbar.high = 80;
progressbar.optimum = 100;
progressbar.value = 0;
progressbar.innerHTML = "Progression";
progressdiv.appendChild(progressbar);

menu.appendChild(progressdiv);

//Step in the progressbar
var step = Math.ceil(100 / menuItems.length);
var currentSection = 0;

//Init first section
indicateProgress();

//Help button
var helpButton = document.createElement("div");
helpButton.addEventListener("click", askForHelp);
helpButton.innerHTML = "HELP!";
helpButton.className = "button red";
menu.appendChild(helpButton);
//Waiting for help?
var helpNeeded = false;

//Load info from localstorage; otherwise, from the server
var user = window.localStorage.getItem("user");
var position = window.localStorage.getItem("position");

if(!user){
	user = [];
	requestUser();
}else{
	user = user.split(",");
	checkUsers(function(error){
		if(error){
			requestUser("The user id is NOT correct. Please, check it and click OK.");
		}else{
			usersOK();
		}
	});
}

var usersInfo = [];
var info = document.createElement("div");
info.className = "info";
menu.appendChild(info);

function usersOK(){
	window.localStorage.setItem("user", user);
	window.localStorage.setItem("position", position);
	//User info
	info.innerHTML = (usersInfo[0]?usersInfo[0].name:"")+"<br />"+
	(usersInfo[1]?usersInfo[1].name:"")+"<br />"+
	"<input type='button' onclick='logout()' value='LOG OUT' style='margin: auto;' />"+
	"<input type='button' onclick='show_questions()' value='QUESTIONS' style='margin: auto;' />";
	
	$.unblockUI();
}

//questions[i].description
//questions[i].votes = ["id1", "id2"]
var questions = [];

function show_questions(){
	var sHTML = "<h4>Questions</h4><ul>";
	for(var i=0; i<questions.length;i++){
		var voted = questions[i].votes.indexOf(user[0])!=-1;
		sHTML+="<li>"+questions[i].description+" (<span>"+questions[i].votes.length+
			" votes</span>) <input type='button' value='+1' onclick='vote("+i+")' "+
			(voted?"disabled='disabled'":"")+" /></li>";
	}
	sHTML += "</ul><br><input type='button' value='BACK' onclick='back()' />";
	questions_div.innerHTML = sHTML;
	questions_div.className="";
}

function back(){
	questions_div.className="hide";
}

function logout(){
	window.localStorage.removeItem("user");
	window.localStorage.removeItem("position");
	window.location.reload();
}

function requestUser(error){
	window.localStorage.removeItem("user");
	window.localStorage.removeItem("position");
	$.blockUI({
		theme:     true, 
        title:    'Participant', 
		message: "<div>Please, introduce your user id to access to the assignment. Thank you.<br /><br />" +
		"User 1: <input type='text' id='p1' value='"+(user[0]?user[0]:"")+"' /><br />" +
		"User 2: <input type='text' id='p2' value='"+(user[1]?user[1]:"")+"' /><br />" +
		"Position: <input type='text' id='place' value='' /><br />" +
		"<div><input type='button' onclick='saveUsers()' value='OK' style='float: right;' /></div>" +
		"<div id='error' class='error'>"+(error?error:"")+"</div></div>"});
	user = [];
}

function saveUsers(){
	var user1 = document.getElementById("p1").value;
	if(user1) user.push(user1);
	var user2 = document.getElementById("p2").value;
	if(user2) user.push(user2);
	
	position = document.getElementById("place").value;
	
	checkUsers(function(error){
		if(error){
			$.unblockUI();
			requestUser("The user id is not correct. Please, correct it and click OK.");
		}else{
			usersOK();
		}
	}, true);
}


function indicateProgress(back){
	if(back){
		
		if(currentSection==(menuItems.length-1)){
			progressdiv.removeChild(progressdiv.lastElementChild);
		}else{
			sections[currentSection+1].classList.add("hide");
			var nextIcon = menuItems[currentSection+1].nextElementSibling;
			nextIcon.removeEventListener("click", finishSection);
			nextIcon.className = "progressIcon off";
		}
		
		var currentIcon = menuItems[currentSection].nextElementSibling;
		currentIcon.removeEventListener("click", undoFinishSection);
		currentIcon.addEventListener("click", finishSection);
		currentIcon.className = "progressIcon progress active";
		
		if(currentSection>0){
			var formerIcon = menuItems[currentSection-1].nextElementSibling;
			formerIcon.addEventListener("click", undoFinishSection);
			formerIcon.className = "progressIcon finished active";
		}
		
	}else{
		if(sections[currentSection]){
			sections[currentSection].classList.remove("hide");
		}
		
		if(currentSection>1){ //Remove listener in former former icon
			var formerformerIcon = menuItems[currentSection-2].nextElementSibling;
			formerformerIcon.removeEventListener("click", undoFinishSection);
			formerformerIcon.className = "progressIcon finished";
		}
		
		if(currentSection>0 && menuItems[currentSection-1]){
			var formerIcon = menuItems[currentSection-1].nextElementSibling;
			formerIcon.addEventListener("click", undoFinishSection);
			formerIcon.removeEventListener("click", finishSection);
			formerIcon.className = "progressIcon finished active";
		}
		
		if(currentSection==menuItems.length){ //Last icon
			var completedDiv = document.createElement("div");
			completedDiv.className = "completed";
			completedDiv.innerHTML = "&iexcl;COMPLETED!";
			progressdiv.appendChild(completedDiv);
		}else{
			if(currentSection>0 && sections[currentSection].id){
				$('html, body').animate({
			         scrollTop: $("#"+sections[currentSection].id).offset().top
			     }, 2000);
			}
			var currentIcon = menuItems[currentSection].nextElementSibling;
			currentIcon.addEventListener("click", finishSection);
			currentIcon.className = "progressIcon progress active";
		}
	}
}

function askForHelp(){
	$.blockUI({
		theme:     true, 
        title:    (helpNeeded)?'Soluci&oacute;n':'Duda', 
		message: "<div>Please, describe briefly "+(helpNeeded?'the answer to your question':'your question')+".<br /><br />" +
		"<textarea id='duda' style='width:100%;height:100px'></textarea><br /><br />" +
		"<div><input type='button' onclick='$.unblockUI();' value='Cancel' style='float:left;' />" +
		"<input type='button' onclick='askForHelp2()' value='OK' style='float: right;' /></div></div>"});
}


function askForHelp2(){
	var eventType = "help";
	if(helpNeeded){
		helpButton.innerHTML = "HELP!";
		helpButton.className = "button red";
		eventType = "solved";
		/*
		if(helpNeeded === 1){
			helpNeeded = true;
			eventType = "connection";
		}
		*/
	}else{
		helpButton.innerHTML = "SOLVED?";
		helpButton.className = "button blue";
	}
	
	//Send event to the server
	
	var event = {
			eventType: eventType,
	};
	var duda = document.getElementById("duda");
	if(duda){
		event.description = duda.value;
	}
	sendEventToServer('new event', event);
	
	helpNeeded = !helpNeeded;
	$.unblockUI();
}

function finishSection(){
	$.blockUI({
		theme:     true, 
        title:    "Section finished", 
		message: "<div>Are you sure you finished this section?<br /><br />" +
		"<div><input type='button' onclick='$.unblockUI();' value='Cancel' style='margin-left: 0px;' />" +
		"<input type='button' onclick='finishSection2();' value='OK' style='float:right;' /></div></div>"});
}

function finishSection2(){
	//Send event to the server
	sendEventToServer('new event', {eventType: 'finishSection'});
	finishSection3();
	$.unblockUI();
}
function finishSection3(){
	progressbar.value += step;
	currentSection++;
	indicateProgress();
}

function undoFinishSection(){
	$.blockUI({
		theme:     true, 
        title:    "Undo progress", 
		message: "<div>Are you sure you want to go back to the revious section?<br /><br />" +
		"<div><input type='button' onclick='$.unblockUI();' value='Cancel' style='margin-left: 0px;' />" +
		"<input type='button' onclick='undoFinishSection2();' value='OK' style='float:right;' /></div></div>"});
}

function undoFinishSection2(){
	//Send event to the server
	sendEventToServer('new event', {eventType: 'undoFinishSection'});
	
	progressbar.value -= step;
	currentSection--;
	indicateProgress(-1);
	$.unblockUI();
}

function setExercise(savedSection){
	for (var i=0; i<savedSection; i++){
		finishSection3();
	}
}

function vote(qid){
	sendEventToServer('new event', {eventType: 'vote', qid: qid});
	if(questions[qid]){
		questions[qid].votes.push(user[0]);
	}
	show_questions();
}

var socket;
function checkUsers(callback, force){
	if(!socket){
		var server = document.location.href.hostname;
		//var server = document.location.href.substr(0,document.location.href.lastIndexOf(':'));
		server = "163.117.141.206";
		server = window.location.hostname;
		//server = "127.0.0.1";
		socket = io.connect(server);
		socket.on('connect', function() {
			sendEventToServer('new student', {session: session, force: (force==true)});
			//console.log('new student when connecting');
			//socket.emit('new student', {user: user, session: session});
			//Should ba called: init
			socket.on('student registered', function(regInfo){
				//console.log("student registered:"+JSON.stringify(regInfo));
				if(!regInfo.error){
					usersInfo = regInfo.userInfoArray;
					if(regInfo.exercise){
						setExercise(regInfo.exercise);
						//console.log("exercise:"+state.exercise);
					}
					if(regInfo.help){
						helpNeeded = true;
						helpButton.innerHTML = "SOLVED?<br />(Queue position: "+regInfo.help+")";
						helpButton.className = "button blue";
					}
					if(regInfo.questions){
						questions = regInfo.questions;
					}
					//Connection to the practice event
					sendEventToServer('new event', {eventType: "connection"});
					//console.log('send connection event to server');
				}
				callback(regInfo.error);
			});
			
			socket.on('update queue', function(position){
				console.log("new position in queue:"+position);
				helpButton.innerHTML = "SOLVED?<br />(Queue position: "+position+")";
				if(position==0){
					askForHelp();
				}
			});
			socket.on('update questions', function(new_questions){
				console.log("new questions:"+new_questions);
				questions = new_questions;
			});
		});
	}else{
		//socket.emit('new student', {user: user, session: session});
		sendEventToServer('new student', {session: session, force: (force==true)});
		
	}
}

function sendEventToServer(eventName, event){
	event.user = user;
	if(eventName!="new student"){
		event.eventSection = currentSection;
		event.session = usersInfo[0].group + session;
	}
	
	event.IP = position;
	//example: 
	socket.emit(eventName, event);
	console.log('new event sent:'+eventName);
}

