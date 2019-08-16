module.exports.user={tblname : "TableUser",
                     dbname : require('path').resolve(__dirname,"../db/user.sqlite3"),
                     col : {username : "TEXT NOT NULL",
                            password : "TEXT NOT NULL",
                            active : "INT NOT NULL",
                            email : "TEXT NOT NULL",
                            level : "INT NOT NULL",
                            creation_date : "TEXT NOT NULL"}
                    }
