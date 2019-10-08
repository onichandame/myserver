/* Database. Only basic operations without wrapped log utility
 *
 * select(tbl,[targets],'condition',callback(row),finish(num)
 * insert(tbl,{info}/[{info}],callback(lastID/[lastIDs]))
 * update(tbl,{entries},'condition',callback())
 */
const path=require('path')
const sqlite3=require('sqlite3').verbose()
const db_param=require(path.resolve(__dirname,"db.js"))
const fs=require('fs')
const {exit,getConfig}=require(path.resolve(__dirname,'base.js'))

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

async function checkTable(schema,callback){
  const {name,cols}=schema
  getTableName(name,(tblname)=>{
    connect((db)=>{
      var existingCol=[]
      db.each('PRAGMA table_info(\''+tblname+'\')',(err,row)=>{
        if(err)
          exit('Failed to retrieve table info of '+name)
        const {name,type,notnull}=row
        str=type+(notnull ? ' NOT NULL' : '')
        if(str==cols[name])
          existingCol.push(name)
        else
          exit('Metatable inconsistant with existing table '+tblname)
      },(err,num)=>{
        if(err)
          exit('Failed to iterate all columns of '+name)
        if(num<1){
          addTable(schema.alias,name,cols,()=>{
            return callback(true)
          })
        }else{
          var keys=Object.keys(cols)
          keys.forEach((key)=>{
            if(!existingCol[key])
              return callback(false)
          })
          return callback(true)
        }
      })
    })
  })
}


module.exports={
  select:select,
  update:update,
  insert:insert,
  dropTable:dropTable,
  addTable:addTable,
  checkTable:checkTable,
  initDB:initDB
}
