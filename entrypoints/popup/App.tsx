import { ArrowRight, Cog, Palette, Save } from 'lucide-react'
import './App.css'
import { FiFileText } from "react-icons/fi";
import { HiSparkles } from 'react-icons/hi2'

const platformData = [
    {
        icon: '/chat/chatgpt.png',
        name: 'ChatGPT',
        image: 'https://github.com/kanhaiyadav/assests/blob/main/export-location.png?raw=true',
        instructions: [
            'Visit ChatGPT,',
            'Click on the "ExportMyChat" button at the top right of the conversation pag, to open the chat in the editor.',
            'Open the editor by clicking on the export button'
        ],
        link: 'https://chat.openai.com/'
    },
    {
        icon: '/chat/claude.png',
        name: 'Claude',
        image: 'https://github.com/kanhaiyadav/assests/blob/main/Screenshot%202025-12-11%20180828.png?raw=true',
        instructions: [
            'Visit Claude',
            'Click on the "ExportMyChat" button at the top right of the conversation pag, to open the chat in the editor.',
            'Open the editor by clicking on the export button'
        ],
        link: 'https://claude.ai/'
    },
    {
        icon: '/chat/gemini.png',
        name: 'Gemini',
        image: 'https://github.com/kanhaiyadav/assests/blob/main/Screenshot%202025-12-14%20222152%20-%20Copy.png?raw=true',
        instructions: [
            'Visit Gemini,',
            'Click on the "ExportMyChat" button at the top right of the conversation pag, to open the chat in the editor.',
            'Open the editor by clicking on the export button'
        ],
        link: 'https://gemini.google.com/'
    },
    {
        icon: '/chat/deepseek.png',
        name: 'Deepseek',
        image: 'https://github.com/kanhaiyadav/assests/blob/main/Screenshot%202025-12-14%20222316%20-%20Copy.png?raw=true',
        instructions: [
            'Visit Deepseek,',
            'Click on the "ExportMyChat" button at the top Left of the conversation page, to open the chat in the editor.',
            'Open the editor by clicking on the export button'
        ],
        link: 'https://chat.deepseek.com/'
    }
];

function App() {
    const handleOpenOptions = () => {
        const optionsUrl = chrome.runtime.getURL("/options.html");
        chrome.tabs.create({ url: optionsUrl });
    }

    return (
        <div className="popup-container ">
            {/* Header */}
            <div className="popup-header flex items-center gap-3">
                <div className="flex items-center gap-3 mb-1">
                    <img src="/ExportMyChat_white.png" alt="" className='w-[50px]' />
                </div>
                <div>
                    <h1 className="text-xl font-bold">ExportMyChat</h1>
                    <p className="text-base font-semibold text-gray-900">Edit and Export Ai Chats</p>
                </div>
            </div>

            {/* Description */}
            <div className="popup-section">
                <h2 className="text-lg font-bold flex items-center gap-2"><HiSparkles size={20} className='text-orange-300' /> Features</h2>
                <ul className="feature-list">
                    <li className="feature-item"><Save size={16} /> <span>Merge, Save and manage chats</span></li>
                    <li className="feature-item"><FiFileText size={16} /> <span>Export chats to PDF, Doc, HTML, md, and more</span></li>
                    <li className="feature-item"><Cog size={16} /> <span>Customize export settings</span></li>
                    <li className="feature-item"><Palette size={16} /> <span>Create presets for quick export</span></li>
                </ul>
            </div>

            <h1 className='text-lg font-bold ml-4'>How to Use</h1>
            {/* How to Use */}
            {

                platformData.map((platform) => (
                    <div className="popup-section flex flex-col gap-3" key={platform.name}>
                        <div className='flex gap-2 items-center'>
                            <img src={platform.icon} alt="" className='w-5' />
                            <h2 className="text-base font-semibold">{platform.name}</h2>
                        </div>
                        <div className="instruction-box">
                            <div className="instruction-step">
                                <span className="step-number">1</span>
                                <p>{platform.instructions[0]} <a href={platform.link} target="_blank" rel="noopener noreferrer" className='text-blue-600 underline font-semibold'>{platform.link}</a> and Open/Start a conversation.</p>
                            </div>
                            <div className="">
                                <div className='flex gap-3'>
                                    <span className="step-number">2</span>
                                    <p> {platform.instructions[1]} </p>
                                </div>
                                <img
                                    src={platform.image}
                                    alt="Export button location"
                                    className="rounded-lg relative -bottom-1"
                                />
                            </div>
                            <div className="instruction-step">
                                <span className="step-number">3</span>
                                <p>Edit & Export as needed.</p>
                            </div>
                        </div>
                    </div>
                ))
            }

            <div className='fixed bottom-0 left-0 right-0 !p-3 bg-white border-t border-gray-200'>
                <button
                    onClick={handleOpenOptions}
                    className="popup-button mb-[-10px]"
                >
                    <span>Open ExportMyChat Editor</span>
                    <ArrowRight size={16} />
                </button>
                <div className="mb-2 flex justify-center gap-2 items-center text-xs text-gray-500">
                    <a href="https://exportmychat.kanhaiya.me/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Privacy Policy</a>
                    <span className='text-2xl leading-0.5 -mt-2'>.</span>
                    <a href="https://exportmychat.kanhaiya.me/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Terms & Conditions</a>
                </div>
            </div>
        </div>
    )
}

export default App
