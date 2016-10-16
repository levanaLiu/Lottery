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
  password:'19940914tztclx',
  database:'gift'
});

connection.connect();

app.post('/newlottery', function (request, response) {
	var json = {};
	connection.query('select * from lottery where lunit=? and lcreator=?',[request.body.lunit,request.body.lcreator],function(err3,result3){
		if(result3.length==0){
			connection.query('insert into lottery set ?',request.body,function(err,result){
				if(result.length===0){
					json.judge = false;json.msg="新建失败!";
					response.send(json);
				}
				else {
					
					json.judge = true; json.msg="新建成功!";
					response.send(json);
					connection.query('select * from company where cname = ?',request.body.lunit,function(err1,result1){
						if(result1.length===0){
							connection.query('insert into company set cname = ?',request.body.lunit,function(err2,result2){})
						}
						
					})
				}				
			})
		}
		else{
			json.judge = false;json.msg="该公司已经存在该活动!请重新输入。";
			response.send(json);
		}
		
	})
	  
});

app.post('/getlottery', function (request, response) {
	if(request.body.search_start_time!==undefined){
		searchlottery(request.body,response)
	}else{
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
	}
});



app.post('/showeditlottery', function (request, response) {
	var lid = request.body.lid;
	var json = {};
	connection.query('select * from lottery where lid = ?',[lid] ,function(err,result){
		json = result;
		response.send(json);
	}) 		
})

app.post('/editlottery', function (request, response) {
	var datas = request.body;
	var para = []; 
	var sql = "update lottery set";
	var judge;
	//console.log(po);
	for (var po in datas){
		if(po!=="lid"){
			sql+=" "+po+"=?,"
			para.push(datas[po]);
		}
	}
	sql = sql.substring(0,sql.length-1);
	sql+="where lid=?"
	para.push(datas.lid);
	connection.query('select * from lottery where lunit = ? and lcreator = ? and lid!=?',[para[3],para[2],para[6]],function(err1,result1){
		if(result1.length==0)
			connection.query(sql,para,function(err,result){
				response.send({msg:'修改成功',judge:true})
			})
		else
				response.send({msg:'修改失败,出现重名',judge:false})
		})	
})



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

function searchlottery(searchMsg,response){
	var rows = parseInt(searchMsg.rows);
	var page = parseInt(searchMsg.page);
	var sql1 = "select * from lottery where 1";
	var sql2 = "select count(*) from lottery where 1";
	var sql = "";
	if(searchMsg.search_start_time.length!=0){
		sql = sql + " and start_time>= '" + searchMsg.search_start_time + "'";
	}
	if(searchMsg.search_end_time.length!=0){
		sql = sql + " and end_time<= '" + searchMsg.search_end_time + "'";
	}
	if(searchMsg.search_lcreator.length!=0){
		sql = sql + " and lcreator like '%" + searchMsg.search_lcreator + "%'";
	}
	if(searchMsg.search_lunit.length!=0){
		sql = sql + " and lunit like '%" + searchMsg.search_lunit + "%'";
	}
	if(searchMsg.search_lstatus.length!=0){
		sql = sql + " and lstatus = '" + searchMsg.search_lstatus  + "'";
	}
	sql2 = sql2 + sql;
	sql = sql + " limit "+ (page-1)*rows+ "," + rows;
	sql1 = sql1 + sql;
	var json = {};
	connection.query(sql1,function(err,result){
		json.rows = result;
		connection.query(sql2,function(err,result){
		json.total = result[0]['count(*)'];
		response.send(json);
		}) 	
	})
}

