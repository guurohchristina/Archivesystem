import React from 'react';

const Home = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: 'red' }}>Home Page Test</h1>
      <p>If you see this, Home component is working</p>
      <p>Window width: {window.innerWidth}px</p>
      <a href="/login">Go to Login</a>
    </div>
  );
};

export default Home;