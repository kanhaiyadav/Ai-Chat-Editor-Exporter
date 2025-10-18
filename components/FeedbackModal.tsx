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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TbMessageReport } from "react-icons/tb"

interface FeedbackModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, onOpenChange }) => {
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        type: "",
        subject: "",
        message: "",
    })
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error">("idle")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Simulate API call - Replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Here you would typically send the data to your backend
            console.log("Feedback submitted:", formData)

            setSubmitStatus("success")

            // Reset form after success
            setTimeout(() => {
                setFormData({
                    name: "",
                    email: "",
                    type: "",
                    subject: "",
                    message: "",
                })
                setSubmitStatus("idle")
                onOpenChange(false)
            }, 2000)
        } catch (error) {
            console.error("Error submitting feedback:", error)
            setSubmitStatus("error")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleTypeChange = (value: string) => {
        setFormData(prev => ({ ...prev, type: value }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                            <TbMessageReport className="text-primary" size={24} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl !my-0">Send Feedback</DialogTitle>
                            <DialogDescription>
                                Help us improve by sharing your thoughts, bugs, or suggestions
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">
                            Feedback Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.type}
                            onValueChange={handleTypeChange}
                            required
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="w-full" id="type">
                                <SelectValue placeholder="Select feedback type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">🐛 Bug Report</SelectItem>
                                <SelectItem value="feature">✨ Feature Request</SelectItem>
                                <SelectItem value="improvement">🚀 Improvement</SelectItem>
                                <SelectItem value="question">❓ Question</SelectItem>
                                <SelectItem value="other">💬 Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">
                            Subject <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="subject"
                            name="subject"
                            placeholder="Brief summary of your feedback"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">
                            Message <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Please provide detailed information..."
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                            className="min-h-[120px] resize-none"
                        />
                    </div>

                    {submitStatus === "success" && (
                        <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                ✓ Feedback submitted successfully! Thank you for your input.
                            </p>
                        </div>
                    )}

                    {submitStatus === "error" && (
                        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                                ✗ Failed to submit feedback. Please try again.
                            </p>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Submitting...
                                </>
                            ) : (
                                "Submit Feedback"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