app.post('/login', function (request, response) {
	var mname = request.body.mname;
	var mpw = request.body.mpw;
	connection.query('select mid from manager where mname=? and mpw=?',[mname,mpw] ,function(err,result){
		var json = {};
		if(result.length===0){
			json={msg:false};
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
	var lunit = request.body.lunit;
	connection.query('select ptel,sstatus,sremarks from lottery,person,statuslist where lcreator = ? and lunit = ? and person.pid = statuslist.pid and statuslist.lid = lottery.lid limit ?,?',[request.body.lcreator,request.body.lunit,(page-1)*rows,rows] ,function(err2,result2){
		json.rows = result2;
		connection.query('select count(*) from lottery,person,statuslist where lcreator = ? and lunit = ? and person.pid = statuslist.pid and statuslist.lid = lottery.lid',[request.body.lcreator,request.body.lunit],function(err,result){
		json.total = result[0]['count(*)'];
		response.send(json);
		}) 	
	}) 		
});



app.post('/usercheck', function (request, response) {
	var ptel = request.body.ptel;
	connection.query('select pid from person where ptel=?',[ptel] ,function(err4,result4){
		var json = {};
		if(result4.length>0){
			json={msg:true,pid:result4[0]['pid']};
		}
		else {
			json={msg:false};
		}
		response.send(json);
	}) 		
});

app.post('/userchecklist', function (request, response) {
	
	var pid = request.body.pid;
	
	var json = {};
	if(pid !== undefined ){
		connection.query('select * from person,lottery,statuslist where person.pid = statuslist.pid and lottery.lid = statuslist.lid and person.pid = ? order by lottery.lid desc',[pid] ,function(err,result){
			json = result;
			console.log(json);
			response.send(json);	
		}) 
	}
});

app.post('/getcurrentlottery', function (request, response) {
	var current = request.body.currenttime;
	var json = [];
	connection.query('select lunit,lcreator  from lottery where start_time<? and end_time>=? and lstatus!= ? order by lid desc',[current,current,'是'] ,function(err,result){
		for(var i=0;i<result.length;i++){
			var mytext = result[i].lunit + '-' + result[i].lcreator;
			json.push(mytext);
		}
		response.send(json);
	}) 		
});

app.post('/userjoin', function (request, response) {
	var json = {};
	var ptel = request.body.ptel;
	var lunit = request.body.lunit;
	var lcreator = request.body.lcreator;
	var pid;
	var lid;

	connection.query('select pid from person where ptel = ?',[ptel],function(err,result){
		if(result.length==0){
			connection.query('insert into person(ptel) values (?)',[ptel],function(err1,result1){});
			connection.query('select pid from person whereptel = ?',[ptel],function(err2,result2){
				pid = result2[0]['pid'];
			})
		}
		else{
			pid = result[0]['pid'];
		}
		connection.query("select lid from lottery where lunit = ? and lcreator = ?",[lunit,lcreator],function(err5,result5){
			lid = result5[0]["lid"];
			connection.query('select * from statuslist where pid = ? and lid =?',[pid,lid],function(err3,result3){
				if(result3.length!=0){
					json.judge = false;
					json.msg = "此号码已经参加过此活动！";
					response.send(json);
				}
				else{
					connection.query("insert into statuslist(lid,pid,sstatus) values(?,?,'否')",[lid,pid],function(err4,result4){});
					json.judge = true;
					json.msg = "成功参与！具体抽奖结果请在开奖后，到查看抽奖栏查看！";
					response.send(json);				
				}				
			})
		})	
	})	  
});

/////////////////////////////////////////////////////////
app.post('/get_phone',function(request,response){
	var lid = request.body.lid;
	var json={};
	json.tel=[];
	json.lcreator='';
	json.lunit='';	
	connection.query("select ptel from person,statuslist where person.pid = statuslist.pid and statuslist.lid =?",lid,function(err,result){
		for(var i=0;i<result.length;i++){
			json.tel[i] = result[i]["ptel"];
		}
		connection.query("select lcreator,lunit from lottery where lid = ?",lid,function(err1,result1){
			json.lcreator = result1[0]["lcreator"];
			json.lunit = result1[0]["lunit"];
			response.send(json);
		})
	})
});

app.post('/onwerinfo',function(request,response){
	var ptel=request.body;
	var data;
	connection.query('select pname,ptel from person where ptel=?',[ptel],function(err,result){
		data=result;	
		response.send(data);
	})
});

app.post('/getInfo',function(request,response){
	var lid=request.body.lid;
	connection.query('select lcreator,start_time from lottery where lid=?',[lid],function(err,result){
		var	data=result;	
		response.send(data);
	})
})

///////////////////////////////////////
app.post('/addowner',function(request,response){
	var tel=request.body.ptel;
	var lid=request.body.lid;
	var json={};
	//connection.query("update lottery set lstatus='是'where lid = ?",lid,function(err,result){})
	connection.query("select pid from person where ptel = ?",tel,function(err1,result1){
		connection.query("update statuslist set sstatus = '是' where pid = ?",result1[0]["pid"],function(err,result){
		json.tel = tel;
		response.send(json);
		});
	})
});

app.post('/check_lid',function(request,response){
	var lid = request.body.lid;
	var json={};
	connection.query('select lstatus,lnumber,lcreator from lottery where lid=?',lid ,function(err,result){
		var lstatus = result[0]["lstatus"];
		if(lstatus == "是"){
			json.judge = false;
			json.msg = "此活动已经完成抽奖，无法再次抽奖！";
			response.send(json);
		}
		else{
			//connection.query("update lottery set lstatus = '是' where lid =?",lid,function(err1,result1){
				json.judge = true;
				json.msg = "成功！";
				json.lnumber = result[0]["lnumber"];
				json.lcreator = result [0]["lcreator"];
				response.send(json);
			//})
			
		}
	})
	
});

console.log('启动成功');

app.listen(9999);
module.exports = app;
