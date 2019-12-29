const path=require('path')
const okitchen=require('okitchen')

/**
 * initiates files and databases
 * @function init
 * @returns {Promise} resolves with nothing on success. rejects with error on failure
 */
module.exports=function(){
  return okitchen.init({datadir:path.resolve(__dirname,'data')})
  .then(()=>{return require(path.resolve(__dirname,'route','auth','init.js'))()})
  .then(()=>{return require(path.resolve(__dirname,'route','app','init.js'))()})
}
