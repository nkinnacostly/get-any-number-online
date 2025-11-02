/**
 * Quick Environment Variable Checker
 * Run this to verify your Flutterwave configuration
 * 
 * Usage: node check-env.js
 */

console.log('\n🔍 Checking Flutterwave Configuration...\n');

const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
const webhookSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

let hasErrors = false;

// Check Public Key
console.log('📌 Public Key (Frontend):');
if (publicKey) {
  console.log(`   ✅ Set: ${publicKey.substring(0, 20)}...`);
  
  if (!publicKey.startsWith('FLPUBK')) {
    console.log('   ⚠️  WARNING: Should start with "FLPUBK"');
    hasErrors = true;
  }
  
  if (publicKey.includes('TEST')) {
    console.log('   🧪 Environment: TEST MODE');
  } else {
    console.log('   🚀 Environment: LIVE MODE');
  }
} else {
  console.log('   ❌ NOT SET - This will cause button to not work!');
  console.log('   💡 Add: NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLPUBK_TEST-...');
  hasErrors = true;
}

console.log();

// Check Secret Key
console.log('🔐 Secret Key (Backend):');
if (secretKey) {
  console.log(`   ✅ Set: ${secretKey.substring(0, 20)}...`);
  
  if (!secretKey.startsWith('FLWSECK')) {
    console.log('   ⚠️  WARNING: Should start with "FLWSECK"');
    hasErrors = true;
  }
  
  if (secretKey.includes('TEST')) {
    console.log('   🧪 Environment: TEST MODE');
  } else {
    console.log('   🚀 Environment: LIVE MODE');
  }
} else {
  console.log('   ❌ NOT SET - Payment verification will fail!');
  console.log('   💡 Add: FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...');
  hasErrors = true;
}

console.log();

// Check Webhook Secret
console.log('🪝 Webhook Secret:');
if (webhookSecret) {
  console.log(`   ✅ Set: ${webhookSecret.substring(0, 10)}***`);
} else {
  console.log('   ⚠️  NOT SET - Webhooks will not be verified');
  console.log('   💡 Add: FLUTTERWAVE_WEBHOOK_SECRET=your-secret');
  console.log('   ℹ️  Optional: Only needed for webhook verification');
}

console.log();

// Check for mismatched environments
if (publicKey && secretKey) {
  const publicIsTest = publicKey.includes('TEST');
  const secretIsTest = secretKey.includes('TEST');
  
  if (publicIsTest !== secretIsTest) {
    console.log('❌ CRITICAL ERROR: Environment Mismatch!');
    console.log(`   Public key: ${publicIsTest ? 'TEST' : 'LIVE'}`);
    console.log(`   Secret key: ${secretIsTest ? 'TEST' : 'LIVE'}`);
    console.log('   💡 Both keys must be from the same environment!');
    hasErrors = true;
  }
}

console.log();

// Final status
if (hasErrors) {
  console.log('❌ Configuration has errors - fix them before deploying!');
  console.log();
  console.log('📖 See: PRODUCTION_DEPLOYMENT_CHECKLIST.md');
  console.log();
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set correctly!');
  console.log();
  
  if (publicKey && publicKey.includes('TEST')) {
    console.log('🧪 You are in TEST MODE - use test cards for payments');
    console.log();
    console.log('Test Card:');
    console.log('   Card: 5531886652142950');
    console.log('   CVV: 564');
    console.log('   Expiry: 09/32');
    console.log('   PIN: 3310');
    console.log('   OTP: 12345');
    console.log();
  } else if (publicKey) {
    console.log('🚀 You are in LIVE MODE - real payments will be processed!');
    console.log();
  }
  
  process.exit(0);
}

