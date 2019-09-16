/* Database. Only basic operations without wrapped log utility
 *
 * Roadmap:
 * 1. add/update multiple rows
 * 2. add/update provide lastID to callback
 *
 * select(tbl,[targets],'condition',callback(err,row))
 * add(tbl,{entries},callback(err))
 * update(tbl,{target},'condition'/{condition},callback(err))
 */
const path=require('path')
const sqlite3=require('sqlite3').verbose()
const db_param=require(path.resolve(__dirname,"db.js"))
const fs=require('fs')

const config=path.resolve(global.basedir,'config.json')

function exit(message){
  console.log(message)
  process.exit(1)
}
async function getConfig(callback){
  fs.readFile(config,(err,data)=>{
    if(err)
      exit('Failed to read configuration file '+config)
    try{
      const dbparam=JSON.parse(data)
      if(!(dbparam.dbpath&&dbparam.dbname&&dbparam.head))
        throw 'config file does not have enough database info'
      callback(dbparam)
    }catch(e){
      if(e.message)
        exit(e.message)
      exit('Failed to read database config from file '+config)
    }
  })
}
async function connect(callback){
  getConfig((dbparam)=>{
    var db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
      if(err)
        exit('Failed to connect to SQL database.')
      callback(db)
    })
  })
}
async function getTableName(alias,callback){
  connect((db)=>{
    getConfig((dbparam)=>{
      db.serialize(()=>{
        db.all('SELECT name,alias FROM '+dbparam.head+' WHERE name=\''+alias+'\' OR alias=\''+alias+'\'',(err,rows)=>{
          if(rows.length<1)
            exit('Failed to find table with alias '+alias)
          var result=''
          for(let row of rows){
            if(row.name==alias){
              result=row.name
              break
            }else if(row.alias==alias){
              result=row.name
            }
          }
          if(result)
            callback(result)
          else
            exit('Failed to find the name of Table with alias/name '+alias)
        })
          .close()
      })
    })
  })
}
function serializeQuery(row){
  var keys=Object.keys(row)
  var vals=Object.values(row)
  var keystr='('
  var valstr='('
  var valobj={}
  keys.forEach((key)=>{
    keystr+=key
    keystr+=','
    valstr+='$'+key
    varstr+=','
    valobj['$'+key]=row[key]
  })
  keystr=keystr.slice(0,-1)+')'
  valstr=valstr.slice(0,-1)+')'
  return [keystr,valstr,valobj]
}
async function insert(tbl,info,callback){
  getTableName(tbl,(tblname)=>{
    connect((db)=>{
      async function insertRow(row,callback){
        db.serialize(()=>{
          var [keystr,valstr,valobj]=serializeQuery(row)
          db.run('INSERT INTO '+tblname+' '+keystr+' VALUES '+valstr,valobj,(err)=>{
            if(err)
              exit('Failed to insert into '+tblname+' '+JSON.stringify(row))
            callback(this.lastID)
          })
            .close()
        })
      }
      if(Array.isArray(info)){
        var lastIDs=[]
        for(const row of info){
          await insertRow(row,(lastID)=>{lastIDs.push(lastID)})
        }
        callback(lastIDs)
      }else{
        insertRow(info,(lastID)=>{callback(lastID)})
      }
    })
  })
}
async function update(tbl,entries,cond,callback){
  getTableName(tbl,(tblname)=>{
    connect((db)=>{
      db.serialize(()=>{
        var [keystr,valstr,valobj]=serializeQuery(entries)
        var keys=keystr.split(',')
        var str=''
        for(const key of keys){
          str+=key+'=$'+key+','
        }
        str.slice(0,-1)
        db.run('UPDATE '+tblname+' SET '+str+' WHERE '+cond,valobj,(err)=>{
          if(err)
            exit('Failed to update '+tblname+' '+JSON.stringify(entries))
          callback(this.lastID)
        })
          .close()
      })
    })
  })
}
async function select(tbl,target,cond,callback,finish){
  getTableName(tbl,(tblname)=>{
    connect((db)=>{
      db.serialize(()=>{
        var keystr=''
        target.forEach((key)=>{
          keystr+=key+','
        })
        keystr.slice(0,-1)
        db.each('SELECT '+keystr+' FROM '+tblname+' WHERE '+cond,(err,row)=>{
          if(err)
            exit('Failed to select '+keystr+' from '+tblname)
          callback(row)
        },(err,num)=>{
          if(err)
            exit('Selection completed but error occurred when selecting '+keystr+' from '+tblname)
          finish(num)
        })
      })
    })
  })
}

function validateSid(sid){
  let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
    if(err){
      return err
    }
  })
  db.serialize(function(){
    db.each('SELECT uid,creation_date,expired_in FROM '+db_param.tbl.session.name+' WHERE rowid='+sid,(err,row)=>{
      if(err)
        return err
      var cd=row.creation_date
      const ex=row.expired_in
      cd.setTime(cd.getTime()+ex)
      let flag=false
      if(cd.getTime()<new Date().getTime())
        flag=false
      else
        flag=true
      if(flag)
        return row.uid
      else
        return flag
    })
  })
}

