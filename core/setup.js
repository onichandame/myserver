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
          active:'INT NOT NULL',
          password:'TEXT NOT NULL'
      }},{
        alias:'app',name:'TableApp',cols:{
          name:'TEXT NOT NULL',
          redirect_uri:'TEXT NOT NULL',
          secret:'TEXT NOT NULL',
          type:'INT NOT NULL'
      }},{
        alias:'appadmin',name:'TableAppAdmin',cols:{
          level:'INT NOT NULL'
        }}]
  tbls.forEach((tbl)=>{
    checkTable(tbl,(flag)=>{
      if(!flag)
        logger.error('Failed to create')
    })
  })
}

module.exports=setup
