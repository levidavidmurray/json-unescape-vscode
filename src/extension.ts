/*
[
  {
    "id": 1234,
    "name": "John Doe",
    "total": "838.33",
    "json_example": "{\"a\":123,\"b\":\"foo\",\"c\":\"bar\"}"
  }
]
*/

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "json-unescape.unescape-selection",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        console.log("No active editor");
        return;
      }
      const document = editor.document;
      const selection = editor.selection;
      const text = document.getText(selection);
      try {
        const unescapedText = JSON.parse(JSON.parse(text));
        editor
          .edit((editBuilder) => {
            const unescaped = JSON.stringify(unescapedText, null, 2);
            editBuilder.replace(selection, unescaped);
          })
          .then((success: boolean) => {
            if (success) {
              vscode.commands.executeCommand("editor.action.formatDocument");
            }
          });
      } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage("Invalid JSON");
      }
    }
  );

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand("json-unescape.unescape", () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      console.log("No active editor");
      return;
    }
    const document = editor.document;
    const text = document.getText();
	const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
	);
    let jsonArray = JSON.parse(text);

	const convertValues = (obj: any) => {
		Object.keys(obj).forEach((key) => {
			if (typeof obj[key] === 'object' && obj[key] !== null) {
				convertValues(obj[key]);
			} else if (typeof obj[key] === 'string') {
				try {
					obj[key] = JSON.parse(obj[key]);
				} catch (error) {
					// skip if not parsable
				}
			}
		});
	}

	jsonArray.forEach((obj: any) => {
		convertValues(obj);
	});
	editor.edit((editBuilder) => {
		const unescaped = JSON.stringify(jsonArray, null, 2);
		editBuilder.replace(fullRange, unescaped);
		})
		.then((success: boolean) => {
		if (success) {
			vscode.commands.executeCommand("editor.action.formatDocument");
		}
	});
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
