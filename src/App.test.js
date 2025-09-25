import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => {
  const mockAxios = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn(() => 0),
        eject: jest.fn(),
      },
    },
  };

  mockAxios.default = mockAxios;
  return mockAxios;
});

jest.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    updateUsername: jest.fn(),
  }),
}));

test('muestra la pantalla de inicio de sesión cuando no hay usuario autenticado', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
});
