import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      if (
        location.state?.redirectTo === '/my-chats' &&
        location.state?.chatListing
      ) {
        navigate('/my-chats', {
          replace: true,
          state: { chatListing: location.state.chatListing }
        });
      } else if (location.state?.redirectTo) {
        navigate(location.state.redirectTo, {
          replace: true,
          state: location.state.redirectState || {}
        });
      } else {
        navigate('/');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f1f8]">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <section
          className="relative hidden lg:flex items-end p-10 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(8,17,35,0.58) 0%, rgba(6,12,24,0.82) 100%), url('https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1400&q=80')"
          }}
        >
          <div className="absolute top-8 left-8 text-white text-3xl font-extrabold tracking-tight">MOTO TRADE</div>
          <div className="relative z-10 max-w-lg text-white">
            <p className="text-xs font-semibold tracking-[0.24em] uppercase text-white/80">Precision engineered marketplace</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-tight">Start your journey with Moto Trade.</h1>
            <p className="mt-4 text-white/80 text-lg">Create your account and access listings, payments, and chat in one place.</p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-[0_15px_50px_rgba(29,19,61,0.09)] border border-gray-100 p-6 sm:p-8">
              <div>
                <h2 className="text-4xl font-extrabold text-gray-900">Create your account</h2>
                <p className="mt-2 text-gray-600">Join Moto Trade and start browsing your next vehicle today.</p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {error ? (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
                ) : null}

                <div>
                  <label htmlFor="name" className="label text-xs uppercase tracking-wide text-gray-500">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input h-12 rounded-xl border-gray-200 bg-gray-50"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="label text-xs uppercase tracking-wide text-gray-500">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input h-12 rounded-xl border-gray-200 bg-gray-50"
                    placeholder="name@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label text-xs uppercase tracking-wide text-gray-500">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input h-12 rounded-xl border-gray-200 bg-gray-50"
                    placeholder="Create a password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label text-xs uppercase tracking-wide text-gray-500">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input h-12 rounded-xl border-gray-200 bg-gray-50"
                    placeholder="Confirm your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 rounded-xl font-bold text-white bg-primary-700 hover:bg-primary-800 transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
