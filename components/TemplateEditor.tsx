'use client';

import { useState, useEffect } from 'react';

interface Template {
  _id: string;
  name: string;
  subject: string;
  handlebarsTemplate: string;
  variables: string[];
}

interface TemplateEditorProps {
  template: Template | null;
}

export default function TemplateEditor({ template }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [handlebarsTemplate, setHandlebarsTemplate] = useState(
    template?.handlebarsTemplate || ''
  );
  const [testVariables, setTestVariables] = useState('{}');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const renderPreview = () => {
    try {
      const variables = JSON.parse(testVariables);
      let renderedSubject = subject;
      let renderedTemplate = handlebarsTemplate;

      // Simple variable replacement (basic Handlebars support)
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        renderedSubject = renderedSubject.replace(regex, variables[key]);
        renderedTemplate = renderedTemplate.replace(regex, variables[key]);
      });

      setPreview(renderedTemplate);
      setError('');
    } catch {
      setError('Invalid JSON in test variables');
    }
  };

  useEffect(() => {
    renderPreview();
  }, [subject, handlebarsTemplate, testVariables]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = template ? 'PUT' : 'POST';
      const url = template
        ? `/api/templates/${template._id}`
        : '/api/templates';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name,
          subject,
          handlebarsTemplate,
        }),
      });

      if (response.ok) {
        alert('Template saved successfully!');
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
        />
        <input
          type="text"
          placeholder="Email Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Template (Handlebars)</label>
          <textarea
            value={handlebarsTemplate}
            onChange={(e) => setHandlebarsTemplate(e.target.value)}
            placeholder='Use {{firstName}}, {{email}}, etc.'
            className="w-full h-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-2">Test Variables (JSON)</label>
          <textarea
            value={testVariables}
            onChange={(e) => setTestVariables(e.target.value)}
            placeholder='{"firstName": "John", "email": "john@example.com"}'
            className="w-full h-32 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-blue-500"
          />
          <div className="mt-4">
            <label className="block text-gray-400 text-sm mb-2">Preview</label>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-h-32 overflow-auto">
              <p className="text-gray-300 whitespace-pre-wrap text-sm">{preview || 'Preview will appear here'}</p>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white font-semibold transition"
      >
        {saving ? 'Saving...' : 'Save Template'}
      </button>
    </div>
  );
}
