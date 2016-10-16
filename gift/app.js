var app = require('express')();
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var mysql = require('mysql');
var num1,num2;

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

var connection = mysql.createConnection({
  host:'127.0.0.1',
  user : 'root',
  password:'root',
  database:'gift'
});

connection.connect();

app.post('/newlottery', function (request, response) {

  connection.query('insert into lottery set ?',request.body,function(err,result){
	  var json;
	  if(result.length===0){
		  json={msg:"新建失败!"};
	  }
	  else {
		  json={msg:"新建成功!"};
	  }
	  response.send(json);
	  
	
  })
  
   
});

app.post('/getlottery', function (request, response) {
	var rows = parseInt(request.body.rows);
	var page = parseInt(request.body.page);
	var json = {};
	connection.query('select * from lottery limit ?,?',[(page-1)*rows,rows] ,function(err,result){
		json.rows = result;
		connection.query('select count(*) from lottery' ,function(err,result){
		json.total = result[0]['count(*)'];
		response.send(json);
		}) 	
	}) 		
});

app.post('/deletelottery', function (request, response) {
	var lid = request.body.lid;
	connection.query('delete from lottery where lid = ?',[lid] ,function(err,result){
		var json;
		if(result.length===0){
			json={msg:"删除失败!"};
		}
		else {
			json={msg:"删除成功!"};
		}
		response.send(json);
	}) 		
});

app.post('/login', function (request, response) {
	var mname = request.body.mname;
	var mpw = request.body.mpw;
	connection.query('select mid from manager where mname=? and mpw=?',[mname,mpw] ,function(err,result){
		var json = {};
		if(result.length===0){
			json={msg:false,mid:result[0]['mid']};
		}
		else {
			json={msg:true,mid:result[0]['mid']};
		}
		response.send(json);
	}) 		
});

app.post('/editmanager', function (request, response) {
	connection.query('update manager set mname=?,mpw=?,mtel=?,mremarks=? where mid=? ',[request.body.mname,request.body.mpw,request.body.mtel,request.body.tremarks,request.body.mid] ,function(err,result){
		var json;
		if(result.length===0){
			json={msg:"修改失败!"};
		}
		else {
			json={msg:"修改成功!"};
		}
		response.send(json);
	}) 		
});

app.post('/getchecklottery', function (request, response) {
	var rows = parseInt(request.body.rows);
	var page = parseInt(request.body.page);
	var json = {};
	connection.query('select * from manager limit ?,?',[(page-1)*rows,rows] ,function(err,result){
		json.rows = result;
		connection.query('select count(*) from manager' ,function(err,result){
		json.total = result[0]['count(*)'];
		response.send(json);
		}) 	
	}) 		
});

app.post('/getchecktree', function (request, response) {
	var json = [];
	var json1 = [];
	if(request.body.id===undefined){
		connection.query('select * from company',function(err,result){
				for(var i= 0 ;i<result.length;i++ ){
					var data = {id:result[i].cid,text:result[i].cname};
					data.state = "closed";
					json1.push(data);
				}	
				response.send(json1); 
			}) 	
	}else{						
		connection.query('select * from lottery where lunit = ?',request.body.text,function(err1,result1){
			for(var i= 0;i<result1.length;i++ ){
				var data = {id:result1[i].lid,text:result1[i].lcreator};
				//data.state = "closed";
				json.push(data);
			}
		response.send(json); 						
	})
	}			
});
app.post('/getperson', function (request, response) {
	var rows = parseInt(request.body.rows);
	var page = parseInt(request.body.page);
	var json = {};
	var lcreator = request.body.lcreator;
	var lunit = request.body.text;
	connection.query('select pname,ptel,sstatus,sremarks from lottery,person,statuslist where lcreator = ? and lunit = ? and person.pid = statuslist.pid and statuslist.lid = lottery.lid limit ?,?',[request.body.lcreator,request.body.lunit,(page-1)*rows,rows] ,function(err2,result2){
		json.rows = result2;
		connection.query('select count(*) from lottery,person,statuslist where lcreator = ? and lunit = ? and person.pid = statuslist.pid and statuslist.lid = lottery.lid',[request.body.lcreator,request.body.lunit],function(err,result){
		json.total = result[0]['count(*)'];
		console.log(json.rows);
		response.send(json);
		}) 	
	}) 		
});

app.post('/userLogin', function (request, response) {
	var pname = request.body.pname;
	var ppw = request.body.ppw;
	console.log(request.body);
	connection.query('select pid from person where pname=? and ppw=?',[pname,ppw] ,function(err4,result4){
		var json = {};
		console.log(result4);
		if(result4.length>0){
			json={msg:true,pid:result4[0]['pid']};
		}
		else {
			json={msg:false};
		}
		response.send(json);
	}) 		
});

console.log('启动成功');

app.listen(9999);
module.exports = app;
