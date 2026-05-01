# On-Ramp Interface — Buy A0GI

## Payment Methods

### Credit / Debit Card (Stripe)
- Visa and Mastercard supported
- SSL-encrypted checkout via Stripe
- A0GI delivered automatically to connected wallet
- Success/cancel redirect handling

### M-Pesa (Flutterwave)
- STK Push to phone number
- Kenya mobile money (+254XXXXXXXXX)
- Real-time payment confirmation
- A0GI delivered on confirmation

## Access

1. Go to `/onramp`
2. Connect MetaMask **or** enter wallet address manually
3. Select payment method and amount
4. Complete payment — A0GI is sent to your wallet

## Interface Layout

```
┌─────────────────────────────────────────┐
│ Buy A0GI                                │
│ Pay with card or M-Pesa                 │
├─────────────────────────────────────────┤
│ [Credit Card]  [M-Pesa]                 │
├─────────────────────────────────────────┤
│ Amount: [$10] [$25] [$50] [$100]        │
│ ≈ 20 A0GI  ·  Rate: 1 USD = 2 A0GI     │
├─────────────────────────────────────────┤
│ Phone: +254712345678  (M-Pesa only)     │
├─────────────────────────────────────────┤
│ A0GI will be sent to:                   │
│ 0x604c...451F  ·  0G Galileo Testnet    │
├─────────────────────────────────────────┤
│ [Pay $10 with Card →]                   │
│ Secured by Stripe · SSL encrypted       │
└─────────────────────────────────────────┘
```

## API Routes

| Route | Purpose |
|---|---|
| `POST /api/onramp/stripe` | Create Stripe Checkout session |
| `POST /api/onramp/mpesa` | Trigger Flutterwave M-Pesa STK push |

## Required Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
NEXT_PUBLIC_APP_URL=https://smartchainhubfrontend.vercel.app
```

## Exchange Rate

- **1 USD = 2 A0GI** (fixed demo rate)
- Min: $1 · Max: $1,000 per transaction
