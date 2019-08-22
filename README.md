This is a a website hosting personal homepage and some web applications. This repo is mainly for my study of web development.

# Author
Xiao Zhang

# Apps

## Auth
/auth

### UI
The auth service stores the user information and provides access to it on requests. Therefore it needs to allow applications to register and users to authorise. The workflow follows:
1. applications register
2. users login
3. access granted/denied
For user login, the UI is:

![login](public/login.png)

For user registration, the UI is:

![usergs](public/usergs.png)

For app registration:

![apprgs](public/apprgs.png)

The basic design of the website contains 3 levels of permission. guest, user and pal. guest only has access to the public pages like about, resume and demo pages of the apps. user has additional access to apps and some chosen resources from storage. pal can access any resource on the site. Therefore guests don't need to be authorised. users are open for registration. pal is only granted to people with invitation token.

### Data Structure
Based on the design, the service needs to have 3 unrelated SQL databases:
- user
  - id(INT)
  - name(TEXT)
  - password(TEXT)
  - level(INT)
  - email(TEXT)
- app
  - name
  - url
  - callback
  - secret
- auth
  - code
  - created_at
  - expires_in

## Worklog
/app/worklog

### Logic & UI
This app is designed to track all the miscellaneous information during workdays. Therefore it has to record tasks, facilitates meeting notes and timestamp all the events. The architecture design follows temporal workflow of a day.

At the beginning of the workday, the user is prompted to select the scene of the day.

![begin](public/begin.png)

If either **in office** or **on business trip** is selected, the main UI shows up. In the meantime the user is prompted to select a task to begin with. The main UI is designed as follows:

![ui](public/mainui.png)

The **Add Task** dialog is designed:

![newtask](public/newTask.png)

The **Add Child** is similar but with a constraint that the child's importance cannot be higher than that of its parent's.

![child](public/addChild.png)

In the **Edit** dialog all the information can be modified.

![edit](public/edit.png)

One of the actions is chosen when the task is finished.

* Solved: mark the task as completed and prompted to start a new task. If the checkbox is checked, all the ui will be greyed out except the tasklist after the dialog is closed, until a task is selected.

  ![solved](public/solved.png)
* Solved but new issue: this task is solved but some new issues appeared during the process.

  ![newbug](public/newbug.png)
* Give up: this task is abandoned for some reason.

  ![giveup](public/giveup.png)

The **Delete**'s confirmation dialog is designed as:

![delete](public/delete.png)

The **Start meeting** dialog is for recording meeting notes. Once clicked, the meeting dialog pops up. The user is then free to edit participants and agenda items. The items are discrete with no relationship. Each item is brought up by the presenter with a self-explainatory title. The conclusion is made at the end of the current item. When finished, the items will be grouped into 1 record and sent to the server. The log will need to be refreshed accordingly.

![meeting](public/meeting.png)

When the **Submit** button is clicked, the following dialog shows up. If the user chooses **Yes**, All changes made today will be submitted as confirmed with a short conclusive comment. In the server, the logs made today and the changes to the tasks will be committed.

![finish](public/finish.png)

When the **Break** button is clicked, the current task is paused and the tasklist is greyed out. A log stating the pause is created. The button itself changes to **Resume**.

If the user chooses **at home** at the beginning of the day, no tasks will be shown and the UI is solely for a record of the day.

![athome](public/athome.png)

### Data Structure
   There are 2 unrelated databases required in the design: task and log. The task can be stored as an SQL database as it has clear predefined structure whereas the log must be stored as a document per day in a NoSQL database. The design follows:
   
   - task
     - owner:int
     - title(TEXT)
     - description(TEXT)
     - importance(INT)
     - parent(INT)
     - status(INT)
     - created_at(TEXT)
     - closed_at(TEXT)
   - log
     - owner:int
     - date:string
     - begin_at:datetime
     - end_at:datetime
     - location:int
     - diary:{datetime:string}
   
   The database designed above is solely for the storage of the permanent data, i.e. committed changes. The temporary changes must be cached in another NoSQL database. Again, the cache database is divided into 2 collections for task and log separately.
   
   - task
     - owner:int
     - task_id:int
     - description:string
     - importance:int
     - status:int
     - parent:int
     - created_at:datetime
     - closed_at:datetime
   - log
     - owner:int
     - begin_at:datetime
     - end_at:datetime
     - location:int
     - diary:{datetime:string}
   
   At the end of the day, if authenticated, the changes saved in the cache database are committed to the permanent store. If not committed, the next time the user logs in, he/she will be prompted to finish the day then able to start a new day.
   
   Last of all, the access point of the data is /app/worklog/data. GET for the retrieval of data, POST for the submission of data. All the request are expected to be made by XmlHttpRequest. All the data transferred are enclosed in JSON string in the html body.

### Authentication && Authorisation
The user need to be authenticated to be able to use the service. The auth service is a core service accessed from /oauth.

#### Registration
The app needs to register with the auth service at installation to use the auth service. The app will provide a name, a mainpage url and a redirect url in exchange for a unique *aid* together with a unique secret string.

#### Authorisation
<!---
When a user browses the app withou a valid authentication, a demo page is displayed. If the user clicks **Login**, he/she will be redirected to the login page for authorisation. The url is /oauth/authorise?response_type=code&client_id=aid&redirect_uri=callback&scope=read.
The user is then prompted to enter username and password to authorise the service. Once authorised, a code is generated indicating that the user is authorised to access the account. the redirect url is callback?code=code
Then the service receives the code and requests for an access token from the url /oauth/token?client_id=aid&client_secret=secret&grant_type=authorization_code&code=code&redirect_uri=callback
If the auth service verifies the code, a token in the form {access_token:token,token_type:bearer,expires_in:int,refresh_token:rtoken,scope:read,uid=int,info={name:string,email:string}} is generated and sent as the response to the service.
--->
When a user browses the app withou a valid authentication, a demo page is displayed. If the user clicks **Login**, he/she will be redirected to the login page for authorisation. The url is /oauth/authorise?response_type=token&client_id=aid&redirect_uri=callback&scope=read.
The user is then prompted to enter username and password to authorise the service. Once authorised, a token is generated indicating that the user is authorised to access the account. The redirect url is redirect/callback#token=token.
The service then returns a script that extracts the token from the full url and receives it.
When the app receives the token, it uses the uid in the token as the owner field in the database, info.name as the username and email as the address to send notification mail.
