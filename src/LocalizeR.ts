import * as vscode from "vscode";
import { basename } from "path";
import { toTitleCase } from "./utils/strings";

export interface Config {
  localeFile: string;
  localeReplacer: string;
  localePrefix: string;
}

export class LocalizeR implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
    vscode.CodeActionKind.Refactor,
    vscode.CodeActionKind.RefactorInline,
    vscode.CodeActionKind.RefactorRewrite
  ];
  private config!: Config;
  public constructor() {
    this.loadConfig();
  }
  public loadConfig() {
    const localeFile = vscode.workspace
      .getConfiguration()
      .get<string>("localizer.locale.file");
    const localeReplacer = vscode.workspace
      .getConfiguration()
      .get<string>("localizer.locale.replacer");
    const localePrefix = vscode.workspace
      .getConfiguration()
      .get<string>("localizer.locale.prefix");
    if (!localeFile) {
      vscode.window.showErrorMessage("Must add localeFile in settings");
      return;
    }
    if (!localeReplacer) {
      vscode.window.showErrorMessage("Must add localeReplacer in settings");
      return;
    }
    if (!localePrefix) {
      vscode.window.showErrorMessage("Must add localePrefix in settings");
      return;
    }
    this.config = {
      localeFile,
      localePrefix,
      localeReplacer
    };
  }
  public async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range
  ): Promise<vscode.CodeAction[] | undefined> {
    const keyword = this.getKeyword(document, range);
    if (!keyword) {
      return;
    }
    let localeDocument;
    try {
      localeDocument = await vscode.workspace.openTextDocument(
        vscode.workspace.rootPath + "/" + this.config.localeFile
      );
    } catch (e) {
      vscode.window.showErrorMessage(e.message);
      return;
    }
    const generateTranslate = this.createAction(localeDocument, keyword);
    return [generateTranslate];
  }
  public getKeyword(
    document: vscode.TextDocument,
    range: vscode.Range
  ): string | undefined {
    const rangeKeyword = document.getWordRangeAtPosition(range.start);
    if (!rangeKeyword) {
      return;
    }
    const start = rangeKeyword.start;
    const prefix = document.getText(
      new vscode.Range(
        new vscode.Position(start.line, start.character - 2),
        start
      )
    );
    /**
     * maybe we need to make better prefix definition
     */
    if (prefix !== this.config.localePrefix) {
      return;
    }
    const line = document.getText(rangeKeyword);
    return line;
  }
  private createAction(
    document: vscode.TextDocument,
    key: string
  ): vscode.CodeAction {
    const fix = new vscode.CodeAction(
      `Add "${key}" to locale file "${basename(this.config.localeFile)}"`,
      vscode.CodeActionKind.QuickFix
    );
    const finalText = document.getText().replace(
      this.config.localeReplacer,
      `'${key}':'${toTitleCase(key)}',
${this.config.localeReplacer}`
    );
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      finalText
    );
    fix.isPreferred = true;
    fix.edit = edit;
    return fix;
  }
}
