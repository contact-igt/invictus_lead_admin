import React from 'react';

const ScreenGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAllowed, setIsAllowed] = React.useState(window.innerWidth >= 600);

  React.useEffect(() => {
    const handleResize = () => {
      setIsAllowed(window.innerWidth >= 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAllowed) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#f4f6f8',
        color: '#333',
        fontFamily: 'sans-serif'
      }}>
        <img
          src="/assets/brand-logo.png"
          alt="Restricted Device"
          style={{ width: '150px', marginBottom: '1.5rem' }}
        />
        <h1 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: "rgb(42 177 129)" }}>
          Desktop Access Required
        </h1>
        <p style={{ fontSize: '1rem', maxWidth: '400px' }}>
          Our admin dashboard is designed for larger screens. <br />
          Please access this platform from a desktop or tablet for the best experience.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ScreenGuard;
