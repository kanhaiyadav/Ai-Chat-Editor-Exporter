import { ArrowRight, Cog, Palette, Save } from 'lucide-react'
import './App.css'
import { RiExportLine } from 'react-icons/ri'
import { FaRegFilePdf } from 'react-icons/fa6'
import { HiSparkles } from 'react-icons/hi2'
import { Arrow } from '@radix-ui/react-select'

function App() {
    const handleOpenOptions = () => {
        const optionsUrl = chrome.runtime.getURL("/options.html");
        chrome.tabs.create({ url: optionsUrl });
    }

    return (
        <div className="popup-container">
            {/* Header */}
            <div className="popup-header flex items-center gap-4">
                <div className="flex items-center gap-3 mb-1">
                    <img src="/chat2pdf2.png" alt="" className='w-[40px]' />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Chat2PDF</h1>
                    <p className="text-base font-semibold text-gray-900">AI Chat Editor & Exporter</p>
                </div>
            </div>

            {/* Description */}
            <div className="popup-section">
                <h2 className="section-title"><HiSparkles size={20} className='text-orange-300' /> Features</h2>
                <ul className="feature-list">
                    <li className="feature-item"><Save size={16} /> <span>Merge, Save and manage chats</span></li>
                    <li className="feature-item"><FaRegFilePdf size={16} /> <span>Export chats to PDF</span></li>
                    <li className="feature-item"><Cog size={16} /> <span>Customize export settings</span></li>
                    <li className="feature-item"><Palette size={16} /> <span>Create presets for quick export</span></li>
                </ul>
            </div>

            {/* How to Use */}
            <div className="popup-section">
                <h2 className="section-title">How to Use on ChatGPT</h2>
                <div className="instruction-box">
                    <div className="instruction-step">
                        <span className="step-number">1</span>
                        <p>Visit ChatGPT and start a conversation</p>
                    </div>
                    <div className="">
                        <div className='flex gap-3'>
                            <span className="step-number">2</span>
                            <p>Look for the <strong>"Export Chat"</strong> button at the top right of the conversation</p>
                        </div>
                        <img
                            src="/export-location.png"
                            alt="Export button location"
                            className="rounded-lg"
                        />
                    </div>
                    <div className="instruction-step">
                        <span className="step-number">3</span>
                        <p>Open the editor by clicking on the export button</p>
                    </div>
                </div>
            </div>

            {/* Coming Soon */}
            <div className="popup-section coming-soon-box !mb-25">
                <h3 className="font-semibold text-sm mb-2">Coming Soon</h3>
                <p className="text-xs text-muted-foreground">
                    Export functionality for Claude, Gemini, and Deepseek will be added soon!
                </p>
            </div>

            <div className='fixed bottom-0 left-0 right-0 !p-3 bg-white border-t border-gray-200'>
                <button
                    onClick={handleOpenOptions}
                    className="popup-button mb-[-10px]"
                >
                    <span>Open Chat2PDF Editor</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    )
}

export default App
