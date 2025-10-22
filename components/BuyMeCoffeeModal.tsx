import * as React from "react"
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="">
                            <SiBuymeacoffee className="" size={25} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Support Me</DialogTitle>
                            <DialogDescription className="mt-[-2px]">
                                Support the development of Chat2Pdf
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
                            <div className="p-4 rounded-lg bg-muted/50 border border-border">
                                {/* QR Code Image - Replace with your actual QR code */}
                                <img
                                    src="/qr.jpeg"
                                    alt="Google Pay QR Code"
                                    className="w-[200px] h-[200px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Support Info */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">💝 Thank you for your support!</strong>
                            <br />
                            Your contribution helps maintain and improve this extension. Every coffee counts!
                        </p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
