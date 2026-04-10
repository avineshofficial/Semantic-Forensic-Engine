import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // The ID of the lost report passed from the submission page
    const lostItemId = location.state?.lostItemId;

    useEffect(() => {
        if (!lostItemId) {
            setLoading(false);
            return;
        }

        const fetchMatches = async () => {
            try {
                // Hits the FastAPI Forensic Engine
                const response = await axios.get(`http://localhost:8000/run-match/${lostItemId}`);
                setMatches(response.data.matches);
            } catch (err) {
                console.error("Match Engine Error:", err);
                setError("Failed to connect to the Forensic Engine. Ensure the Python Backend is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [lostItemId]);

    if (loading) {
        return (
            <div className="main-content" style={{ textAlign: 'center', marginTop: '100px' }}>
                <div className="verifying-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    🕵️‍♂️ AGENT SCANNING GLOBAL INVENTORY...
                </div>
                <p style={{ marginTop: '10px', color: '#666' }}>Running CLIP-ViT Semantic Analysis & Spatio-Temporal Plausibility Checks.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content">
                <div className="card" style={{ borderTopColor: 'red', textAlign: 'center' }}>
                    <h2>Engine Connection Error</h2>
                    <p>{error}</p>
                    <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>Return to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <header style={{ marginBottom: '30px' }}>
                <div className="badge badge-match">FORENSIC ANALYSIS COMPLETE</div>
                <h1 style={{ marginTop: '10px' }}>Potential Semantic Matches</h1>
                <p>The following items matched your description based on visual and logical parameters.</p>
            </header>

            {matches.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📁</div>
                    <h2>No High-Confidence Matches</h2>
                    <p>Our engine found no items that meet the minimum confidence threshold. You will be notified if a new match is found.</p>
                    <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px', width: '200px' }}>Return Home</button>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {matches.map((item) => (
                        <div key={item.found_item_id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            {/* Blind-Match Blurred Preview */}
                            <div style={{ position: 'relative', height: '200px', backgroundColor: '#000' }}>
                                <img 
                                    src={item.image_url} 
                                    alt="Evidence" 
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover', 
                                        filter: 'blur(15px) brightness(0.7)' 
                                    }} 
                                />
                                <div style={{ 
                                    position: 'absolute', top: '15px', right: '15px', 
                                    background: 'var(--primary)', color: 'white', 
                                    padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
                                }}>
                                    {item.confidence}% Combined Confidence
                                </div>
                            </div>

                            {/* Forensic Scores Section */}
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '15px' }}>
                                    <div style={{ color: '#555' }}>
                                        <strong>AI Similarity:</strong> {item.ai_score}%
                                    </div>
                                    <div style={{ color: item.logic_score > 50 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                                        <strong>Plausibility:</strong> {item.logic_score}%
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginBottom: '20px' }}>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>
                                        <strong>Found at:</strong> {item.location}
                                    </p>
                                    <p style={{ margin: '0', fontSize: '0.8rem', color: '#888' }}>
                                        <strong>Report ID:</strong> {item.found_item_id.substring(0, 12)}...
                                    </p>
                                </div>

                                <button 
                                    className="btn-primary" 
                                    onClick={() => navigate(`/guardian/${item.found_item_id}`, { state: { imageUrl: item.image_url } })}
                                >
                                    Initiate AI Guardian Verification
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Matches;