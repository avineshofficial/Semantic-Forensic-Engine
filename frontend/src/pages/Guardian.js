import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Guardian() {
    const { itemId } = useParams(); // The found_item_id
    const location = useLocation();
    const navigate = useNavigate();
    const imageUrl = location.state?.imageUrl;

    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState("");
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState(null);

    // Step 1: Generate Questions using Ollama Vision via Backend
    useEffect(() => {
        const getQuestions = async () => {
            try {
                const response = await axios.post('http://localhost:8000/guardian/generate-questions', {
                    image_url: imageUrl
                });
                
                // Ollama returns a string, we ensure it's treated as questions
                // If backend returns a string representation of a list, we parse it
                const qData = typeof response.data.questions === 'string' 
                    ? JSON.parse(response.data.questions.replace(/'/g, '"')) 
                    : response.data.questions;
                
                setQuestions(qData);
            } catch (error) {
                console.error("Guardian Error:", error);
                setQuestions(["Describe the most unique feature of this item.", "What is the brand or logo name?", "What color is the interior?"]);
            } finally {
                setLoading(false);
            }
        };

        if (imageUrl) getQuestions();
    }, [imageUrl]);

    // Step 2: Submit answers for AI Verification
    const handleSubmitAnswers = async () => {
        setVerifying(true);
        try {
            const response = await axios.post('http://localhost:8000/guardian/verify-answers', {
                image_url: imageUrl,
                answers: userAnswers
            });
            
            // Expected response: { score: 85, reason: "..." }
            const verificationData = typeof response.data.result === 'string' 
                ? JSON.parse(response.data.result.replace(/'/g, '"')) 
                : response.data.result;

            setResult(verificationData);
        } catch (error) {
            console.error("Verification Error:", error);
            alert("AI Engine failed to verify. Try again.");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return (
        <div className="main-content" style={{textAlign:'center', marginTop: '100px'}}>
            <div className="verifying-text">🧠 AI GUARDIAN IS ANALYZING IMAGE...</div>
            <p>Generating forensic challenge questions based on visual evidence.</p>
        </div>
    );

    return (
        <div className="main-content">
            <div className="card" style={{maxWidth: '700px', margin: '0 auto'}}>
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <span className="badge badge-pending">SECURE CHALLENGE SESSION</span>
                    <h1>Blind-Match Verification</h1>
                    <p>Answer based on your memory of the lost item.</p>
                </div>

                {/* Privacy Blurred Image */}
                <div style={{position: 'relative', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '30px'}}>
                    <img src={imageUrl} alt="Found Item" style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(25px)'}} />
                    <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontWeight: 'bold', background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '20px'}}>
                        VISUALS RESTRICTED
                    </div>
                </div>

                {!result ? (
                    <>
                        <div style={{backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
                            <h3 style={{marginBottom: '15px', color: 'var(--primary)'}}>AI Challenge Questions:</h3>
                            <ul style={{paddingLeft: '20px'}}>
                                {questions.map((q, i) => <li key={i} style={{marginBottom: '10px'}}><strong>{q}</strong></li>)}
                            </ul>
                        </div>

                        <div className="form-group">
                            <label>Your Detailed Answers</label>
                            <textarea 
                                rows="6" 
                                placeholder="Describe the brand, colors, and unique marks mentioned in the questions above..."
                                value={userAnswers}
                                onChange={(e) => setUserAnswers(e.target.value)}
                            ></textarea>
                        </div>

                        <button 
                            className="btn-primary" 
                            onClick={handleSubmitAnswers}
                            disabled={verifying || !userAnswers}
                        >
                            {verifying ? "AI ANALYZING ANSWERS..." : "Submit for Verification"}
                        </button>
                    </>
                ) : (
                    <div style={{textAlign: 'center', padding: '20px'}}>
                        <div style={{fontSize: '3rem'}}>{result.score >= 70 ? "✅" : "❌"}</div>
                        <h2>Verification Score: {result.score}%</h2>
                        <p style={{margin: '20px 0', color: '#666', fontStyle: 'italic'}}>{result.reason}</p>
                        
                        {result.score >= 70 ? (
                            <div style={{background: '#d4edda', padding: '20px', borderRadius: '8px', color: '#155724'}}>
                                <strong>CLAIM VERIFIED!</strong>
                                <p>You have successfully proven ownership. The finder's contact details are now unlocked.</p>
                                <button className="btn-primary" style={{marginTop: '15px', background: '#27ae60'}} onClick={() => navigate('/')}>View Recovery Details</button>
                            </div>
                        ) : (
                            <div style={{background: '#f8d7da', padding: '20px', borderRadius: '8px', color: '#721c24'}}>
                                <strong>CLAIM REJECTED</strong>
                                <p>Your answers do not match the visual evidence. This attempt has been logged for security.</p>
                                <button className="btn-primary" style={{marginTop: '15px'}} onClick={() => navigate('/')}>Return to Dashboard</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Guardian;