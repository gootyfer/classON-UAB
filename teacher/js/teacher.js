//Id of the group of students
var group = "uab";

//TODO: create this variable from config file
var pcs = [];

//Define ids for the users in the space
for(var i=-5; i<25; i++){
	pcs.push({IP:String(i+1)});
}

//Collect params from  URL
var queryString = document.location.href.substr(document.location.href.lastIndexOf('?')+1);
var parameters = queryString.split("&");
var teacher = parameters[0].split("=")[1];
var session = parameters[1].split("=")[1];

//List of students info
var students = [];

//Icons representing the UI of students data
var icons = document.getElementsByClassName("comp_icon");
for (var i=0; i<icons.length;i++){
	icons[i].addEventListener("click", function(id){ 
		return function(){ showUsers(id);};
		}(i));
}

/*
 * Timer in the detail page
 */
var timer;
var timerTimeout;
var startTime;

function startTimer(){
	startTime = (new Date()).getTime();
	timerTimeout = setInterval(updateTimer, 1000);
}

function updateTimer(){
	var timeDiff = new Date();
	var diff = timeDiff.getTime() - startTime;
	timeDiff.setTime(diff);
	var minutes = timeDiff.getMinutes();
	var seconds = timeDiff.getSeconds();
	timer.innerHTML = (minutes<9?"0"+minutes:minutes) + ":" + (seconds<9?"0"+seconds:seconds);
}

function stopTimer(){
	if(timerTimeout){
		clearInterval(timerTimeout);
	}
}

/*
 * Show the detailed info of a user
 */
function showUsers(id){
	var main = document.getElementById("main");
	main.classList.add("hide");
	var users = document.getElementById("users");
	users.classList.remove("hide");
	users.innerHTML="";
	var actualUsers = pcs[id].users;
	
	if(actualUsers){
		//console.log("showUsers (actualUsers): "+pcs[id].users.join(","));
		for(var i=0; i<actualUsers.length; i++){
			var figure = document.createElement("div");
			users.appendChild(figure);
			var img = document.createElement("img");
			var figurecaption = document.createElement("div");
			var student;
			for(var j=0; j<students.length;j++){
				if(actualUsers[i] == students[j].username){
					student = students[j];
					break;
				}
			}
			if(student != undefined){
				//console.log("showUsers (img): /users/photos/"+student.img);
				img.src = "/users/photos/"+student.img;
				figurecaption.innerHTML = student.name;
			} else {
				img.src = "/users/photos/f1.png";
				figurecaption.innerHTML = "NOT FOUND";
			}
			figure.className = "figure";
			figure.appendChild(img);
			figure.appendChild(figurecaption);
		}
		//console.log("showUsers (description):"+pcs[id].description);
		if(pcs[id].description){
			var desc = document.createElement("div");
			desc.className = "desc";
			desc.innerHTML = "Duda: "+pcs[id].description;
			users.appendChild(desc);
		}
	}
	
	//Timer
	timer = document.createElement("div");
	timer.innerHTML = "00:00";
	timer.className = "timer";
	users.appendChild(timer);
	
	//initHelp button
	var button = document.createElement("div");
	button.addEventListener("click", onInitHelp = function(){ initHelp(id, button);});
	users.appendChild(button);
	button.innerHTML = "INIT HELP";
	button.className = "button green help";
	
	//Back button
	var back_button = document.createElement("div");
	back_button.addEventListener("click", function(){ goBack(id, button);});
	users.appendChild(back_button);
	back_button.innerHTML = "VOLVER";
	back_button.className = "button gray back";
	
}

var questions = [];
document.getElementById("questions").addEventListener("click",showQuestions);

/*
 * Show the list of questions
 */
function showQuestions(){
	var main = document.getElementById("main");
	main.classList.add("hide");
	var users = document.getElementById("users");
	users.classList.remove("hide");
	users.innerHTML="";

	var sHTML = "<h4>Questions</h4><ul>";
	for(var i=0; i<questions.length;i++){
		sHTML+="<li>"+questions[i].description+" (<span>"+questions[i].votes.length+
			" votos</span>)</li>";
	}
	sHTML += "</ul><br><input type='button' class='button gray back' value='VOLVER' "+
	"onclick='goBack()' />";
	users.innerHTML = sHTML;
}

