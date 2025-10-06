import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldQuestion, Loader2 } from 'lucide-react';

// This helper object maps the short question key to the full question text
const questionMap = {
  pet: "What was your first pet's name?",
  city: "In what city were you born?",
  mother: "What is your mother's maiden name?"
};

export default function ForgotPasswordScreen({ onResetSuccess, onBackClick }) {
  const [stage, setStage] = useState('verify'); // 'verify' or 'reset'
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setError('');
        setLoading(true);
        const result = await window.api.getSecurityQuestion();
        if (result.success && result.question) {
          setQuestion(questionMap[result.question]);
        } else {
          setError(result.message || "Could not load security question. Is it set up?");
        }
      } catch (err) {
        setError("An error occurred while fetching your security question.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadQuestion();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError("Please provide an answer.");
      return;
    }
    const result = await window.api.verifyAnswer(answer);
    if (result.success) {
      setError('');
      setStage('reset');
    } else {
      setError("That answer is incorrect. Please try again.");
    }
  };

  // Stage 2: Reset the password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // ✅ YAHAN BADLAV KIYA GAYA HAI (8 se 4)
    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const result = await window.api.resetPassword(newPassword);
    if (result.success) {
      alert("Password has been reset successfully!");
      onResetSuccess();
    } else {
      setError("Failed to reset password. Please try again.");
    }
  };

  if (stage === 'reset') {
    return (
      <div>
        <h2 className="text-3xl font-bold text-center text-white mb-8">Set New Password</h2>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required className="input-field" autoFocus />
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required className="input-field" />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" className="action-button primary-button w-full">Reset Password</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <ShieldQuestion className="mx-auto text-blue-400 mb-2" size={32} />
        <h2 className="text-3xl font-bold text-white">Password Recovery</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-2" />
          <p>Loading your question...</p>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-6">
          {question ? (
            <div>
              <label className="text-sm text-slate-300 mb-2 block">{question}</label>
              <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} required className="input-field" autoFocus />
            </div>
          ) : (
             <p className="text-center text-red-400">{error || "Something went wrong."}</p>
          )}
          
          {error && question && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onBackClick} className="action-button secondary-button">Back</button>
            <button type="submit" className="action-button primary-button" disabled={!question || loading}>Verify Answer</button>
          </div>
        </form>
      )}
    </div>
  );
}