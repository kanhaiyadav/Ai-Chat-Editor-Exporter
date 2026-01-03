import * as React from "react"
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SiBuymeacoffee } from "react-icons/si"

interface BuyMeCoffeeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const BuyMeCoffeeModal: React.FC<BuyMeCoffeeModalProps> = ({
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();
    const [imageLoaded, setImageLoaded] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="">
                            <SiBuymeacoffee className="" size={25} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">{t('coffee.title')}</DialogTitle>
                            <DialogDescription className="text-xs">
                                {t('coffee.message')}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Ko-fi Button */}
                    <div className="flex justify-center">
                        <a
                            href="https://ko-fi.com/Y8Y01N7HT2"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block transition-transform hover:scale-105"
                        >
                            <img
                                height="36"
                                style={{ border: "0px", height: "36px" }}
                                src="https://storage.ko-fi.com/cdn/kofi2.png?v=6"
                                alt="Buy Me a Coffee at ko-fi.com"
                            />
                        </a>
                    </div>

                    {/* Google Pay QR Code */}
                    <div className="space-y-3">
                        <p className="text-center text-sm font-medium">Or scan with Google Pay</p>
                        <div className="flex justify-center">
                            <div className="p-4 rounded-lg bg-muted/50 border border-border relative min-h-[232px] flex items-center justify-center">
                                {/* Loading State */}
                                {!imageLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-[200px] h-[200px] rounded-md bg-gray-500/10 dark:bg-muted animate-pulse"></div>
                                    </div>
                                )}
                                {/* QR Code Image */}
                                <img
                                    src="https://github.com/kanhaiyadav/assests/blob/main/qr.gif?raw=true"
                                    alt="Google Pay QR Code"
                                    className={`w-[200px] h-[200px] rounded-md transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    onLoad={() => setImageLoaded(true)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Support Info */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">💝 {t('coffee.thankYou')}</strong>
                            <br />
                            {t('coffee.contribution')}
                        </p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            {t('dialog.close')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
