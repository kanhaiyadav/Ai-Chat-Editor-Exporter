import { useState } from 'react';
import { SiBuymeacoffee } from "react-icons/si";
import { FaGithub, FaStar } from "react-icons/fa6";
import { TbMessageReport } from "react-icons/tb";
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FeedbackModal } from '@/components/FeedbackModal';
import { BuyMeCoffeeModal } from '@/components/BuyMeCoffeeModal';
import { useSidebar } from '@/components/ui/sidebar';

interface HeaderProps {
    onToggleSidebar: () => void;
}

export const Header = () => {
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [coffeeOpen, setCoffeeOpen] = useState(false);


    const handleGithubClick = () => {
        window.open('https://github.com/kanhaiyadav/Chat2Pdf', '_blank');
    };

    const handleReview = () => {
        window.open('https://microsoftedge.microsoft.com/addons/detail/chat2pdf/pdnpomlbcffgpmlbliebifojplnbhfkh', '_blank');
    };

    return (
        <>
            <div className='w-full flex items-center justify-between px-[50px] h-[65px] py-4 bg-primary'>
                <div className='flex items-center gap-2'>
                    <img src="/chat2pdf_dark.png" alt="" className="h-[50px] drop-shadow-sm drop-shadow-black/40" />
                    <div className='mt-[-5px]'>
                        <h1 className='text-2xl text-[#3b2304] text-shadow-md font-bold'>Chat2Pdf</h1>
                        <p className='text-sm font-medium text-[#744915] text-shadow-sm mt-[-3px]'>AI Chat Editor & Exporter</p>
                    </div>
                </div>
                <div className='flex items-center gap-6'>
                    <ThemeToggle />
                    <FaStar
                        className='text-black/80 cursor-pointer hover:text-black transition-colors'
                        size={24}
                        onClick={handleReview}
                        title="Write us a review"
                    />
                    <SiBuymeacoffee
                        className='text-black/80 cursor-pointer hover:text-black transition-colors'
                        size={24}
                        onClick={() => setCoffeeOpen(true)}
                        title="Buy Me a Coffee"
                    />
                    <FaGithub
                        className='text-black/80 cursor-pointer hover:text-black transition-colors'
                        size={24}
                        onClick={handleGithubClick}
                        title="Give us a star on GitHub"
                    />
                </div>
            </div>

            <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
            <BuyMeCoffeeModal open={coffeeOpen} onOpenChange={setCoffeeOpen} />
        </>
    );
};