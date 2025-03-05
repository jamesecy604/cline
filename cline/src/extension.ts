import * as vscode from 'vscode';
import { isAuthenticated } from './auth';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.start', async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        vscode.window.showErrorMessage('You must be logged in to use this extension.');
        return;
      }

      // Proceed with the extension's functionality
      vscode.window.showInformationMessage('Welcome to the cline extension!');
    })
  );
} 