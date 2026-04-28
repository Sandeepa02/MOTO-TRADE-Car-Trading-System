import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const underlineInput =
  'w-full bg-transparent border-0 border-b border-gray-300 py-2.5 px-0 text-gray-900 placeholder:text-gray-400 focus:border-primary-600 focus:ring-0 outline-none transition-colors';

const UserProfileForm = () => {
  const { user } = useAuth();
  const existing = JSON.parse(localStorage.getItem('userProfileDetails') || '{}');

  const [formData, setFormData] = useState({
    userId: existing.userId || user?.id || user?._id || '',
    name: existing.name || user?.name || '',
    address: existing.address || '',
    nationalIdCard: existing.nationalIdCard || '',
    email: existing.email || user?.email || '',
    birthday: existing.birthday || '',
    telephoneNumber: existing.telephoneNumber || '',
    profilePicture: existing.profilePicture || '',
    smsAlerts: existing.smsAlerts ?? false
  });
  const [message, setMessage] = useState('');
  const [lastLoginDisplay, setLastLoginDisplay] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('userProfileLastLogin');
    if (raw) {
      try {
        const d = new Date(JSON.parse(raw));
        setLastLoginDisplay(d.toLocaleString());
      } catch {
        setLastLoginDisplay('');
      }
    }
  }, []);

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem('userProfileDetails', JSON.stringify(formData));
    localStorage.setItem('userProfileLastLogin', JSON.stringify(new Date().toISOString()));
    setLastLoginDisplay(new Date().toLocaleString());
    setMessage('Profile details saved successfully.');
  };

  const heroSrc = formData.profilePicture || '';

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your profile</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage your personal information and preferences.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          <div className="relative h-52 sm:h-60 bg-gradient-to-br from-primary-100 to-primary-50">
            {heroSrc ? (
              <img src={heroSrc} alt="" className="h-full w-full object-cover object-top" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-primary-700/40 text-6xl font-extrabold">
                {(formData.name || user?.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-primary-800 shadow-md border border-gray-200 hover:bg-white">
              Change photo
              <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
            </label>
          </div>

          <form onSubmit={onSubmit} className="px-6 sm:px-10 pt-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-10">
              <h2 className="text-xl font-bold text-gray-900">My profile</h2>
              <div className="text-xs sm:text-sm text-gray-500 sm:text-right max-w-xs leading-relaxed">
                {lastLoginDisplay ? (
                  <>
                    <span className="font-medium text-gray-600">Last saved</span>
                    <br />
                    {lastLoginDisplay}
                  </>
                ) : (
                  <span>Save your profile to record a timestamp here.</span>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  className={underlineInput}
                  required
                />
              </div>
              <div>
                <label htmlFor="telephoneNumber" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  Telephone
                </label>
                <input
                  id="telephoneNumber"
                  type="tel"
                  name="telephoneNumber"
                  value={formData.telephoneNumber}
                  onChange={onInputChange}
                  className={underlineInput}
                  placeholder="+94 …"
                />
              </div>
            </div>

            <div className="mt-8">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={onInputChange}
                className={underlineInput}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8 mt-8">
              <div>
                <label htmlFor="userId" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  User ID
                </label>
                <input id="userId" type="text" name="userId" value={formData.userId} onChange={onInputChange} className={underlineInput} />
              </div>
              <div>
                <label htmlFor="nationalIdCard" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  National ID
                </label>
                <input
                  id="nationalIdCard"
                  type="text"
                  name="nationalIdCard"
                  value={formData.nationalIdCard}
                  onChange={onInputChange}
                  className={underlineInput}
                />
              </div>
            </div>

            <div className="mt-8">
              <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Address
              </label>
              <input id="address" type="text" name="address" value={formData.address} onChange={onInputChange} className={underlineInput} />
            </div>

            <div className="mt-8">
              <label htmlFor="birthday" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Birthday
              </label>
              <input id="birthday" type="date" name="birthday" value={formData.birthday} onChange={onInputChange} className={underlineInput} />
            </div>

            <div className="mt-10 flex items-center justify-between border-b border-gray-200 pb-4">
              <span className="text-sm font-medium text-gray-800">SMS alerts activation</span>
              <button
                type="button"
                role="switch"
                aria-checked={formData.smsAlerts}
                onClick={() => setFormData((p) => ({ ...p, smsAlerts: !p.smsAlerts }))}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  formData.smsAlerts ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    formData.smsAlerts ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {message ? <p className="mt-6 text-center text-sm font-medium text-emerald-700">{message}</p> : null}

            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                className="rounded-full bg-primary-700 px-12 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-800 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;
