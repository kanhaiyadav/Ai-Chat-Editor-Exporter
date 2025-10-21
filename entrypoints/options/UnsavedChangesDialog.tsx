import { AlertTriangle } from 'lucide-react';
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
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className='sm:max-w-[450px]'>
                <DialogHeader>
                    <div className='flex items-center gap-2'>
                        <AlertTriangle className='h-5 w-5 text-yellow-500' />
                        <DialogTitle>Unsaved Changes</DialogTitle>
                    </div>
                    <DialogDescription>
                        You have unsaved changes to the current chat. Would you like to save them before switching?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className='gap-2 sm:gap-0'>
                    <Button
                        variant='outline'
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant='destructive'
                        onClick={onDiscard}
                    >
                        Discard Changes
                    </Button>
                    <Button
                        variant='default'
                        onClick={onSave}
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
