[![Build Status](https://travis-ci.org/aptrishu/serverchat.svg?branch=master)](https://travis-ci.org/aptrishu/serverchat)  
A cross browser chat app  

**Steps to run it locally -**    
1. Install NodeJS and npm  
2. Run 'npm install -d', It'll create the node_modules(dependencies required) folder from package.json  
3. Run program 'node app.js'  

__Heroku specific changes in the app(in app.js) -__  
You can force your app to run on a localhost port, just change  

    var port = process.env.PORT || 5000;  
    server.listen(port);  

to  

    server.listen(your_port);  

Finally instantiate socket with your localhost address(in index.html)   

    var socket = io.connect('http://localhost:your_port');  

Your app will also run fine without these changes.