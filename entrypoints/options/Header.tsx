import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SiBuymeacoffee } from "react-icons/si";
import { FaGithub, FaStar } from "react-icons/fa6";
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSelector } from '@/components/LanguageSelector';
import { BuyMeCoffeeModal } from '@/components/BuyMeCoffeeModal';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tooltip } from '@radix-ui/react-tooltip';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';

export const Header = () => {
    const { t } = useTranslation();
    const [coffeeOpen, setCoffeeOpen] = useState(false);


    const handleGithubClick = () => {
        window.open('https://github.com/kanhaiyadav/ExportMyChat', '_blank');
    };

    const handleReview = () => {
        window.open('https://microsoftedge.microsoft.com/addons/detail/ExportMyChat/pdnpomlbcffgpmlbliebifojplnbhfkh', '_blank');
    };

    return (
        <>
            <div className='w-full flex items-center justify-between px-[50px] h-[65px] py-4 bg-primary'>
                <div className='flex items-center gap-2'>
                    <img src="/ExportMyChat_dark.png" alt="" className="h-[50px] drop-shadow-sm drop-shadow-black/40" />
                    <div className='mt-[-5px]'>
                        <h1 className='text-2xl text-[#3b2304] text-shadow-md font-bold'>{t('header.title')}</h1>
                        <p className='text-sm font-medium text-[#744915] text-shadow-sm mt-[-3px]'>{t('header.subtitle')}</p>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <LanguageSelector />
                    <ThemeToggle />

                    <TooltipProvider>
                        <ButtonGroup className='dark:bg-black/85 bg-black/80 rounded-md h-11'>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={handleReview}
                                        className="[&_svg:not([class*='size-'])]:size-5 h-11 text-gray-200 border-[#ffffff26]"
                                    >
                                        <FaStar className='h-5 w-5' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('header.reviewTooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="[&_svg:not([class*='size-'])]:size-[21px] h-11 text-gray-200 border-[#ffffff26]"
                                        onClick={() => setCoffeeOpen(true)}
                                    >
                                        <SiBuymeacoffee className='h-5 w-5' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('header.coffeeTooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={handleGithubClick}
                                        className="[&_svg:not([class*='size-'])]:size-[22px] h-11 text-gray-200 border-[#ffffff26]"
                                    >
                                        <FaGithub className='h-5 w-5' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('header.githubTooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </ButtonGroup>
                    </TooltipProvider>
                </div>
            </div>
            <BuyMeCoffeeModal open={coffeeOpen} onOpenChange={setCoffeeOpen} />
        </>
    );
};