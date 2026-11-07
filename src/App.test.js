import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the WooCommerce Product Manager', () => {
  render(<App />);
  expect(screen.getByText(/WooCommerce Product Manager/i)).toBeInTheDocument();
});
