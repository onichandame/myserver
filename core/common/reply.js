/* takes res and sends it based on properties:
 *
 * status
 * statusCode: HTTP status. default 500
 *
 * header
 * set before calling this function
 *
 * body
 * res.page: path of the file being rendered
 * res.body: JSON/string/Number being sent
 * none of above: send without body
 *
 * resolves res on success, log error
 */
module.exports=function(res){
  return new Promise((resolve,reject)=>{
    if(!res.statusCode) res.status(500)
    if(res.page) res.render(res.page)
    else if(res.body) res.send(JSON.stringify(res.body))
    else res.send()
    return resolve(res)
  })
}
