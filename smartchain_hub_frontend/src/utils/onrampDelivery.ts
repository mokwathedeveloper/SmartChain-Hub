/**
 * deliverA0GI — sends A0GI tokens to a wallet after payment confirmation.
 *
 * Uses the deployer wallet (STORAGE_PRIVATE_KEY) to send A0GI on 0G Galileo.
 * Called by both Stripe and Flutterwave webhooks after payment is confirmed.
 *
 * @param walletAddress  recipient 0G wallet address
 * @param a0giAmount     amount of A0GI to send (as string, e.g. "20.00")
 * @param txRef          payment reference for logging
 */
export async function deliverA0GI(
  walletAddress: string,
  a0giAmount: string,
  txRef: string
): Promise<{ txHash: string; explorerUrl: string }> {
  const { ethers } = await import("ethers");

  const privateKey = process.env.STORAGE_PRIVATE_KEY;
  if (!privateKey) throw new Error("STORAGE_PRIVATE_KEY not configured");

  const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
  const signer = new ethers.Wallet(privateKey, provider);

  // Check sender balance
  const balance = await provider.getBalance(signer.address);
  const amountWei = ethers.parseEther(a0giAmount);

  if (balance < amountWei) {
    throw new Error(
      `Insufficient A0GI balance. Have ${ethers.formatEther(balance)}, need ${a0giAmount}`
    );
  }

  const tx = await signer.sendTransaction({
    to: walletAddress,
    value: amountWei,
  });

  await tx.wait();

  return {
    txHash: tx.hash,
    explorerUrl: `https://scan-testnet.0g.ai/tx/${tx.hash}`,
  };
}

/**
 * logPayment — records a payment in Supabase for tracking.
 */
export async function logPayment(params: {
  walletAddress: string;
  amountUsd: number;
  a0giAmount: string;
  method: "stripe" | "mpesa" | "bank";
  txRef: string;
  status: "pending" | "completed" | "failed";
  txHash?: string;
}) {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.from("onramp_payments").insert([{
      wallet_address: params.walletAddress,
      amount_usd: params.amountUsd,
      a0gi_amount: params.a0giAmount,
      payment_method: params.method,
      tx_ref: params.txRef,
      status: params.status,
      tx_hash: params.txHash || null,
      created_at: new Date().toISOString(),
    }]);
  } catch {
    // Non-blocking — payment already processed
    console.warn("Failed to log payment to Supabase");
  }
}
