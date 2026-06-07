'use client';

import { useEffect, useState } from 'react';

interface Campaign {
  _id: string;
  name: string;
  templateId: string;
  status: 'draft' | 'sent' | 'failed';
  clientCount: number;
  sentCount: number;
  sentAt?: string;
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        setCampaigns(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading campaigns...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Email Campaigns</h1>
        <button
          onClick={() => setShowWizard(!showWizard)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition"
        >
          {showWizard ? 'Cancel' : '+ New Campaign'}
        </button>
      </div>

      {showWizard && (
        <CampaignWizard
          onComplete={() => {
            setShowWizard(false);
            fetchCampaigns();
          }}
        />
      )}

      <div className="grid grid-cols-1 gap-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign._id}
            className="bg-gray-800 p-6 rounded-lg border border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                <p className="text-gray-400 text-sm">
                  Status: <span className={campaign.status === 'sent' ? 'text-green-400' : 'text-yellow-400'}>{campaign.status}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Sent {campaign.sentCount} of {campaign.clientCount} emails
                </p>
              </div>
              <div className="text-gray-400 text-xs">
                {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : 'Not sent'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
    allClients: false,
    selectedClients: [] as string[],
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (step === 2) {
      fetchTemplates();
    }
    if (step === 3) {
      fetchClients();
    }
  }, [step]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        setTemplates(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        setClients(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          templateId: formData.templateId,
          clientList: formData.allClients
            ? clients.map((c) => c._id)
            : formData.selectedClients,
        }),
      });

      if (response.ok) {
        alert('Campaign sent successfully!');
        onComplete();
      } else {
        alert('Failed to send campaign');
      }
    } catch (error) {
      console.error('Send error:', error);
      alert('Error sending campaign');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <div className="mb-4 flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            disabled={s > step}
            className={`px-4 py-2 rounded-lg transition ${
              s === step ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
            } disabled:opacity-50`}
          >
            Step {s}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div>
          <label className="block text-gray-300 mb-2">Campaign Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4"
            placeholder="e.g., Monthly Newsletter"
          />
        </div>
      )}

      {step === 2 && (
        <div>
          <label className="block text-gray-300 mb-2">Select Template</label>
          <select
            value={formData.templateId}
            onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Choose a template...</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="block text-gray-300 mb-2">Select Clients</label>
          <label className="flex items-center text-gray-300 mb-4">
            <input
              type="checkbox"
              checked={formData.allClients}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allClients: e.target.checked,
                  selectedClients: e.target.checked ? [] : formData.selectedClients,
                })
              }
              className="mr-2"
            />
            Send to all clients
          </label>
          {!formData.allClients && (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {clients.map((c) => (
                <label key={c._id} className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.selectedClients.includes(c._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          selectedClients: [...formData.selectedClients, c._id],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          selectedClients: formData.selectedClients.filter(
                            (id) => id !== c._id
                          ),
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  {c.name} ({c.email})
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 className="text-white font-semibold mb-3">Review & Send</h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>Campaign: {formData.name}</p>
            <p>Recipients: {formData.allClients ? 'All clients' : `${formData.selectedClients.length} selected`}</p>
            <p>Template: {templates.find((t) => t._id === formData.templateId)?.name}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-6">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
          >
            Previous
          </button>
        )}
        {step < 4 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 1 && !formData.name) ||
              (step === 2 && !formData.templateId) ||
              (step === 3 && !formData.allClients && formData.selectedClients.length === 0)
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white transition"
          >
            Next
          </button>
        )}
        {step === 4 && (
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white transition"
          >
            {sending ? 'Sending...' : 'Send Campaign'}
          </button>
        )}
      </div>
    </div>
  );
}