//Indicates if the teacher is helping a student
var helpingStudent =  false;

//Back to the main menu
function goBack(id, button){
	if(id && helpingStudent){
		endHelp(id, button);
	}
	var users = document.getElementById("users");
	users.classList.add("hide");
	users.innerHTML = "";
	var main = document.getElementById("main");
	main.classList.remove("hide");	
}

//Init giving help to a student
function initHelp(id, button){
	//Update UI of the detail page
	button.removeEventListener("click", onInitHelp);
	button.addEventListener("click", onEndHelp = function(){ endHelp(id, button);});
	button.innerHTML = "END HELP";
	button.className = "button red help";
	
	//Send event
	socket.emit('teacher event', {
		session: group+session, 
		eventType: "initHelp", 
		eventSection: pcs[id].currentExercise,
		user: pcs[id].users,
		IP: pcs[id].IP
		});
	//Teacher is helping the students on screen
	helpingStudent =  true;
	
	//Start timer
	startTimer();
}

//Finish helping a student
function endHelp(id, button){
	//Redraw UI
	problemSolved(id);
	//Stop timer
	stopTimer();
	//Change button display
	button.removeEventListener("click", onEndHelp);
	button.addEventListener("click", onInitHelp = function(){ initHelp(id, button);});
	button.innerHTML = "INIT HELP";
	button.className = "button green help";
	//No more helping
	helpingStudent =  false;
	//Send event
	socket.emit('teacher event', {
		session: group+session, 
		eventType: "endHelp", 
		eventSection: pcs[id].currentExercise,
		user: pcs[id].users,
		IP: pcs[id].IP
		});
}

//Groups that asked for help
var pcs_needHelp = []; //Queue of computers that need help
var help_needed =  false; //Teacher has work to do

//Websockets
var server = document.location.href.substr(0,document.location.href.lastIndexOf(':'));
//server = "163.117.141.206";
//local server
server = "127.0.0.1";
var socket = io.connect(server+':80');

//Connect to the server
socket.on('connect', function() {
	//Update UI
	var button = document.getElementsByClassName("button")[0];
	button.classList.add("green");
	button.classList.remove("red");
	button.innerHTML = "Conectado";
	//Send event
	socket.emit("new teacher", {session: group+session, teacher_id: teacher});
	//Request students info
	socket.emit("userList", {group: group});
});

//Init data from server
socket.on("init", function(my_session){
	console.log("init received. session received:");
	console.log(my_session.session);
	console.log("queue received:"+my_session.queue);

	var state = my_session.session;
	var order = my_session.queue;
	questions = my_session.questions;
	//Update users data
	for(var i=0; i<pcs.length;i++){
		var icon = document.getElementsByClassName("comp_icon")[i].firstElementChild;
		for(var j=0; j<state.length; j++){
			if(pcs[i].IP == state[j].IP){
				//Update data in structure
				pcs[i].users = state[j].username;
				pcs[i].currentExercise = state[j].exercise+1;
				//No need of the help field, but description
				pcs[i].description = state[j].description;
				//Update data in UI
				icon.innerHTML = pcs[i].currentExercise;
				icon.classList.add("working");
			}
		}
	}
	//Update queue data
	for(var j=0; j<order.length; j++){
		for(var i=0; i<pcs.length;i++){
			var icon = document.getElementsByClassName("comp_icon")[i].firstElementChild;
			if(pcs[i].IP == order[j]){
				pcs[i].help = true;
				icon.classList.remove("working");
				icon.classList.add("waiting_start");
				if(!help_needed){//Nobody needs help: FIFO
					help_needed = true;
					icons[i].classList.add("next_icon");
					var button = document.getElementsByClassName("button")[1];
					button.classList.add("red");
					button.classList.remove("green");
					button.innerHTML = "BUSY";
				}else{
					pcs_needHelp.push(i);
				}
			}
		}
	}
	console.log("queue in teacher browser:"+pcs_needHelp);
});

