const pend={name:'TablePendingApp',
            col:{name:'TEXT NOT NULL',
                 main_uri:'TEXT NOT NULL',
                 redirect_uri:'TEXT NOT NULL',
                 submission_date:'TEXT NOT NULL',
                 submitted_by:'TEXT'}
}
const main_sess={name:'TableSession',
                 col:{token:'TEXT NOT NULL',
                      sid:'TEXT NOT NULL',
                      created_at:'TEXT NOT NULL',
                      expires_in:'INT NOT NULL'}
}
const pri={name:'TablePriviledge',
           col:{pri:'INT NOT NULL'}
}
const cred={name: 'TableUser',
            col:{username : "TEXT NOT NULL",
                 password : "TEXT NOT NULL",
                 active : "INT NOT NULL",
                 email : "TEXT NOT NULL",
                 creation_date : "TEXT NOT NULL"}
}
const app={name:"TableApp",
           col:{name:'TEXT NOT NULL',
                main_uri:'TEXT NOT NULL',
                redirect_uri:'TEXT NOT NULL',
                approval_date:'TEXT NOT NULL',
                approved_by:'TEXT NOT NULL',
                pri:'INT NOT NULL',
                secret:'TEXT NOT NULL'}
}
function db_path(){
  const dp=require('path').resolve(__dirname,"db")
  const fs=require('fs')
  if(!fs.existsSync(dp)){
    fs.mkdirSync(dp)
  }
  return dp
}
const activation={name:'TableActiv',
                  col:{email:'TEXT NOT NULL',
                       secret:'TEXT NOT NULL',
                       name:'TEXT NOT NULL'}
}
module.exports.auth={dbname:require('path').resolve(db_path(),"auth.sqlite3"),
                     tbl:{user:cred,
                          activation:activation,
                          pri:pri,
                          app:app,
                          pend:pend}
}
module.exports.main={dbname:require('path').resolve(db_path(),'main.sqlite3'),
                     tbl:{session:main_sess}
}