/* initiation
 *
 * Check error file
 *   if not accessible, print error and terminate
 * Check database configuration file
 *   if not present, try create default
 *     if creation failed, throw error
 * Check db tables
 *   if not present, try create empty ones
 *   if present with wrong columns, throw error
 */
function init(){
  var info={}
  info.basedir=true
  info.errfile=true       // info.errfile: error file accessibility
  info.dbconfig=true      // info.dbconfig: dbconfig file accessibility and validity
  info.db=true            // info.db: db connectivity and table validity
  global.basedir=findBaseDir()
  // Check base directory(where the main process is located)
  if(!basedir)
    exit('Root directory could not be found')
  // Check log dir
  try{
    fs.accessSync(logdir,fs.constants.F_OK|fs.constants.W_OK)
  }catch(e){
    error('Log directory '+logdir+' is not accessible')
  }
  // Check error log file
  try{
    fs.accessSync(errdir,fs.constants.F_OK|fs.constants.W_OK)
  }catch(e){
    try{
      fs.writeFileSync(errdir,'','w')
      fs.accessSync(errdir,fs.constants.F_OK|fs.constants.W_OK)
    }catch(er){
      exit('Failed to open '+errdir+'. '+er.message)
    }
  }
  // Check dbconfig accessibility
  try{
    fs.accessSync(dbconfig,fs.constants.F_OK|fs.constants.W_OK)
  }catch(e){
    try{
      fs.writeFileSync(dbconfig,'')
    }catch(er){
      exit('dbconfig file '+dbconfig+' not accessible')
    }
  }
  // Check dbconfig validity
  //
  // dbname: schema name
  // user: username for schema
  // password: password for schema
  // host: host of database
  // port: listening port of the database
  // head: collection name for metadata
  //       {alias:shortname,
  //        name:table/collection name,
  //        type:sql/nosql,
  //        col:{colname:type} (if sql)
  //        }
  //
  // Check DB validity
  // 1. Check DB existance
  // 2. Check Head existance
  // 3. Check Table/Collection existance/validity
  try{
    var dbparam=JSON.parse(fs.readFileSync(dbconfig))
    if(!(db_param.user&&db_param.password&&db_param.host&&db_param.port&&db_param.dbname&&db_param.head)){
      fs.writeFileSync(dbconfig,'{"dbname":"HomeSite","user":"homesite","password":"123456","host":"localhost","port":"33060","head":"CollectionMeta"','w')
      dbparam=JSON.parse(fs.readFileSync(dbconfig))
    }
    connect()
      .then((session)=>{
        // Check schema. terminate if not accessible
        var schema=session.getSchema(dbparam.dbname)
        schema
          .existsInDatabase()
          .then((flag)=>{
            if(flag){
              resolve(schema)
            }else{
              resolve(await session.createSchema(dbparam.dbname)
                .then((schema)=>{
                  resolve(schema)
                })
                .catch((err)=>{
                  exit('Failed to create database')
                })
              )
            }
          })
          .then((schema)=>{
            // Check Head
            var head=schema.getCollection(dbparam.head)
            head.existsInDatabase()
              .then((flag)=>{
                if(flag)
                  resolve(head)
                else
                  resolve(await schema.createCollection(dbparam.head)
                    .then((colle)=>{
                      resolve(colle)
                    })
                    .catch((err)=>{
                      exit('Failed to create collection '+dbparam.head)
                    })
                  )
              })
          })
          .then((colle)=>{
            // Check SQL tables
            colle
              .find('type="sql"')
              .execute((doc)=>{
                if(!(doc.name&&doc.col&&doc.alias))
                  exit('Inconsistancy found in SQL table '+JSON.stringify(doc))
                try{
                  session.sql('SELECT * FROM '+doc.name+' LIMIT 1').execute((row)=>{},(meta)=>{
                  })
                }catch(e){
                  exit('Inconsistancy found in SQL table '+JSON.stringify(doc))
                }
              })
          })
          .catch((err)=>{
            exit('Failed to connect to database')
          })
      })
      .catch((err)=>{
        error('Failed to create session')
      })
    function exit(message){
      console.log(message)
      process.exit()
    }
  }catch(e){
    error()
  }
}
function findBaseDir(){
  const files=['server.js','package.json']
  const dirs=['core','node_modules','views']
  let curdir=__dirname
  var result=false
  try{
    while(!result){
      let flag=true
      files.forEach((file)=>{
        const filename=path.resolve(curdir,file)
        if(!(fs.existsSync(filename)&&fs.statSync(filename).isFile()))
          flag=false
      })
      dirs.forEach((dir)=>{
        const dirname=path.resole(curdir.dir)
        if(!(fs.existsSync(dirname)&&fs.statSync(dirname).isDirectory()))
          flag=false
      })
      if(!flag)
        curdir=path.resolve(curdir,'..')
      else
        result=curdir
    }
  }catch(e){
    result=false
  }
  return result
}

module.exports={
  select:select,
  update:update,
  insert:insert
}
