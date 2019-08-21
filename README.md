This is a a website hosting personal homepage and some web applications. This repo is mainly for my study of web development.

# Author
Xiao Zhang

# Architecture
This app is designed to track all the miscellaneous information during workdays. Therefore it has to record tasks, facilitates meeting notes and timestamp all the events. The architecture design follows temporal workflow of a day.

At the beginning of the workday, the user is prompted to select the scene of the day.

![begin](public/begin.png)
The main UI is designed as follows:

![ui](public/architecture.png)

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
