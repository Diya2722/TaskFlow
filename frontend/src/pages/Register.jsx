import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, CheckSquare } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm]         = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4
                    bg-gradient-to-br from-purple-50 via-white to-purple-100
                    dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/50 mb-3">
            <CheckSquare size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">TaskFlow</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Get organized, stay productive</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Create account</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input type="text" name="name" value={form.name} onChange={onChange} className="input" placeholder="Your name" required />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" name="email" value={form.email} onChange={onChange} className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={onChange} className="input pr-10" placeholder="At least 6 characters" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
