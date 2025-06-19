import React from 'react';
import './App.css';
import MainContainer from './MainContainer';

// PUBLIC_INTERFACE
function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> KAVIA AI
            </div>
            {/* Nav actions or settings could be added here */}
          </div>
        </div>
      </nav>

      <main>
        {/* MainContainer handles filters, info, and actions in modern layout */}
        <MainContainer />
      </main>
    </div>
  );
}

export default App;