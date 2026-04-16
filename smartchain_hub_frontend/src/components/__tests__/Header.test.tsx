import { render, screen } from '@testing-library/react';
import Header from '../Header';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3 } from '@/context/Web3Context';

// Mock the hooks
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/hooks/useAuth');
jest.mock('@/context/Web3Context');

describe('Header Component', () => {
  it('renders the logo correctly', () => {
    (useRouter as jest.mock).mockReturnValue({ pathname: '/' });
    (useAuth as jest.mock).mockReturnValue({ user: null });
    (useWeb3 as jest.mock).mockReturnValue({ isConnected: false });

    render(<Header />);
    expect(screen.getByText('SmartChain Hub')).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    (useRouter as jest.mock).mockReturnValue({ pathname: '/' });
    (useAuth as jest.mock).mockReturnValue({ user: null });
    (useWeb3 as jest.mock).mockReturnValue({ isConnected: false });

    render(<Header />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
