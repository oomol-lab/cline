import { useCallback, useEffect, useState } from "react"
import { useEvent } from "react-use"
import { ExtensionMessage } from "../../src/shared/ExtensionMessage"
import ChatView from "./components/chat/ChatView"
import HistoryView from "./components/history/HistoryView"
import SettingsView from "./components/settings/SettingsView"
import WelcomeView from "./components/welcome/WelcomeView"
import { ExtensionStateContextProvider, useExtensionState } from "./context/ExtensionStateContext"
import { vscode } from "./utils/vscode"
import { I18nProvider } from "val-i18n-react"
import { I18n } from "val-i18n"
import { createI18n } from "./locales"

const AppContent = () => {
	const { didHydrateState, showWelcome, shouldShowAnnouncement, locale } = useExtensionState()
	const [showSettings, setShowSettings] = useState(false)
	const [showHistory, setShowHistory] = useState(false)
	const [showAnnouncement, setShowAnnouncement] = useState(false)
    const [i18n, setI18n] = useState<I18n | null>(null)

    useEffect(() => {
        if (i18n) {
            i18n.dispose()
        }
        createI18n(locale).then(instance => {
            setI18n(instance)
        });
        return () =>  i18n?.dispose()
    }, [locale, i18n])

	const handleMessage = useCallback((e: MessageEvent) => {
		const message: ExtensionMessage = e.data
		switch (message.type) {
			case "action":
				switch (message.action!) {
					case "settingsButtonClicked":
						setShowSettings(true)
						setShowHistory(false)
						break
					case "historyButtonClicked":
						setShowSettings(false)
						setShowHistory(true)
						break
					case "chatButtonClicked":
						setShowSettings(false)
						setShowHistory(false)
						break
				}
				break
		}
	}, [])

	useEvent("message", handleMessage)

	useEffect(() => {
		if (shouldShowAnnouncement) {
			setShowAnnouncement(true)
			vscode.postMessage({ type: "didShowAnnouncement" })
		}
	}, [shouldShowAnnouncement])

	if (!didHydrateState) {
		return null
	}

    if (!i18n) {
        return null
    }

	return (
		<I18nProvider i18n={i18n}>
			{showWelcome ? (
				<WelcomeView />
			) : (
				<>
					{showSettings && <SettingsView onDone={() => setShowSettings(false)} />}
					{showHistory && <HistoryView onDone={() => setShowHistory(false)} />}
					{/* Do not conditionally load ChatView, it's expensive and there's state we don't want to lose (user input, disableInput, askResponse promise, etc.) */}
					<ChatView
						showHistoryView={() => {
							setShowSettings(false)
							setShowHistory(true)
						}}
						isHidden={showSettings || showHistory}
						showAnnouncement={showAnnouncement}
						hideAnnouncement={() => {
							setShowAnnouncement(false)
						}}
					/>
				</>
			)}
        </I18nProvider>
	)
}

const App = () => {
	return (
		<ExtensionStateContextProvider>
            <AppContent />
		</ExtensionStateContextProvider>
	)
}

export default App
