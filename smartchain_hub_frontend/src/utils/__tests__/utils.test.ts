import { ZeroGStorageService, storageService } from '../storage';
import { CHAINS, ACTIVE_CHAIN, ACTIVE_CHAIN_KEY } from '../chains';
import { shortenAddress, getExplorerUrl } from '../blockchain';

// ── Storage ──────────────────────────────────────────────────────
describe('ZeroGStorageService', () => {
  it('returns singleton instance', () => {
    expect(storageService).toBe(ZeroGStorageService.getInstance());
  });

  it('uploadMetadata returns a non-empty root hash string', async () => {
    const hash = await storageService.uploadMetadata({ test: 'data', amount: 100 });
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('uploadWithProof returns rootHash, txHash, storageScanUrl', async () => {
    const result = await storageService.uploadWithProof({ user: 'test' });
    expect(result).toHaveProperty('rootHash');
    expect(result).toHaveProperty('txHash');
    expect(result).toHaveProperty('storageScanUrl');
  });
});

// ── Chains ───────────────────────────────────────────────────────
describe('chains config', () => {
  it('has all 4 chains defined', () => {
    expect(CHAINS.og_mainnet).toBeDefined();
    expect(CHAINS.og_newton).toBeDefined();
    expect(CHAINS.ethereum).toBeDefined();
    expect(CHAINS.sepolia).toBeDefined();
  });

  it('og_mainnet has correct chainId 16661', () => {
    expect(CHAINS.og_mainnet.chainId).toBe(16661);
  });

  it('og_mainnet is flagged as hackathon chain', () => {
    expect(CHAINS.og_mainnet.isHackathonChain).toBe(true);
  });

  it('ethereum is not a hackathon chain', () => {
    expect(CHAINS.ethereum.isHackathonChain).toBe(false);
  });

  it('ACTIVE_CHAIN defaults to og_mainnet', () => {
    expect(ACTIVE_CHAIN_KEY).toBe('og_mainnet');
    expect(ACTIVE_CHAIN.chainId).toBe(16661);
  });

  it('explorerTx generates correct URL', () => {
    const url = CHAINS.og_mainnet.explorerTx('0xabc123');
    expect(url).toBe('https://chainscan.0g.ai/tx/0xabc123');
  });
});

// ── Blockchain utils ─────────────────────────────────────────────
describe('blockchain utils', () => {
  it('shortenAddress formats correctly', () => {
    expect(shortenAddress('0x1234567890abcdef1234')).toBe('0x1234...1234');
  });

  it('getExplorerUrl uses active chain', () => {
    const url = getExplorerUrl('0xdeadbeef');
    expect(url).toContain('0xdeadbeef');
    expect(url).toContain('chainscan.0g.ai');
  });
});
