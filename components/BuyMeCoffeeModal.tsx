import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SiBuymeacoffee } from "react-icons/si"
import { cn } from "@/lib/utils"

interface BuyMeCoffeeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const coffeeAmounts = [
    { value: 5, label: "☕ 1 Coffee", coffees: 1 },
    { value: 10, label: "☕☕ 2 Coffees", coffees: 2 },
    { value: 15, label: "☕☕☕ 3 Coffees", coffees: 3 },
    { value: 25, label: "☕☕☕☕☕ 5 Coffees", coffees: 5 },
]

export const BuyMeCoffeeModal: React.FC<BuyMeCoffeeModalProps> = ({
    open,
    onOpenChange,
}) => {
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        amount: 5,
        customAmount: "",
        message: "",
    })
    const [useCustomAmount, setUseCustomAmount] = React.useState(false)
    const [isProcessing, setIsProcessing] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessing(true)

        try {
            // Get the final amount
            const finalAmount = useCustomAmount
                ? parseFloat(formData.customAmount)
                : formData.amount

            // Simulate payment processing - Replace with actual payment gateway integration
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Here you would typically integrate with a payment provider like Stripe, PayPal, etc.
            console.log("Processing donation:", {
                ...formData,
                finalAmount,
            })

            // Redirect to payment gateway or show success message
            alert(`Thank you for supporting with $${finalAmount}! 🎉`)

            // Reset form
            setFormData({
                name: "",
                email: "",
                amount: 5,
                customAmount: "",
                message: "",
            })
            setUseCustomAmount(false)
            onOpenChange(false)
        } catch (error) {
            console.error("Error processing payment:", error)
            alert("Failed to process payment. Please try again.")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAmountSelect = (amount: number) => {
        setFormData(prev => ({ ...prev, amount }))
        setUseCustomAmount(false)
    }

    const handleCustomAmountFocus = () => {
        setUseCustomAmount(true)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                            <SiBuymeacoffee className="text-yellow-600 dark:text-yellow-500" size={24} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Buy Me a Coffee</DialogTitle>
                            <DialogDescription className="mt-1">
                                Support the development of AI Chat Editor & Exporter
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* Coffee Amount Selection */}
                    <div className="space-y-3">
                        <Label>
                            Select Amount <span className="text-destructive">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            {coffeeAmounts.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleAmountSelect(value)}
                                    disabled={isProcessing}
                                    className={cn(
                                        "p-4 rounded-lg border-2 transition-all text-left hover:border-primary/50",
                                        !useCustomAmount && formData.amount === value
                                            ? "border-primary bg-primary/5"
                                            : "border-border bg-card hover:bg-accent/50",
                                        isProcessing && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <div className="font-semibold text-base">{label}</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        ${value}.00
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="customAmount">Or Enter Custom Amount ($)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                            </span>
                            <Input
                                id="customAmount"
                                name="customAmount"
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="10.00"
                                value={formData.customAmount}
                                onChange={handleInputChange}
                                onFocus={handleCustomAmountFocus}
                                disabled={isProcessing}
                                className="pl-7"
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Your Information
                            </span>
                        </div>
                    </div>

                    {/* Name and Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                disabled={isProcessing}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                disabled={isProcessing}
                            />
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Leave a kind message or suggestion..."
                            value={formData.message}
                            onChange={handleInputChange}
                            disabled={isProcessing}
                            className="min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Support Info */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">💝 Thank you for your support!</strong>
                            <br />
                            Your contribution helps maintain and improve this extension. Every coffee counts!
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isProcessing}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                            {isProcessing ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <SiBuymeacoffee className="mr-2" size={16} />
                                    Support ${useCustomAmount ? formData.customAmount || "0.00" : formData.amount.toFixed(2)}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
