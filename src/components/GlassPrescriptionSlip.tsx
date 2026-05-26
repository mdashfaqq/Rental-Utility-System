import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import AddCustomerModal from '@/components/AddCustomerModal';
import { API_BASE_URL } from '@/services/api';

const CUSTOMER_LOOKUP_URL = `${API_BASE_URL}/get-customer-by-phone.php`;
const RX_API_BASE = `${API_BASE_URL}/prescriptions`;

const axisClamp = (v) => {
  if (v === '' || v === null || v === undefined) return '';
  const n = Math.max(0, Math.min(180, parseInt(String(v), 10)));
  return Number.isNaN(n) ? '' : n;
};

export default function GlassPrescriptionSlip({ customerId: preboundCustomerId = 0, customerName: preboundCustomerName = '' }) {
  const [customerId, setCustomerId] = useState(preboundCustomerId || 0);
  const [customerName, setCustomerName] = useState(preboundCustomerName || '');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [lastFetchError, setLastFetchError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({ name: '', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState([]);
  const [errors, setErrors] = useState({}); // tracks missing mandatory fields

  const generateRefNo = () => `RX-${Date.now()}`;

  const [form, setForm] = useState({
    patient_name: preboundCustomerName || '',
    age: '',
    phone: '',
    ref_no: generateRefNo(),
    sex: 'Male',
    date_of_examination: new Date().toISOString().slice(0, 10),
    optometrist: '',
    r_dv_sph: '', r_dv_cyl: '', r_dv_axis: '', r_dv_vision: '',
    r_nv_sph: '', r_nv_cyl: '', r_nv_axis: '', r_nv_vision: '',
    l_dv_sph: '', l_dv_cyl: '', l_dv_axis: '', l_dv_vision: '',
    l_nv_sph: '', l_nv_cyl: '', l_nv_axis: '', l_nv_vision: '',
    chk_single_vision: false, chk_bifocal: false, chk_progressive: false,
    chk_plastic_cr39: false, chk_polycarbonate: false, chk_glass: false,
    chk_photochromatic: false, chk_transition: false, chk_hindex: false
  });

  const u = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: false })); // remove error highlight once edited
  };

  const fetchList = async (cid) => {
    setLastFetchError(null);
    if (!cid) return;
    try {
      const res = await fetch(`${RX_API_BASE}/list.php?customer_id=${encodeURIComponent(cid)}`);
      const raw = await res.text();
      if (!res.ok) {
        toast({ title: 'Failed to load prescriptions', description: `HTTP ${res.status} — ${raw.slice(0, 180)}`, variant: 'destructive' });
        return;
      }
      let data;
      try { data = JSON.parse(raw); } catch { return; }
      let rows = [];
      if (Array.isArray(data)) rows = data;
      else if (Array.isArray(data.prescriptions)) rows = data.prescriptions;
      else if (data.success && Array.isArray(data.data)) rows = data.data;
      setList(rows);
    } catch (err) {
      toast({ title: 'Failed to load prescriptions', description: String(err), variant: 'destructive' });
    }
  };

  const lookupByPhone = async (phone) => {
    if (!phone) {
      toast({ title: 'Enter phone to search', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch(`${CUSTOMER_LOOKUP_URL}?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (data?.success && data.customer) {
        const c = data.customer;
        setCustomerId(Number(c.id));
        setCustomerName(c.name || '');
        setForm((s) => ({
          ...s,
          patient_name: c.name || s.patient_name,
          phone: c.phone || phone,
          ref_no: generateRefNo(),
        }));
        toast({ title: 'Customer selected', description: `${c.name} (#${c.id})` });
        fetchList(Number(c.id)); // auto-fetch prescriptions
      } else {
        if (window.confirm('Customer not found. Add new customer?')) {
          setNewCustomerData((s) => ({ ...s, phone }));
          setShowAddModal(true);
        }
      }
    } catch {
      toast({ title: 'Lookup failed', description: 'Please try again', variant: 'destructive' });
    }
  };

  const handleModalClose = async () => {
    setShowAddModal(false);
    if (phoneSearch) await lookupByPhone(phoneSearch);
  };

  const handleSave = async () => {
    const requiredFields = [
      'patient_name', 'age', 'phone', 'ref_no', 'sex', 'date_of_examination', 'optometrist',
      'r_dv_sph', 'r_dv_cyl', 'r_dv_axis', 'r_dv_vision',
      'r_nv_sph', 'r_nv_cyl', 'r_nv_axis', 'r_nv_vision',
      'l_dv_sph', 'l_dv_cyl', 'l_dv_axis', 'l_dv_vision',
      'l_nv_sph', 'l_nv_cyl', 'l_nv_axis', 'l_nv_vision'
    ];
    let newErrors = {};
    let hasError = false;
    for (const f of requiredFields) {
      if (!form[f] && form[f] !== 0) {
        newErrors[f] = true;
        hasError = true;
      }
    }
    setErrors(newErrors);
    if (hasError) {
      toast({ title: 'Missing Required Fields', description: 'Please fill highlighted fields.', variant: 'destructive' });
      return;
    }
    if (!customerId) {
      toast({ title: 'Customer not selected', description: 'Search and select/add a customer first', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customer_id: customerId,
        ...form,
        r_dv_axis: Number(form.r_dv_axis),
        r_nv_axis: Number(form.r_nv_axis),
        l_dv_axis: Number(form.l_dv_axis),
        l_nv_axis: Number(form.l_nv_axis),
        chk_single_vision: form.chk_single_vision ? 1 : 0,
        chk_bifocal: form.chk_bifocal ? 1 : 0,
        chk_progressive: form.chk_progressive ? 1 : 0,
        chk_plastic_cr39: form.chk_plastic_cr39 ? 1 : 0,
        chk_polycarbonate: form.chk_polycarbonate ? 1 : 0,
        chk_glass: form.chk_glass ? 1 : 0,
        chk_photochromatic: form.chk_photochromatic ? 1 : 0,
        chk_transition: form.chk_transition ? 1 : 0,
        chk_hindex: form.chk_hindex ? 1 : 0,
      };
      const res = await fetch(`${RX_API_BASE}/create.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const rawText = await res.text();
      let data;
      try { data = JSON.parse(rawText); } catch { throw new Error(`Invalid JSON returned: ${rawText.slice(0, 200)}`); }
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      toast({ title: 'Prescription saved', description: `Ref: ${form.ref_no}` });
      fetchList(customerId);
    } catch (e) {
      toast({ title: 'Save failed', description: String(e.message || e), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `${errors[field] ? 'border-red-500 bg-red-50' : 'border-gray-300'} h-10 rounded-md px-3`;

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      {/* Phone Search */}
      <div className="bg-white shadow-sm border rounded-lg p-4 flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-600">Search by Phone</label>
          <Input
            value={phoneSearch}
            className="h-12 text-lg"
            onChange={(e) => setPhoneSearch(e.target.value)}
            placeholder="Enter customer's phone…"
          />
        </div>
        <Button onClick={() => lookupByPhone(phoneSearch)} className="bg-blue-600 hover:bg-blue-700 text-white">
          Find Customer
        </Button>
        {customerId ? (
          <span className="text-sm text-green-700">✅ Selected: <b>{customerName || form.patient_name}</b> (ID: {customerId})</span>
        ) : (
          <span className="text-sm text-amber-700">⚠ No customer selected</span>
        )}
      </div>

      {/* Form */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-gray-800">Glass Prescription</h2>
          <p className="text-sm text-gray-500">All fields marked with * are required</p>
        </div>

        {/* Patient details */}
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-6 gap-4">
          <div><label className="text-xs">Name*</label><Input value={form.patient_name} onChange={(e) => u('patient_name', e.target.value)} className={inputClass('patient_name')} /></div>
          <div><label className="text-xs">Age*</label><Input value={form.age} onChange={(e) => u('age', e.target.value)} className={inputClass('age')} /></div>
          <div><label className="text-xs">Phone*</label><Input value={form.phone} onChange={(e) => u('phone', e.target.value)} className={inputClass('phone')} /></div>
          <div><label className="text-xs">Ref No*</label><Input value={form.ref_no} readOnly className={`${inputClass('ref_no')} bg-gray-100 cursor-not-allowed`} /></div>
          <div>
            <label className="text-xs">Sex*</label>
            <div className={`flex gap-3 mt-1 border rounded-md px-3 ${errors.sex ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
              <label><input type="radio" checked={form.sex === 'Male'} onChange={() => u('sex', 'Male')} /> Male</label>
              <label><input type="radio" checked={form.sex === 'Female'} onChange={() => u('sex', 'Female')} /> Female</label>
            </div>
          </div>
          <div><label className="text-xs">Date of Examination*</label><Input type="date" value={form.date_of_examination} onChange={(e) => u('date_of_examination', e.target.value)} className={inputClass('date_of_examination')} /></div>
          <div className="md:col-span-2"><label className="text-xs">Optometrist*</label><Input value={form.optometrist} onChange={(e) => u('optometrist', e.target.value)} className={inputClass('optometrist')} /></div>
        </div>

        {/* Eye prescription tables */}
        <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {['RIGHT EYE (OD)', 'LEFT EYE (OS)'].map((title, idx) => {
            const prefix = idx === 0 ? 'r' : 'l';
            return (
              <section key={idx} className="border rounded-lg overflow-hidden">
                <div className="bg-rose-600 text-white px-4 py-2 font-semibold">{title}</div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr><th className="p-2 text-left">Type</th><th className="p-2">SPH*</th><th className="p-2">CYL*</th><th className="p-2">AXIS*</th><th className="p-2">VISION*</th></tr>
                  </thead>
                  <tbody>
                    {['dv', 'nv'].map((type) => (
                      <tr key={type} className="border-t">
                        <td className="p-2 font-medium uppercase">{type}</td>
                        <td className="p-2"><Input value={form[`${prefix}_${type}_sph`]} onChange={(e) => u(`${prefix}_${type}_sph`, e.target.value)} className={inputClass(`${prefix}_${type}_sph`)} /></td>
                        <td className="p-2"><Input value={form[`${prefix}_${type}_cyl`]} onChange={(e) => u(`${prefix}_${type}_cyl`, e.target.value)} className={inputClass(`${prefix}_${type}_cyl`)} /></td>
                        <td className="p-2"><Input type="number" value={form[`${prefix}_${type}_axis`]} onChange={(e) => u(`${prefix}_${type}_axis`, axisClamp(e.target.value))} className={inputClass(`${prefix}_${type}_axis`)} /></td>
                        <td className="p-2"><Input value={form[`${prefix}_${type}_vision`]} onChange={(e) => u(`${prefix}_${type}_vision`, e.target.value)} className={inputClass(`${prefix}_${type}_vision`)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })}
        </div>

        {/* Lens & Material */}
        <div className="px-6 pb-6">
          <div className="border rounded-lg">
            <div className="px-4 py-2 bg-slate-50 font-semibold">Lens & Material (Optional)</div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              {[
                ['chk_single_vision', 'Single Vision Lenses'],
                ['chk_bifocal', 'Bi-Focal Lenses'],
                ['chk_progressive', 'Progressive Lenses'],
                ['chk_plastic_cr39', 'Plastic (CR-39)'],
                ['chk_polycarbonate', 'Polycarbonate Lenses'],
                ['chk_glass', 'Glass'],
                ['chk_photochromatic', 'Photochromatic Lenses'],
                ['chk_transition', 'Transition Lenses'],
                ['chk_hindex', 'Hindex Lenses'],
              ].map(([k, label]) => (
                <label key={k} className="flex items-center gap-2">
                  <input type="checkbox" checked={!!form[k]} onChange={(e) => u(k, e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <Button onClick={handleSave} disabled={saving || !customerId} className="bg-green-600 hover:bg-green-700 text-white">
            {saving ? 'Saving…' : '💾 Save Prescription'}
          </Button>
        </div>

        {/* Previous prescriptions */}
        <div className="px-6 pb-6">
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 font-semibold">Previous Prescriptions</div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr><th className="p-2">Date</th><th className="p-2">Ref No</th><th className="p-2">Optometrist</th><th className="p-2">Right DV (S/C/A/V)</th><th className="p-2">Right NV (S/C/A/V)</th><th className="p-2">Left DV (S/C/A/V)</th><th className="p-2">Left NV (S/C/A/V)</th></tr>
              </thead>
              <tbody>
                {(!customerId || list.length === 0) && (
                  <tr><td colSpan={7} className="p-4 text-center text-gray-500">{customerId ? 'No records' : 'Select a customer'}</td></tr>
                )}
                {list.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{r.date_of_examination}</td>
                    <td className="p-2">{r.ref_no || '-'}</td>
                    <td className="p-2">{r.optometrist || '-'}</td>
                    <td className="p-2">{[r.r_dv_sph, r.r_dv_cyl, r.r_dv_axis, r.r_dv_vision].map(v => v ?? '-').join('/')}</td>
                    <td className="p-2">{[r.r_nv_sph, r.r_nv_cyl, r.r_nv_axis, r.r_nv_vision].map(v => v ?? '-').join('/')}</td>
                    <td className="p-2">{[r.l_dv_sph, r.l_dv_cyl, r.l_dv_axis, r.l_dv_vision].map(v => v ?? '-').join('/')}</td>
                    <td className="p-2">{[r.l_nv_sph, r.l_nv_cyl, r.l_nv_axis, r.l_nv_vision].map(v => v ?? '-').join('/')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddCustomerModal
        show={showAddModal}
        onClose={handleModalClose}
        customerPhone={phoneSearch}
        newCustomerData={newCustomerData}
        setNewCustomerData={setNewCustomerData}
        setCustomerName={(name) => {
          setCustomerName(name || '');
          setForm((s) => ({ ...s, patient_name: name || s.patient_name }));
        }}
      />
    </div>
  );
}
