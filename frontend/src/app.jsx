import React, { useState } from 'react';
import { Send, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function AITaskAssistant() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    taskType: 'general',
    description: '',
    priority: 'medium'
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const taskTypes = [
    { value: 'general', label: 'General Task' },
    { value: 'analysis', label: 'Data Analysis' },
    { value: 'research', label: 'Research Request' },
    { value: 'content', label: 'Content Creation' },
    { value: 'email', label: 'Email Generation' },
    { value: 'document', label: 'Document Processing' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('Processing your request...');

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    if (file) {
      submitData.append('file', file);
    }

    try {
      // This will hit your webhook endpoint
      const response = await fetch('/api/webhook', {
        method: 'POST',
        body: submitData
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Task submitted successfully! Check your email for results.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          taskType: 'general',
          description: '',
          priority: 'medium'
        });
        setFile(null);
      } else {
        throw new Error('Failed to submit task');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to submit task. Please try again.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) { // 10MB limit
      setFile(selectedFile);
    } else {
      alert('File size must be under 10MB');
    }
  };

  const StatusIcon = () => {
    switch (status) {
      case 'loading': return <Clock className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Task Assistant</h1>
          <p className="text-lg text-gray-600">Submit any task and get AI-powered results delivered to your inbox</p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Task Type & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Type</label>
                <select
                  value={formData.taskType}
                  onChange={(e) => setFormData({...formData, taskType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {taskTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Task Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Task Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe what you need help with... Be as specific as possible for best results."
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Attach File (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".txt,.pdf,.doc,.docx,.csv,.json"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  Click to upload a file
                </label>
                <p className="text-sm text-gray-500 mt-1">Supports: TXT, PDF, DOC, CSV, JSON (max 10MB)</p>
                {file && (
                  <p className="text-sm text-green-600 mt-2">✓ {file.name}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {status === 'loading' ? 'Processing...' : 'Submit Task'}
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg flex items-center gap-2 ${
              status === 'success' ? 'bg-green-50 text-green-800' : 
              status === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'
            }`}>
              <StatusIcon />
              <span>{message}</span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center text-gray-600">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <div className="flex justify-center gap-8 text-sm">
            <span>1. Submit your task</span>
            <span>2. AI processes request</span>
            <span>3. Get results via email</span>
          </div>
        </div>
      </div>
    </div>
  );
}