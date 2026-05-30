import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, LifeBuoy, Phone, Plus, Trash2, UserRound } from 'lucide-react';

const defaultForm = {
  name: '',
  phone: '',
  relationship: 'other',
  contact_type: 'personal_contact',
  location: '',
  notes: '',
  preferred_channel: 'call',
  is_primary: false,
};

const emergencyLines = [
  { name: '988 Suicide & Crisis Lifeline', phone: '988', note: '24/7 crisis support' },
  { name: 'SAMHSA National Helpline', phone: '1-800-662-4357', note: 'Treatment referral and support' },
];

export default function EmergencySupportSection() {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState(defaultForm);

  const loadContacts = async () => {
    const me = await base44.auth.me();
    setUser(me);
    const items = await base44.entities.SupportContact.filter({ user_email: me.email }, '-is_primary', 50);
    setContacts(items || []);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const saveContact = async (event) => {
    event.preventDefault();
    await base44.entities.SupportContact.create({ ...form, user_email: user.email });
    setForm(defaultForm);
    loadContacts();
  };

  const deleteContact = async (contact) => {
    await base44.entities.SupportContact.delete(contact.id);
    loadContacts();
  };

  return (
    <section id="support" className="card p-5 mb-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/15 border border-red-300/20">
          <AlertTriangle className="h-6 w-6 text-red-200" />
        </div>
        <div>
          <p className="section-label">Emergency support</p>
          <h2 className="text-2xl font-semibold">People and helplines to call</h2>
          <p className="text-sm text-slate-300 mt-1">Save trusted contacts and local support lines for moments when you feel overwhelmed.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {emergencyLines.map((line) => (
          <a key={line.phone} href={`tel:${line.phone}`} className="card-soft p-4 flex items-center justify-between gap-3 active:scale-[.98]">
            <div>
              <p className="font-bold text-white">{line.name}</p>
              <p className="text-xs text-slate-400">{line.note}</p>
            </div>
            <Phone className="h-5 w-5 text-emerald-300" />
          </a>
        ))}
      </div>

      <form onSubmit={saveContact} className="card-soft p-4 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold">
          <Plus className="h-4 w-4" /> Add a contact or local helpline
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select value={form.contact_type} onChange={(e) => setForm({ ...form, contact_type: e.target.value, relationship: e.target.value === 'personal_contact' ? 'other' : 'helpline' })}>
            <option value="personal_contact">Personal contact</option>
            <option value="local_helpline">Local helpline</option>
            <option value="crisis_helpline">Crisis helpline</option>
          </select>
          <input placeholder="City, county, or area served" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <textarea placeholder="Notes, like when to call or what they help with" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button type="submit" className="btn-primary w-full sm:w-auto">Save emergency contact</button>
      </form>

      <div className="space-y-3">
        {contacts.map((contact) => (
          <div key={contact.id} className="rounded-3xl border border-white/10 bg-white/6 p-4 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                {contact.contact_type === 'personal_contact' ? <UserRound className="h-5 w-5 text-blue-200" /> : <LifeBuoy className="h-5 w-5 text-amber-200" />}
              </div>
              <div>
                <p className="font-bold text-white">{contact.name}</p>
                <p className="text-xs text-slate-400">{contact.location || contact.relationship || 'Emergency support'} {contact.notes ? `• ${contact.notes}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={`tel:${contact.phone}`} className="h-11 w-11 rounded-2xl bg-emerald-400/15 border border-emerald-300/20 flex items-center justify-center">
                <Phone className="h-5 w-5 text-emerald-200" />
              </a>
              <button type="button" onClick={() => deleteContact(contact)} className="h-11 w-11 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center px-0 min-h-0">
                <Trash2 className="h-4 w-4 text-slate-300" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}