//Init user list data
socket.on('userListResp', function(data){
	students = data;
});

/*
 * Updates data & UI when a problem is solved
 */
function problemSolved(solvedIndex){
	if(pcs[solvedIndex].help){
		//Update structure data
		pcs[solvedIndex].help = false;
		//Update UI
		var icon = document.getElementsByClassName("comp_icon")[solvedIndex].firstElementChild;
		icon.classList.remove("waiting_start");
		icon.classList.add("working");

		//Update queue
		var index = pcs_needHelp.indexOf(solvedIndex);
		if(index!=-1){ //queued, 
			//remove from queue
			pcs_needHelp.splice(index,1);
			if(index==0){
				//update UI
				if(icons[solvedIndex].classList.contains("next_icon")){
					//This group was in the first position of the queue
					icons[solvedIndex].classList.remove("next_icon");
				}
				if(pcs_needHelp.length>0){
					//Get next from queue and update next icon
					icons[pcs_needHelp[0]].classList.add("next_icon");
				}else{
					//The teacher is free of work
					help_needed = false;
					//Update UI
					var button = document.getElementsByClassName("button")[1];
					button.classList.add("green");
					button.classList.remove("red");
					button.innerHTML = "FREE";
				}
			}
		}
	}	
}

/*
 * Change the background color of the UI, indicating longer waiting time 
 */
/*
function changeColor(index){
	var icon = document.getElementsByClassName("comp_icon")[index].firstElementChild;
	var color = pcs[index].color;
	if (color==0){
		icon.style.backgroundColor = "";
		//clearInterval(pcs[index].interval);
	}else{
		color--;
		icon.style.backgroundColor = "#f5"+color.toString(16)+"00";
		pcs[index].color = color;
	}
}
*/

//Received event from a student
socket.on('event', function (data) {
	//alert(data.IP);
	console.log("event (data.IP): "+data.IP+" event:"+data.eventType+" user:"+data.user);

	for(var i=0; i<pcs.length;i++){
		if(data.IP == pcs[i].IP){
			var icon = document.getElementsByClassName("comp_icon")[i].firstElementChild;
			//console.log("event: IP found!");
			switch(data.eventType){
			//A student connected to the system
			case "connection":
				if(pcs[i].users==undefined){
					//Update data
					pcs[i].users = data.user;
					pcs[i].currentExercise = 1;
					pcs[i].help =  false;
					//Update UI
					icon.innerHTML = pcs[i].currentExercise;
					icon.classList.add("working");
				}
				break;
			//A student finished a section
			case "finishSection":
				//Update data
				pcs[i].currentExercise +=1;
				//Update UI
				icon.innerHTML = pcs[i].currentExercise;
				break;
			//A student undid finish a section
			case "undoFinishSection":
				//Update data
				pcs[i].currentExercise -=1;
				//Update UI
				icon.innerHTML = pcs[i].currentExercise;
				break;
			//A student asked for help
			case "help":
				//Update data
				pcs[i].help = true;
				pcs[i].description = data.description;
				console.log("help (description) :"+data.description);
				//Update UI
				icon.classList.remove("working");
				icon.classList.add("waiting_start");

				//pcs[i].color = 0x90;
				//pcs[i].interval = setInterval("changeColor("+i+")", 10000);
				//Manage queue: FIFO
				if(!help_needed){//Nobody needs help
					help_needed = true;
					//Update UI
					icons[i].classList.add("next_icon");
					//Update FREE/BUSY button
					var button = document.getElementsByClassName("button")[1];
					button.classList.add("red");
					button.classList.remove("green");
					button.innerHTML = "BUSY";
				}
				//Queue request
				pcs_needHelp.push(i);
				
				break;
			case "solved":
				problemSolved(i);
				break;
			case "initHelp":
				console.log("initHelp received!");
				problemSolved(i);
				break;
			}
			console.log("event received. info:");
			console.log(pcs[i]);
			console.log("queue:"+pcs_needHelp);
			break;
		}
	}
  //console.log(data);
});

//Update questions from server
socket.on('update questions', function(new_questions){
	console.log("new questions:"+new_questions);
	questions = new_questions;
});
