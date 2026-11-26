# Processes

A **process** is the way a record of a table goes after it is entered: who has to approve it, what the database does with it on the way, and who is told. A purchase request, for example, first goes to the manager; if the amount is large it goes on to the director; once it is approved an order is made and the buyers are told, and if it is rejected the person who asked is told instead.

A table can have several processes. You reach them from [Model](/model): ⋯ → **Processes** on a table.

::: info What is in effect today
Processes can be drawn, checked and saved, and they stay with the table. Records do not go through them yet: entering a record does not start a process, and nobody gets a task to accept or reject. This page describes the designer; how a running process is followed will be added when records start going through.
:::

## The list of processes

The page lists the processes of the table by name, with their start and end procedure. *Add* opens the designer for a new process, *Edit* opens the designer for that one, and ⋯ → *Delete* deletes the process together with all its steps.

## The designer

The designer has two parts: the **board**, where the process is drawn from the top down, and the **panel** beside it (under it on a phone), where the box you clicked is set up. Nothing goes to the server until you click **Save** at the top; a dot on the button says there are unsaved changes, and *Back* asks before it lets them go.

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

Every step needs a name, and no two steps of a process may have the same one; the name field says so as soon as you type a name that is taken. When the same step is to come after another step as well, do not make a second one with the same name: link the one already drawn, as described in [A step after more steps](#a-step-after-more-steps).

### Branches and ends

What comes after a step is set at the bottom of its panel:

- after a **task** there are two branches: **After acceptance** (a green line on the board) and **After rejection** (a red line)
- after any other step there is one: **After this step** (a grey line)

In each branch you either add the next step — *Task*, *Procedure* or *Notification* — or switch on **Ends the process**, which puts a small *End* box on the board. A branch can split into several steps; each of them can have an **entry condition**, so only the steps whose condition holds are entered. The switch is locked while steps follow in that branch: delete them, or take away their arrows, to end the process there.

**Entry condition (SQL)** is a `SELECT`. It is written in the panel of the step it guards and shown on the line that leads to that step. Left empty, the step is always entered.

### A step after more steps

Under *Add the next step* there is also **Or a step already drawn**: the branch then goes on to a step that is already on the board instead of a new one. That step now comes after more steps; it stays one box, with a line from each of them. Only steps that would not close a circle are offered — never the step itself or one that comes before it.

A step that more steps lead to shows how many it waits for, for example **2/3** at its top left. In its panel, **Comes after more steps** lists those steps with the decision they lead by, and sets how many of them have to reach it: **Entered when it is reached from at least N of M**. The step is entered once, as soon as that many have led to it. When a second arrow is added the step waits for all of them; lower the number when one of them is enough, for example *1 of 2* when either of two ways leads to the same notification, or *2 of 3* when two of three approvals are enough.

::: warning A step that may never be entered
A previous step does not surely lead here when it has an entry condition (it may be left out), or when it is a task and its other decision goes on instead of ending the process. When the steps that surely lead here are fewer than the number the step waits for, its mark on the board turns orange and its panel says which steps those are: the step may never be entered, and a record would wait there. It is only a warning and does not stop saving; lower the number, or let the other decision end the process, when that must not happen.
:::

The button beside a previous step takes its arrow away. The last arrow cannot be taken away: a step must come after something.

### What is still missing

Under the board the designer lists what the server would refuse, all at once: a step without a name, a task nobody decides, a notification without recipients, a branch that leads nowhere, a step that waits for more steps than lead to it, or a process that never ends. Click an item to open the step it is about; a step with something missing also carries an orange mark on the board. The process is saved only when the list is empty and says that the process is complete.

### Deleting a step

*Delete step* at the bottom of the panel deletes the step. The steps after it that nothing else leads to are deleted with it, and the designer says how many before doing so; a step that another step still leads to stays, and only loses the arrow from the deleted one. Like every other change in the designer, it is final only after *Save*.
