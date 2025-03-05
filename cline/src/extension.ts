import * as vscode from "vscode"
import { isAuthenticated } from "./auth"

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel("mayai")
	context.subscriptions.push(outputChannel)

	Logger.initialize(outputChannel)
	Logger.log("mayai extension activated")

	const sidebarProvider = new mayaiProvider(context, outputChannel)

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(mayaiProvider.sideBarId, sidebarProvider, {
			webviewOptions: { retainContextWhenHidden: true },
		})
	)

	// Authentication check before executing commands
	const executeWithAuth = async (command: () => void) => {
		const authenticated = await isAuthenticated()
		if (!authenticated) {
			const selection = await vscode.window.showErrorMessage(
				"You must be logged in to use this extension.",
				"Login"
			)
			if (selection === "Login") {
				vscode.commands.executeCommand("mayai.login")
			}
			return
		}
		command()
	}

	// Register login command
	context.subscriptions.push(
		vscode.commands.registerCommand("mayai.login", async () => {
			const loginUrl = "http://localhost:3000/api/auth/signin" // Adjust URL as needed
			vscode.env.openExternal(vscode.Uri.parse(loginUrl))
		})
	)

	// Register other commands with authentication
	context.subscriptions.push(
		vscode.commands.registerCommand("mayai.plusButtonClicked", async () => {
			await executeWithAuth(async () => {
				Logger.log("Plus button Clicked")
				await sidebarProvider.clearTask()
				await sidebarProvider.postStateToWebview()
				await sidebarProvider.postMessageToWebview({
					type: "action",
					action: "chatButtonClicked",
				})
			})
		})
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("mayai.mcpButtonClicked", () => {
			executeWithAuth(() => {
				sidebarProvider.postMessageToWebview({
					type: "action",
					action: "mcpButtonClicked",
				})
			})
		})
	)

	const openmayaiInNewTab = async () => {
		Logger.log("Opening mayai in new tab")
		const tabProvider = new mayaiProvider(context, outputChannel)
		const lastCol = Math.max(...vscode.window.visibleTextEditors.map((editor) => editor.viewColumn || 0))

		const hasVisibleEditors = vscode.window.visibleTextEditors.length > 0
		if (!hasVisibleEditors) {
			await vscode.commands.executeCommand("workbench.action.newGroupRight")
		}
		const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : vscode.ViewColumn.Two

		const panel = vscode.window.createWebviewPanel(mayaiProvider.tabPanelId, "mayai", targetCol, {
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: [context.extensionUri],
		})

		panel.iconPath = {
			light: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "robot_panel_light.png"),
			dark: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "robot_panel_dark.png"),
		}
		tabProvider.resolveWebviewView(panel)

		await delay(100)
		await vscode.commands.executeCommand("workbench.action.lockEditorGroup")
	}

	context.subscriptions.push(
		vscode.commands.registerCommand("mayai.popoutButtonClicked", () => {
			executeWithAuth(openmayaiInNewTab)
		})
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("mayai.openInNewTab", () => {
			executeWithAuth(openmayaiInNewTab)
		})
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("mayai.settingsButtonClicked", () => {
			executeWithAuth(() => {
				sidebarProvider.postMessageToWebview({
					type: "action",
					action: "settingsButtonClicked",
				})
			})
		})
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("mayai.historyButtonClicked", () => {
			executeWithAuth(() => {
				sidebarProvider.postMessageToWebview({
					type: "action",
					action: "historyButtonClicked",
				})
			})
		})
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("mayai.accountLoginClicked", () => {
			executeWithAuth(() => {
				sidebarProvider.postMessageToWebview({
					type: "action",
					action: "accountLoginClicked",
				})
			})
		})
	)

	const diffContentProvider = new (class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri): string {
			return Buffer.from(uri.query, "base64").toString("utf-8")
		}
	})()
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(DIFF_VIEW_URI_SCHEME, diffContentProvider))

	const handleUri = async (uri: vscode.Uri) => {
		console.log("URI Handler called with:", {
			path: uri.path,
			query: uri.query,
			scheme: uri.scheme,
		})

		const path = uri.path
		const query = new URLSearchParams(uri.query.replace(/\+/g, "%2B"))
		const visibleProvider = mayaiProvider.getVisibleInstance()
		if (!visibleProvider) {
			return
		}
		switch (path) {
			case "/openrouter": {
				const code = query.get("code")
				if (code) {
					await visibleProvider.handleOpenRouterCallback(code)
				}
				break
			}
			case "/auth": {
				const token = query.get("token")
				const state = query.get("state")

				console.log("Auth callback received:", {
					token: token,
					state: state,
				})

				if (!(await visibleProvider.validateAuthState(state))) {
					vscode.window.showErrorMessage("Invalid auth state")
					return
				}

				if (token) {
					await visibleProvider.handleAuthCallback(token)
				}
				break
			}
			default:
				break
		}
	}
	context.subscriptions.push(vscode.window.registerUriHandler({ handleUri }))

	return createmayaiAPI(outputChannel, sidebarProvider)
}
