import { SiBuymeacoffee } from "react-icons/si";
import { FaGithub } from "react-icons/fa6";
import { TbMessageReport } from "react-icons/tb";
import { ThemeToggle } from '@/components/ThemeToggle';

export const Header = () => {
    return (
        <div className='w-full flex items-center justify-between px-[50px] h-[65px] bg-primary'>
            <div className='flex items-center gap-4'>
                <img src="/chat2pdf2.png" alt="" className="h-[50px]" />
                <div className='mt-[-5px]'>
                    <h1 className='text-2xl text-black/75 font-bold'>AI Chat Editor & Exporter</h1>
                    <p className='text-sm font-medium text-black/60 mt-[-3px]'>Convert AI chats to PDF</p>
                </div>
            </div>
            <div className='flex items-center gap-6'>
                <ThemeToggle />
                <TbMessageReport className='text-black/80 cursor-pointer hover:text-black' size={26} />
                <FaGithub className='text-black/80 cursor-pointer hover:text-black' size={24} />
                <SiBuymeacoffee className='text-black/80 cursor-pointer hover:text-black' size={24} />
            </div>
        </div>
    );
};