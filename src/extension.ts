import * as vscode from "vscode";
import { LocalizeR } from "./LocalizeR";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ["typescript", "typescriptreact"],
      new LocalizeR(),
      {
        providedCodeActionKinds: LocalizeR.providedCodeActionKinds
      }
    )
  );
}

export function deactivate() {}
