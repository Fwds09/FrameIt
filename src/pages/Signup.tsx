import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Image, Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';

type UsernameStatus = 'unchecked' | 'checking' | 'available' | 'taken';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('unchecked');
  const [usernameMessage, setUsernameMessage] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameStatus('unchecked');
    setUsernameMessage('');
    setError('');
  };

  const checkUsername = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setUsernameStatus('checking');
    setError('');

    try {
      const response = await api.get(`/auth/check-username/${username}`);

      if (response.data.available) {
        setUsernameStatus('available');
        setUsernameMessage('Username is available!');
      } else {
        setUsernameStatus('taken');
        setUsernameMessage('Username is already taken');
      }
    } catch (err: any) {
      setUsernameStatus('unchecked');
      setError(err.response?.data?.message || 'Error checking username');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (usernameStatus !== 'available') {
      setError('Please check username availability before registering');
      return;
    }

    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await signup(username, email, password);
      navigate('/collections');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl">
              <Image className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold ml-3 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              FrameIt
            </h1>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Create Account
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Choose a username"
                    disabled={loading}
                  />
                  {usernameStatus === 'available' && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                  {usernameStatus === 'taken' && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={checkUsername}
                  disabled={loading || usernameStatus === 'checking' || !username.trim()}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {usernameStatus === 'checking' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Check'
                  )}
                </button>
              </div>
              {usernameMessage && (
                <p className={`text-sm mt-1 ${usernameStatus === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                  {usernameMessage}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Choose a password (min. 6 characters)"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || usernameStatus !== 'available'}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Join FrameIt and start your collection today
        </p>
      </div>
    </div>
  );
}
