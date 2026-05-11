// Global test setup
// Stub environment variables so imports don't crash
process.env.STRIPE_SECRET_KEY = 'sk_test_stub'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_stub'
process.env.DATABASE_URL = 'postgres://stub'
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_stub'
