import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface UnsavedChangesDialogProps {
    open: boolean;
    onSave: () => void;
    onDiscard: () => void;
    onCancel: () => void;
}

export const UnsavedChangesDialog = ({
    open,
    onSave,
    onDiscard,
    onCancel,
}: UnsavedChangesDialogProps) => {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className='sm:max-w-[450px] bg-accent'>
                <DialogHeader>
                    <div className='flex items-center gap-2'>
                        <AlertTriangle className='h-5 w-5 text-yellow-500' />
                        <DialogTitle>{t('unsavedChatWarning.title')}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {t('unsavedChatWarning.message')}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className='flex items-center gap-2 w-full'>
                    <Button
                        variant='outline'
                        onClick={onCancel}
                    >
                        {t('unsavedChatWarning.cancel')}
                    </Button>
                    <Button
                        variant='destructive'
                        onClick={onDiscard}
                    >
                        {t('unsavedChatWarning.discard')}
                    </Button>
                    <Button
                        variant='default'
                        onClick={onSave}
                    >
                        {t('unsavedChatWarning.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
