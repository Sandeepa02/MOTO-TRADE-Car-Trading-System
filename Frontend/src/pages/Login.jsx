import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    const result = await login(formData.email, formData.password);
    
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
      } else if (result.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="page-tight">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <section
          className="relative hidden lg:flex items-end p-10 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(8,17,35,0.58) 0%, rgba(6,12,24,0.82) 100%), url('https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1400&q=80')"
          }}
        >
          <div className="relative z-10 max-w-lg text-white">
            <p className="text-xs font-semibold tracking-[0.24em] uppercase text-white/80">Precision engineered marketplace</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-tight">Drive your passion to its next destination.</h1>
            <p className="mt-4 text-white/80 text-lg">
              Join the sophisticated community of automotive collectors and traders worldwide.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="panel-soft rounded-3xl p-6 sm:p-8">
              <div>
                <h2 className="text-4xl font-extrabold text-gray-900">Welcome back</h2>
                <p className="mt-2 text-gray-600">Access your dashboard and active listings.</p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {error ? (
                  <div className="status-danger normal-case tracking-normal rounded-lg px-4 py-3 text-sm font-semibold">{error}</div>
                ) : null}

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
                    className="input h-12 rounded-xl bg-gray-50"
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
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input h-12 rounded-xl bg-gray-50"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-portal w-full h-12 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-600 text-center">
                New to Moto Trade?{' '}
                <Link to="/register" className="font-semibold text-primary-700 hover:text-primary-800">
                  Register your account
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
