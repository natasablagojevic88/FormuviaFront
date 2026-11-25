# Processes

A **process** is the way a record of a table goes after it is entered: who has to approve it, what the database does with it on the way, and who is told. A purchase request, for example, first goes to the manager; if the amount is large it goes on to the director; once it is approved an order is made and the buyers are told, and if it is rejected the person who asked is told instead.

A table can have several processes. You reach them from [Model](/model): ⋯ → **Processes** on a table.

::: info What is in effect today
Processes can be drawn, checked and saved, and they stay with the table. Records do not go through them yet: entering a record does not start a process, and nobody gets a task to accept or reject. This page describes the designer; how a running process is followed will be added when records start going through.
:::

## The list of processes

The page lists the processes of the table by name, with their start and end procedure. *Add* opens the designer for a new process, *Edit* opens the designer for that one, and ⋯ → *Delete* deletes the process together with all its steps.

## The designer

The designer has two parts: the **board**, where the process is drawn as a tree from the top down, and the **panel** beside it (under it on a phone), where the box you clicked is set up. Nothing goes to the server until you click **Save** at the top; a dot on the button says there are unsaved changes, and *Back* asks before it lets them go.

### The start: name and procedures

The blue box at the top is the process itself. Click it to give the process its **name**, which has to be unique within the table, and, if you need them:

- **Start procedure** — a procedure of the database that runs when the process begins
- **End procedure** — one that runs when the process reaches any of its ends

Both are chosen from the procedures that exist in the database. In the same panel, *Add the first step* puts the first box under the start.

### Kinds of steps

Every box under the start is a step, and it is one of three kinds, each with its own color:

- **Task** (blue) — one user accepts or rejects it. Choose **who decides**, and the **fields the user may change** while deciding; the other fields of the record stay as they are.
- **Procedure** (violet) — a procedure of the database runs, and the process goes on.
- **Notification** (orange) — the chosen **recipients** get a notification with the **subject** and **text** you write, and the process goes on.

The kind can be changed in the panel at any time. A step turned from a task into something else keeps the steps after it, but they no longer depend on a decision.

Every step needs a name, and no two steps of a process may have the same one.

### Branches and ends

What comes after a step is set at the bottom of its panel:

- after a **task** there are two branches: **After acceptance** (a green line on the board) and **After rejection** (a red line)
- after any other step there is one: **After this step** (a grey line)

In each branch you either add the next step — *Task*, *Procedure* or *Notification* — or switch on **Ends the process**, which puts a small *End* box on the board. A branch can split into several steps; each of them can have an **entry condition**, so only the steps whose condition holds are entered. The switch is locked while steps follow in that branch: delete them first to end the process there.

**Entry condition (SQL)** is a `SELECT`. It is written in the panel of the step it guards and shown on the line that leads to that step. Left empty, the step is always entered.

### What is still missing

Under the board the designer lists what the server would refuse, all at once: a step without a name, a task nobody decides, a notification without recipients, a branch that leads nowhere, or a process that never ends. Click an item to open the step it is about; a step with something missing also carries an orange mark on the board. The process is saved only when the list is empty and says that the process is complete.

### Deleting a step

*Delete step* at the bottom of the panel deletes the step. When other steps follow it, they are deleted with it, and the designer says how many before doing so. Like every other change in the designer, it is final only after *Save*.
