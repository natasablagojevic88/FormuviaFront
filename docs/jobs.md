# Jobs

**Jobs** is the one place where everything that Formuvia runs by itself stands together. It is reached from the menu, under *Jobs*, and it needs no role of its own: every user gets the jobs that are tied to a role they have, and a job without a role is shown to an administrator alone.

A job itself is entered with the report it belongs to — in *Administration / Reports*, in the row menu of a report, under *Jobs* ([Reports](/reports#jobs-a-report-that-runs-by-itself) says what the form asks for). This page is the other side of that: what the scheduler made of those jobs and how they have been faring.

## What the list shows

One row is one job of the scheduler, with everything about it read at the moment the page was opened:

| | |
|---|---|
| **Name** | the name the job stands under in the scheduler |
| **On** | *Yes* while the job has its place in the timetable; *No* for a job that was switched off |
| **Last run** | when the scheduler last took the job over |
| **Next run** | when it takes it over again, by the timetable of the job |
| **Outcome** | how the last run ended: *Went through*, *Failed*, or *Running* while it is still working |
| **Finished** | when that last run was over |

A job that has never run yet says so instead of an outcome. A job that was switched off keeps its last run and its outcome — only the next run has nothing to show, because there is none.

The whole list comes at once, without pages: the jobs of an application are counted in tens, not in thousands. *Refresh* in the header reads them all again, which is the way to see how a job that has just been running ended.

## Finding a job

The field above the list searches by **name**, and it searches while it is typed. It looks into the list that is already on the screen, so nothing is asked of the server and the x gives the whole list back.

## Running a job now

The ▶ button on the row asks first — a job is run for real, and a mail that has gone out cannot be called back — and then hands the job over to the scheduler right away. It is the same run as the one the timetable would have started — the same mail, the same file, the same work over the data — only it does not wait for its time. The timetable itself is not moved: *Next run* stays where it was.

The button only says that the job was taken over, not that it is done: the run goes on by itself, and it can take as long as the report takes. The row is read again the moment the job is handed over, so a run that has not finished yet stands there as *Running*; ⟳ on the row, or *Refresh* in the header, shows how it ended.

Running a job by hand is written down like any other run, so it stands in *Outcome* and it reaches the address for errors the job carries if it does not go through.

## When a job does not go through

A run that failed carries the error with it, and a ⚠ beside the outcome opens it: the message first, and under it the trace the server wrote down. That is the same text the job sends to its *Address for errors*, so nothing is lost by not having set one.

## Every run of a job

The list carries the **last** run of a job; the ones before it are opened with 🕘 on the row. The runs stand there newest first, one row each:

| | |
|---|---|
| **Started** | when the scheduler took the job over |
| **Finished** | when the run was over; a run that is still going has nothing here |
| **Outcome** | *Went through*, *Failed*, or *Running* |
| **Error** | what a run that failed broke on; a run that went through has nothing here |

It is the usual table of the application, so the runs are sorted by any column, searched through *Advanced search* (by outcome, or by the day the run started), read page by page and taken out into Excel. A run started by hand with ▶ is written down the same way as one the timetable started, so the two stand side by side here.

## Changing a job

✎ on the row opens the form of the job, the same one the report screen opens. It is there only for a job that still belongs to a report, and only for a user who may reach *Administration / Reports* — a job is changed where it was entered, and that screen belongs to the administrator.

What is changed — the timetable among it — takes effect at once: the row is read again after saving, so the new *Next run* is on the screen without loading the whole list.

::: tip
A job without a report behind it cannot be run from here, and it cannot be changed: a job works over a report, and there is none. What stands written down about its earlier runs stays and is read with 🕘.
:::
