import { useEffect, useState, useRef } from 'react';

import './Projects.css';

interface KickstarterProject {
  's.no': number;
  'percentage.funded': number;
  'amt.pledged': number;
  blurb?: string;
  by?: string;
  country?: string;
  currency?: string;
  'end.time'?: string;
  location?: string;
  'num.backers'?: string;
  state?: string;
  title?: string;
  type?: string;
  url?: string;
}

const PROJECT_URL =
  'https://raw.githubusercontent.com/saaslabsco/frontend-assignment/refs/heads/master/frontend-assignment.json';

const Projects = () => {
  //Refs
  const dataSize = useRef<number>(0);
  const entireData = useRef<KickstarterProject[] | null>(null);

  //States
  const [data, setData] = useState<KickstarterProject[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const givePaginatedData = (pageNumber: number = 0) => {
    console.log('givePaginatedData');
    const start = pageNumber * 5; // Start index (0-4 for group 0, 5-9 for group 1, etc.)
    console.log(start);
    const end = start + 4; // End index
    console.log(end);
    setHasMore(end < dataSize.current);
    return entireData.current?.slice(start, end + 1);
  };

  //Effects
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    (async () => {
      setLoading(true);
      try {
        const response = await fetch(PROJECT_URL, { signal });
        if (!response.ok) throw new Error('Something went wrong!! Please reload the page.');
        const data = await response.json();
        entireData.current = data;
        dataSize.current = data.length;
        console.log('Use Effect');
        const tmp = givePaginatedData(0);
        console.log(tmp);
        setData(tmp);
        setCurrentPageNumber(1);
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') console.log('Aborting Fetch request.');
          else setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      controller.abort();
    };
  }, []);

  //Event handlers
  const handlePrevClick = () => {
    if (currentPageNumber === 0) return;
    const tempPageNumber = currentPageNumber - 1;
    setCurrentPageNumber(tempPageNumber);
    setData(givePaginatedData(tempPageNumber));
  };

  const handleNextClick = () => {
    if (!hasMore) return;
    const tempPageNumber = currentPageNumber + 1;
    setCurrentPageNumber(tempPageNumber);
    setData(givePaginatedData(tempPageNumber));
  };

  return (
    <>
      {loading && <div className="loading">Loading</div>}
      {error && <div className="error">{error}</div>}
      {!error && !data && <div className="no-items">No items to display</div>}
      {!error && data && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Serial No.</th>
                <th>Percentage funded</th>
                <th>Amount pledged</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data) &&
                data.map((row) => (
                  <tr key={row?.['s.no']}>
                    <td>{row?.['s.no']}</td>
                    <td>{row?.['amt.pledged']}</td>
                    <td>{row?.['percentage.funded']}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="button-container">
            <button onClick={handlePrevClick} disabled={currentPageNumber === 1}>
              Prev
            </button>
            <button onClick={handleNextClick} disabled={!hasMore}>
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;
