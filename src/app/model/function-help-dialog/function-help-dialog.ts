import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

/**
 * What a change function has to look like, shown from the info button of the form design.
 * The example is plain SQL, so it is not translated.
 */
@Component({
  selector: "app-function-help-dialog",
  standalone: false,
  templateUrl: "./function-help-dialog.html",
  styleUrl: "./function-help-dialog.css",
})
export class FunctionHelpDialog {
  readonly example = `CREATE OR REPLACE FUNCTION my_function(record json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
declare
  pRow my_table%rowtype;
  BEGIN
    pRow := json_populate_record(null::my_table, record);

    pRow.date_column := now();

    return to_json(pRow);
  END;
$function$;`;

  readonly rules = [
    "ui.column.changeRuleSignature",
    "ui.column.changeRuleRecord",
    "ui.column.changeRuleAnswer",
    "ui.column.changeRuleWhen",
    "ui.column.changeRuleFile",
    "ui.column.changeRuleSave",
  ];

  constructor(private dialogRef: MatDialogRef<FunctionHelpDialog>) {}

  close(): void {
    this.dialogRef.close();
  }
}
