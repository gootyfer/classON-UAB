## Instructions to use this version of classON.

### Installation

1. Clone que repo
`git clone https://github.com/gootyfer/classON-UAB.git`

2. Install software dependencies
- Install a node.js version manager, [nvm](https://github.com/creationix/nvm#installation)
- Install node.js v6.0 (newer versions cannot run the app)
`nvm install 6.0`
- [Install mongodb](https://docs.mongodb.com/manual/installation/)

3. Install project dependencies
`npm install` (from the project folder)

4. Start the server with node.js v6.0
`nvm run 6.0 index.js`

To access to the teacher version of the app, go to the browser at
http://localhost:3000/teacher/index.html?teacher=isra&session=1
You must indicate as parameters of the url
- teacher: name of the teacher that is assigned to this course
- session: number of the session to manage


To access to an example of the student version go to
http://localhost:3000/student/p1/
You will be asked to log in with the student id (or ids if working in pairs) and the position in the classroom.

Before being able to log in, you must populate the database with users. For that, you may use the utility to import users from CSV at `users/saveUsersFromCSV`.
Usage: `node saveUsersFromCSV.js CSVfilename groupName`
- `CSVfilname` is the path to the CSV file with the users data
- `groupName` is the name give to these group of users (usually their class)


If you want to use classON with your own assignment, you can use the classON author tool but it's *still unfinished*:
http://localhost:3000/teacher/author/
