/* Setup DB for oauth and home services
 *
 * user
 * - username
 * - active
 * - email
 * - password
 *
 * app
 * - name
 * - redirect_uri
 * - secret
 * - type
 */
const path=require('path')
const {checkTable}=require(path.resolve(__dirname,'util','db.js'))
const {logger}=require(path.resolve(__dirname,'util','logger.js'))
async function setup(){
  const tbls=[
    {
        alias:'user',name:'TableUser',cols:{
          username:'TEXT NOT NULL',
          email:'TEXT NOT NULL',
          active:'INT NOT NULL', //0: not active 1: active
          password:'TEXT NOT NULL'
      }},{
        alias:'app',name:'TableApp',cols:{
          name:'TEXT NOT NULL',
          redirect_uri:'TEXT NOT NULL',
          secret:'TEXT NOT NULL',
          permission:'INT NOT NULL', //0x1: read 0x2: write
          type:'INT NOT NULL' //0: web 1: native
      }},{
        alias:'appadmin',name:'TableAppAdmin',cols:{
          level:'INT NOT NULL' // 0: add/modify/delete 1: add
        }}]
  tbls.forEach((tbl)=>{
    checkTable(tbl,(flag)=>{
      if(!flag)
        logger.error('Failed to create')
    })
  })
}

module.exports=setup
