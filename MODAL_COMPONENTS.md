# Modal Components Documentation

## Overview

Two professional modal components have been added to the AI Chat Editor & Exporter extension:

1. **Feedback Modal** - For bug reports, feature requests, and general feedback
2. **Buy Me a Coffee Modal** - For supporting the extension development

## Components Created

### 1. Textarea Component (`components/ui/textarea.tsx`)

A reusable textarea component that follows the design system, with proper focus states, validation, and theme support.

### 2. Feedback Modal (`components/FeedbackModal.tsx`)

#### Features:

-   **Feedback Type Selection**: Bug Report, Feature Request, Improvement, Question, or Other
-   **Required Fields**: Name, Email, Type, Subject, and Message
-   **Form Validation**: Built-in HTML5 validation
-   **Success/Error States**: Visual feedback on submission
-   **Loading State**: Disabled form and loading indicator during submission
-   **Auto-close**: Modal closes automatically after successful submission

#### Fields:

-   **Name** (required): User's name
-   **Email** (required): User's email address
-   **Feedback Type** (required): Dropdown with emoji icons
-   **Subject** (required): Brief summary
-   **Message** (required): Detailed feedback (minimum 120px height)

#### Integration:

```tsx
import { FeedbackModal } from "@/components/FeedbackModal";

const [feedbackOpen, setFeedbackOpen] = useState(false);

<FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />;
```

### 3. Buy Me a Coffee Modal (`components/BuyMeCoffeeModal.tsx`)

#### Features:

-   **Preset Coffee Amounts**: 1, 2, 3, or 5 coffees ($5, $10, $15, $25)
-   **Custom Amount**: Users can enter any amount
-   **Interactive Selection**: Visual feedback for selected amount
-   **Optional Message**: Users can leave a thank you note
-   **Payment Processing State**: Loading indicator and disabled form during processing
-   **Professional Design**: Yellow accent color for coffee theme

#### Fields:

-   **Amount Selection** (required): Pre-defined or custom amount
-   **Name** (required): Supporter's name
-   **Email** (required): Supporter's email
-   **Message** (optional): Kind message or suggestion

#### Integration:

```tsx
import { BuyMeCoffeeModal } from "@/components/BuyMeCoffeeModal";

const [coffeeOpen, setCoffeeOpen] = useState(false);

<BuyMeCoffeeModal open={coffeeOpen} onOpenChange={setCoffeeOpen} />;
```

## Header Integration

The Header component has been updated to include:

-   Click handlers for the feedback and coffee icons
-   State management for modal open/close
-   Tooltips on hover
-   Smooth transition effects
-   GitHub link functionality

## Design Features

### Consistent UI Elements:

-   ✅ Follows existing design system
-   ✅ Matches current color scheme and theme
-   ✅ Responsive layout (mobile-friendly)
-   ✅ Dark mode support
-   ✅ Proper spacing and typography
-   ✅ Accessible form labels and inputs
-   ✅ Professional animations and transitions

### User Experience:

-   ✅ Clear visual hierarchy
-   ✅ Intuitive form layout
-   ✅ Helpful placeholder text
-   ✅ Required field indicators
-   ✅ Loading and success states
-   ✅ Easy-to-use amount selection
-   ✅ Keyboard navigation support

## Next Steps for Production

### For Feedback Modal:

1. Replace the simulated API call with actual backend endpoint:

```tsx
// In FeedbackModal.tsx, replace the setTimeout with:
const response = await fetch("YOUR_API_ENDPOINT/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
});
```

2. Consider adding:
    - File attachment support for screenshots
    - Browser/OS info auto-detection
    - Email notification service integration

### For Buy Me a Coffee Modal:

1. Integrate with payment gateway (Stripe, PayPal, Ko-fi, etc.):

```tsx
// Example with Stripe
import { loadStripe } from "@stripe/stripe-js";

const stripe = await loadStripe("YOUR_PUBLISHABLE_KEY");
const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: "price_id", quantity: 1 }],
    mode: "payment",
    successUrl: "YOUR_SUCCESS_URL",
    cancelUrl: "YOUR_CANCEL_URL",
});
```

2. Consider adding:
    - Recurring donation option
    - Different payment methods (PayPal, Venmo, etc.)
    - Thank you page/email
    - Supporter list or hall of fame

## Testing

To test the modals:

1. Click the feedback icon (message report) in the header
2. Fill out the form and submit
3. Click the coffee icon in the header
4. Select an amount and submit
5. Test validation by leaving required fields empty
6. Test custom amount input
7. Test dark mode appearance
8. Test responsive behavior on smaller screens

## Customization

You can customize colors, amounts, or styling by modifying:

-   Coffee amounts: Edit the `coffeeAmounts` array in `BuyMeCoffeeModal.tsx`
-   Feedback types: Edit the `SelectContent` options in `FeedbackModal.tsx`
-   Colors: Modify the className props or update the theme in `tailwind.css`
-   Layout: Adjust grid layouts and spacing in either modal component
