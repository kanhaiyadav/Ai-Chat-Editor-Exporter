import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Clipboard, Key, ExternalLink, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoogleDriveTokenModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmitToken: (token: string) => Promise<boolean>;
    loading: boolean;
}

export function GoogleDriveTokenModal({
    open,
    onOpenChange,
    onSubmitToken,
    loading,
}: GoogleDriveTokenModalProps) {
    const [tokenInput, setTokenInput] = useState("");
    const { toast } = useToast();
    const { t } = useTranslation();

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setTokenInput(text);
            toast({
                title: t('googleDriveSync.toasts.tokenPasted') || "Token Pasted",
                description: t('googleDriveSync.toasts.tokenPastedDesc') || "Session token pasted from clipboard.",
            });
        } catch (e) {
            toast({
                title: t('googleDriveSync.toasts.clipboardError') || "Clipboard Access Denied",
                description: t('googleDriveSync.toasts.clipboardErrorDesc') || "Please paste the token manually.",
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async () => {
        if (!tokenInput.trim()) {
            toast({
                title: t('googleDriveSync.toasts.tokenRequired') || "Token Required",
                description: t('googleDriveSync.toasts.tokenRequiredDesc') || "Please paste the session token from the authentication page.",
                variant: "destructive",
            });
            return;
        }

        const success = await onSubmitToken(tokenInput.trim());
        if (success) {
            setTokenInput("");
            onOpenChange(false);
        }
    };

    const handleCancel = () => {
        setTokenInput("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        {t('googleDriveSync.enterToken') || 'Complete Authentication'}
                    </DialogTitle>
                    <DialogDescription>
                        {t('googleDriveSync.tokenModalDesc') || 'Paste the session token from the authentication page to complete setup.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Instructions */}
                    <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                        <p className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            {t('googleDriveSync.tokenSteps') || 'Follow these steps:'}
                        </p>
                        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0">1.</span>
                                <span className="flex-1">
                                    {t('googleDriveSync.tokenStep1') || 'Complete sign-in in the browser tab that opened'}
                                    <ExternalLink className="inline h-3 w-3 ml-1" />
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0">2.</span>
                                <span className="flex-1">
                                    {t('googleDriveSync.tokenStep2') || 'Copy the session token from the success page (auto-copied to clipboard)'}
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0">3.</span>
                                <span className="flex-1">
                                    {t('googleDriveSync.tokenStep3') || 'Paste the token below and click Submit'}
                                </span>
                            </li>
                        </ol>
                    </div>

                    {/* Token Input */}
                    <div className="space-y-2">
                        <Label htmlFor="session-token" className="text-base font-semibold">
                            {t('googleDriveSync.sessionToken') || 'Session Token'}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="session-token"
                                type="password"
                                placeholder={t('googleDriveSync.tokenPlaceholder') || 'Paste your session token here...'}
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !loading && tokenInput.trim()) {
                                        handleSubmit();
                                    }
                                }}
                                className="flex-1 font-mono text-sm"
                                disabled={loading}
                                autoFocus
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handlePaste}
                                disabled={loading}
                                title={t('googleDriveSync.pasteFromClipboard') || 'Paste from clipboard'}
                            >
                                <Clipboard className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('googleDriveSync.tokenHint') || 'The token should be a long string of characters automatically copied to your clipboard.'}
                        </p>
                    </div>

                    {/* Security Note */}
                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
                        <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {t('googleDriveSync.securityNote') || 'Security Note:'}
                            </span>{' '}
                            {t('googleDriveSync.securityNoteDesc') || 'This token is used to securely communicate with your backend server. Never share it with anyone.'}
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {t('dialog.cancel') || 'Cancel'}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !tokenInput.trim()}
                    >
                        {loading ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4" />
                                {t('googleDriveSync.validating') || 'Validating...'}
                            </>
                        ) : (
                            <>
                                <Key className="mr-2 h-4 w-4" />
                                {t('googleDriveSync.submitToken') || 'Submit Token'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
