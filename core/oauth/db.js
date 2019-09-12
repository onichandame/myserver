const user={name: 'TableUser',
            col:{given_name: "TEXT NOT NULL",
                 family_name: "TEXT NOT NULL",
                 name_order: "INT NOT NULL",
                 password: "TEXT NOT NULL",
                 active: "INT NOT NULL",
                 email: "TEXT NOT NULL",
                 creation_date : "TEXT NOT NULL"}
}
const appadmin={name:"TableAdminApp",
                col:{level:'INT NOT NULL'}
}
const app={name:"TableApp",
           col:{name:'TEXT NOT NULL',
                type:'INT NOT NULL',
                callback:'TEXT NOT NULL',
                secret:'TEXT NOT NULL',
                creator:'INT NOT NULL',
                priviledge:'INT NOT NULL'}
}
const session={name:'TableSession',
               col:{creation_date:'TEXT NOT NULL',
                    expired_in:'TEXT NOT NULL',
                    uid:'INT NOT NULL'}
}
function db_path(){
  const dp=require('path').resolve(__dirname,"db")
  const fs=require('fs')
  if(!fs.existsSync(dp)){
    fs.mkdirSync(dp)
  }
  return dp
}
module.exports={dbname:require('path').resolve(db_path(),"db.sqlite3"),
                   tbl:{user:user,
                        app:app,
                        appadmin:appadmin,
                        session:session}
}
