import React from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={{ 
                background: 'linear-gradient(135deg, #1a2a6c, #2c3e50)', 
                color: 'white', 
                padding: '100px 20px', 
                textAlign: 'center' 
            }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>
                    Lost & Found. <span style={{ color: 'var(--accent)' }}>Solved by AI.</span>
                </h1>
                <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 40px', opacity: '0.9' }}>
                    Using CLIP Semantic Matching and Ollama Vision Guardians to securely verify ownership 
                    without revealing privacy-sensitive item details.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <button className="btn-primary" onClick={() => navigate('/auth')} style={{ width: 'auto', padding: '15px 40px' }}>
                        Start Recovery
                    </button>
                    <button className="btn-primary" onClick={() => navigate('/auth')} style={{ width: 'auto', padding: '15px 40px', backgroundColor: 'transparent', border: '2px solid white' }}>
                        Agent Login
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <div className="main-content" style={{ marginTop: '60px' }}>
                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem' }}>👁️‍🗨️</div>
                        <h3>Semantic Scan</h3>
                        <p>Our CLIP model matches your text descriptions directly to image pixels.</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem' }}>🛡️</div>
                        <h3>Blind-Match</h3>
                        <p>Found items are blurred. Privacy is protected until ownership is proven.</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem' }}>🤖</div>
                        <h3>AI Guardian</h3>
                        <p>Ollama Vision generates custom challenge questions based on item visuals.</p>
                    </div>
                </div>
            </div>

            <footer style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '0.8rem' }}>
                SEMANTIC FORENSIC ENGINE © 2024 • AI-POWERED BLIND MATCH PROTOCOL
            </footer>
        </div>
    );
}

export default Landing;