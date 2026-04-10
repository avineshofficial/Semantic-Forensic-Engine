import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Guardian() {
    const { itemId } = useParams(); // This is the foundItemId from the URL
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get the image URL passed from the Matches page
    const imageUrl = location.state?.imageUrl;

    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState("");
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState(null);

    // Phase 1: Fetch Challenge Questions from Ollama via Backend
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!imageUrl) {
                alert("No image data found. Returning to dashboard.");
                navigate('/');
                return;
            }

            try {
                const response = await axios.post('http://localhost:8000/guardian/generate-questions', {
                    image_url: imageUrl
                });

                // Handle string or object response from Ollama
                let qData = response.data.questions;
                if (typeof qData === 'string') {
                    // Try to extract JSON array if Ollama returned it inside a string
                    try {
                        const jsonMatch = qData.match(/\[.*\]/s);
                        qData = jsonMatch ? JSON.parse(jsonMatch[0]) : [qData];
                    } catch (e) {
                        qData = [qData];
                    }
                }
                setQuestions(qData);
            } catch (error) {
                console.error("Guardian Questions Error:", error);
                // Fallback forensic questions if backend fails
                setQuestions([
                    "Describe any specific brand marks or logos visible.",
                    "What color is the hardware (zippers, buttons, etc.)?",
                    "Are there any unique scratches or damage?"
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [imageUrl, navigate]);

    // Phase 2: Submit answers to AI for verification
    const handleVerify = async () => {
        if (!userAnswers.trim()) return;
        setVerifying(true);

        try {
            const response = await axios.post('http://localhost:8000/guardian/verify-answers', {
                image_url: imageUrl,
                answers: userAnswers
            });

            // Parse response: { "score": 85, "reason": "..." }
            let evalResult = response.data.result;
            if (typeof evalResult === 'string') {
                try {
                    const jsonMatch = evalResult.match(/\{.*\}/s);
                    evalResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 0, reason: "Error parsing AI response" };
                } catch (e) {
                    evalResult = { score: 0, reason: "AI Format Error" };
                }
            }
            setResult(evalResult);
        } catch (error) {
            console.error("Verification Error:", error);
            alert("The AI Engine is currently busy. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="main-content" style={{ textAlign: 'center', marginTop: '100px' }}>
                <div className="verifying-text">🧠 AI GUARDIAN IS ANALYZING EVIDENCE...</div>
                <p>Generating specific questions based on the item's visual features.</p>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div className="badge badge-pending">SECURE VERIFICATION PROTOCOL</div>
                    <h1>Blind-Match Challenge</h1>
                    <p>Answer the questions below. Your responses will be compared against the visual data by our AI Guardian.</p>
                </div>

                {/* Secure Blurred Image */}
                <div style={{
                    width: '100%',
                    height: '220px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    marginBottom: '30px',
                    background: '#000'
                }}>
                    <img 
                        src={imageUrl} 
                        alt="Restricted"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(30px) grayscale(1)' }}
                    />
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        background: 'rgba(0,0,0,0.7)', color: 'white', padding: '12px 25px', borderRadius: '30px',
                        fontSize: '0.8rem', letterSpacing: '1px', border: '1px solid rgba(255,255,255,0.3)'
                    }}>
                        IDENTITY RESTRICTED UNTIL VERIFIED
                    </div>
                </div>

                {!result ? (
                    <>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '15px' }}>AI Challenge Questions:</h3>
                            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                                {questions.map((q, i) => (
                                    <li key={i}><strong>{q}</strong></li>
                                ))}
                            </ul>
                        </div>

                        <div className="form-group">
                            <label>Provide Detailed Answers</label>
                            <textarea 
                                rows="6"
                                placeholder="Example: The bag has a silver YKK zipper. There is a small coffee stain on the bottom left corner..."
                                value={userAnswers}
                                onChange={(e) => setUserAnswers(e.target.value)}
                            ></textarea>
                        </div>

                        <button 
                            className="btn-primary" 
                            onClick={handleVerify}
                            disabled={verifying || !userAnswers}
                        >
                            {verifying ? "AI AGENT ANALYZING..." : "Submit Verification Answers"}
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>
                            {result.score >= 70 ? "✅" : "⚠️"}
                        </div>
                        <h2 style={{ marginBottom: '10px' }}>Match Confidence: {result.score}%</h2>
                        <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '30px' }}>"{result.reason}"</p>

                        {result.score >= 70 ? (
                            <div style={{ background: '#d4edda', padding: '25px', borderRadius: '12px', color: '#155724', border: '1px solid #c3e6cb' }}>
                                <strong style={{ fontSize: '1.2rem' }}>CLAIM VERIFIED!</strong>
                                <p style={{ margin: '10px 0' }}>Your forensic answers match the visual identity of the item.</p>
                                <button 
                                    className="btn-primary" 
                                    style={{ marginTop: '15px', background: '#27ae60' }} 
                                    onClick={() => navigate('/success', { 
                                        state: { 
                                            foundItemId: itemId, 
                                            score: result.score 
                                        } 
                                    })}
                                >
                                    View Recovery Pass
                                </button>
                            </div>
                        ) : (
                            <div style={{ background: '#fff3cd', padding: '25px', borderRadius: '12px', color: '#856404', border: '1px solid #ffeeba' }}>
                                <strong>VERIFICATION INCOMPLETE</strong>
                                <p style={{ margin: '10px 0' }}>The details provided do not sufficiently match the image features. You may try again if you have more specific information.</p>
                                <button className="btn-primary" style={{ marginTop: '15px' }} onClick={() => setResult(null)}>
                                    Try Again
                                </button>
                                <button className="btn-primary" style={{ background: 'none', color: '#856404', marginTop: '10px' }} onClick={() => navigate('/')}>
                                    Return to Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Guardian;