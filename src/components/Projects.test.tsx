import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Projects from './Projects';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock API response
const mockData = [
  { 's.no': 1, 'percentage.funded': 50, 'amt.pledged': 1000 },
  { 's.no': 2, 'percentage.funded': 60, 'amt.pledged': 2000 },
  { 's.no': 3, 'percentage.funded': 70, 'amt.pledged': 3000 },
  { 's.no': 4, 'percentage.funded': 80, 'amt.pledged': 4000 },
  { 's.no': 5, 'percentage.funded': 90, 'amt.pledged': 5000 },
  { 's.no': 6, 'percentage.funded': 100, 'amt.pledged': 6000 },
];

// Mock API server
const server = setupServer(
  http.get(
    'https://raw.githubusercontent.com/saaslabsco/frontend-assignment/refs/heads/master/frontend-assignment.json',
    () => {
      return HttpResponse.json(mockData);
    }
  )
);

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Disable API mocking after tests
afterAll(() => server.close());

describe('Projects Component', () => {
  test('renders loading state initially', () => {
    render(<Projects />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders error state on fetch failure', async () => {
    // Mock a failed fetch request
    server.use(
      http.get(
        'https://raw.githubusercontent.com/saaslabsco/frontend-assignment/refs/heads/master/frontend-assignment.json',
        () => {
          return new HttpResponse(null, { status: 500 });
        }
      )
    );

    render(<Projects />);
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  test('renders data in the table after successful fetch', async () => {
    render(<Projects />);
    await waitFor(() => {
      expect(screen.getByText(/50%/i)).toBeInTheDocument(); // Check for percentage
      expect(screen.getByText(/1000/i)).toBeInTheDocument(); // Check for amount pledged
    });
  });

  test('renders "No items to display" if data is empty', async () => {
    // Mock an empty response
    server.use(
      http.get(
        'https://raw.githubusercontent.com/saaslabsco/frontend-assignment/refs/heads/master/frontend-assignment.json',
        () => {
          return HttpResponse.json([]);
        }
      )
    );

    render(<Projects />);
    await waitFor(() => {
      expect(screen.getByText(/no items to display/i)).toBeInTheDocument();
    });
  });

  test('pagination buttons work correctly', async () => {
    render(<Projects />);
    await waitFor(() => {
      expect(screen.getByText(/50%/i)).toBeInTheDocument(); // First page data
    });

    // Click "Next" button to go to the second page
    fireEvent.click(screen.getByText(/next/i));
    await waitFor(() => {
      expect(screen.getByText(/100%/i)).toBeInTheDocument(); // Second page data
    });

    // Click "Prev" button to go back to the first page
    fireEvent.click(screen.getByText(/prev/i));
    await waitFor(() => {
      expect(screen.getByText(/50%/i)).toBeInTheDocument(); // First page data
    });
  });

  test('disables "Prev" button on the first page', async () => {
    render(<Projects />);
    await waitFor(() => {
      expect(screen.getByText(/50%/i)).toBeInTheDocument(); // First page data
    });

    const prevButton = screen.getByText(/prev/i);
    expect(prevButton).toBeDisabled();
  });

  test('disables "Next" button on the last page', async () => {
    render(<Projects />);
    await waitFor(() => {
      expect(screen.getByText(/50%/i)).toBeInTheDocument(); // First page data
    });

    // Click "Next" button twice to go to the last page
    fireEvent.click(screen.getByText(/next/i));
    fireEvent.click(screen.getByText(/next/i));
    await waitFor(() => {
      expect(screen.getByText(/100%/i)).toBeInTheDocument(); // Last page data
    });

    const nextButton = screen.getByText(/next/i);
    expect(nextButton).toBeDisabled();
  });
});
