import { render, screen } from '@testing-library/react';
import Header from '../Header';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3 } from '@/context/Web3Context';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('@/hooks/useAuth');
jest.mock('@/context/Web3Context');
jest.mock('@/utils/supabase', () => ({ supabase: { auth: { signOut: jest.fn() } } }));

const mockWeb3 = { isConnected: false, address: null, chainName: '', connectWallet: jest.fn(), disconnectWallet: jest.fn(), switchToOG: jest.fn() };

describe('Header', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ pathname: '/', push: jest.fn() });
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    (useWeb3 as jest.Mock).mockReturnValue(mockWeb3);
  });

  it('renders SmartChain Hub logo on public pages', () => {
    render(<Header />);
    expect(screen.getByText('SmartChain Hub')).toBeInTheDocument();
  });

  it('shows Get Started button on public pages', () => {
    render(<Header />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('shows Connect Wallet button in app when not connected', () => {
    (useRouter as jest.Mock).mockReturnValue({ pathname: '/dashboard', push: jest.fn() });
    (useAuth as jest.Mock).mockReturnValue({ user: { email: 'test@test.com' } });
    render(<Header />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('shows wallet address when connected', () => {
    (useRouter as jest.Mock).mockReturnValue({ pathname: '/dashboard', push: jest.fn() });
    (useAuth as jest.Mock).mockReturnValue({ user: { email: 'test@test.com' } });
    (useWeb3 as jest.Mock).mockReturnValue({ ...mockWeb3, isConnected: true, address: '0x1234567890abcdef', chainName: '0G Mainnet' });
    render(<Header />);
    expect(screen.getByText(/0x1234/)).toBeInTheDocument();
  });

  it('shows wrong chain warning when not on 0G', () => {
    (useRouter as jest.Mock).mockReturnValue({ pathname: '/dashboard', push: jest.fn() });
    (useAuth as jest.Mock).mockReturnValue({ user: { email: 'test@test.com' } });
    (useWeb3 as jest.Mock).mockReturnValue({ ...mockWeb3, isConnected: true, address: '0xabc', chainName: 'Ethereum' });
    render(<Header />);
    expect(screen.getByText(/Switch to 0G/)).toBeInTheDocument();
  });
});
