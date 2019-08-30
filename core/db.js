module.exports.user={tblname : "TableUser",
                     dbname : require('path').resolve(db_path(),"user.sqlite3"),
                     col : {username : "TEXT NOT NULL",
                            password : "TEXT NOT NULL",
                            active : "INT NOT NULL",
                            email : "TEXT NOT NULL",
                            creation_date : "TEXT NOT NULL"}
                    }
module.exports.app={tblname : "TableApp",
                    dbname:require('path').resolve(db_path(),'app.sqlite3'),
                    col:{name:'TEXT NOT NULL',
                         main_uri:'TEXT NOT NULL',
                         redirect_uri:'TEXT NOT NULL',
                         secret:'TEXT NOT NULL'}
                   }
module.exports.session={tblname:'TableSession',
                        dbname:require('path').resolve(db_path(),'main.sqlite3'),
                        col:{token:'TEXT NOT NULL',
                             sid:'TEXT NOT NULL',
                             created_at:'TEXT NOT NULL',
                             expires_in:'INT NOT NULL'}
                       }
function db_path(){
  const dp=require('path').resolve(__dirname,"db")
  const fs=require('fs')
  if(!fs.existsSync(dp)){
    fs.mkdirSync(dp)
  }
  return dp
}
