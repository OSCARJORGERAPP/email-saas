'use client';

import { useEffect, useState } from 'react';
import TemplateEditor from '@/components/TemplateEditor';

interface Template {
  _id: string;
  name: string;
  subject: string;
  handlebarsTemplate: string;
  variables: string[];
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        setTemplates(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await fetch(`/api/templates/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchTemplates();
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading templates...</div>;
  }

  if (showEditor) {
    return (
      <>
        <button
          onClick={() => {
            setShowEditor(false);
            setSelectedTemplate(null);
            fetchTemplates();
          }}
          className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
        >
          ← Back
        </button>
        <TemplateEditor template={selectedTemplate} />
      </>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Email Templates</h1>
        <button
          onClick={() => {
            setSelectedTemplate(null);
            setShowEditor(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition"
        >
          + New Template
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <div
            key={template._id}
            className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                <p className="text-gray-400 text-sm">Subject: {template.subject}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowEditor(true);
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template._id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="text-gray-400 text-xs">
              Variables: {template.variables.join(', ') || 'None'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
