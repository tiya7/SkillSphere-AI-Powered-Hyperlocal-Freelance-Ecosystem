import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowRight, ArrowLeft, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { createGig, selectGigsCreating } from '../store/slices/gigsSlice';

const CATEGORIES = [
  { value: 'web_development', label: 'Web Development' },
  { value: 'mobile_development', label: 'Mobile Development' },
  { value: 'ui_ux_design', label: 'UI/UX Design' },
  { value: 'graphic_design', label: 'Graphic Design' },
  { value: 'content_writing', label: 'Content Writing' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'video_editing', label: 'Video Editing' },
  { value: 'photography', label: 'Photography' },
  { value: 'other', label: 'Other' },
];

const POPULAR_SKILLS = ['React', 'Node.js', 'Python', 'Figma', 'WordPress', 'Flutter', 'MongoDB', 'AWS', 'Photoshop', 'SEO', 'Content Writing', 'Data Analysis', 'SQL', 'Vite'];

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e4e4e7',
  borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#18181b',
};

const CreateGigPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isCreating = useSelector(selectGigsCreating);
  const [step, setStep] = useState(1);
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'web_development',
    skills: [],
    budgetType: 'fixed',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    location: { city: '', state: '', isRemote: true },
    milestones: [],
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.skills.includes(s) && form.skills.length < 15) {
      set('skills', [...form.skills, s]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => set('skills', form.skills.filter((s) => s !== skill));

  const addMilestone = () => {
    set('milestones', [...form.milestones, { title: '', description: '', amount: '', dueDate: '' }]);
  };

  const updateMilestone = (i, key, val) => {
    const updated = [...form.milestones];
    updated[i] = { ...updated[i], [key]: val };
    set('milestones', updated);
  };

  const removeMilestone = (i) => set('milestones', form.milestones.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.budgetMin || !form.budgetMax) {
      toast.error('Please fill all required fields');
      return;
    }
    if (Number(form.budgetMin) > Number(form.budgetMax)) {
      toast.error('Min budget cannot exceed max budget');
      return;
    }

    const payload = {
      ...form,
      budgetMin: Number(form.budgetMin),
      budgetMax: Number(form.budgetMax),
    };
    if (!payload.deadline) delete payload.deadline;
    payload.milestones = payload.milestones.map(m => {
      const sanitized = { ...m, amount: Number(m.amount) || 0 };
      if (!sanitized.dueDate) delete sanitized.dueDate;
      return sanitized;
    });

    const result = await dispatch(createGig(payload));

    if (createGig.fulfilled.match(result)) {
      toast.success('Gig posted successfully!');
      navigate('/gigs');
    } else {
      toast.error(result.payload || 'Failed to create gig');
    }
  };

  const steps = ['Basic Info', 'Skills & Budget', 'Location & Milestones'];

  return (
    <div className="page-enter" style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button onClick={() => navigate('/gigs')}
          style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #e4e4e7', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={16} color="#52525b" />
        </button>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 2 }}>Post a New Gig</h1>
          <p style={{ color: '#71717a', fontSize: 13 }}>Find the perfect freelancer for your project</p>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, background: 'white', borderRadius: 12, padding: 4, border: '1px solid #e4e4e7' }}>
        {steps.map((s, i) => (
          <button key={s} onClick={() => i + 1 < step && setStep(i + 1)}
            style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: i + 1 <= step ? 'pointer' : 'default',
              background: step === i + 1 ? '#0a2416' : 'transparent',
              color: step === i + 1 ? 'white' : step > i + 1 ? '#16a34a' : '#a1a1aa',
              fontSize: 13, fontWeight: 600, transition: 'all 0.2s', fontFamily: 'inherit',
            }}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid #e4e4e7' }}>

        {/* Step 1 - Basic Info */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 6 }}>
                Gig Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input placeholder="e.g. Build a React.js web application"
                value={form.title} onChange={(e) => set('title', e.target.value)}
                style={inputStyle} maxLength={150}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#e4e4e7'} />
              <p style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>{form.title.length}/150 characters</p>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 6 }}>
                Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea placeholder="Describe your project in detail. Any specific technologies?"
                value={form.description} onChange={(e) => set('description', e.target.value)}
                rows={6} maxLength={5000}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#e4e4e7'} />
              <p style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>{form.description.length}/5000 characters</p>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 6 }}>Category <span style={{ color: '#ef4444' }}>*</span></label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}
                style={{ ...inputStyle, background: 'white' }}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 6 }}>Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#e4e4e7'} />
            </div>
          </div>
        )}

        {/* Step 2 - Skills & Budget */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 6 }}>Required Skills</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input placeholder="Add a skill which is required..." value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                  style={{ ...inputStyle, flex: 1 }}
                  onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                  onBlur={(e) => e.target.style.borderColor = '#e4e4e7'} />
                <button onClick={() => addSkill(skillInput)}
                  style={{ padding: '11px 16px', background: '#0a2416', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>
                  Add
                </button>
              </div>

              {/* Popular skills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {POPULAR_SKILLS.filter((s) => !form.skills.includes(s)).map((s) => (
                  <button key={s} onClick={() => addSkill(s)}
                    style={{ padding: '4px 10px', borderRadius: 6, border: '1px dashed #d4d4d8', background: 'white', cursor: 'pointer', fontSize: 12, color: '#71717a', fontFamily: 'inherit' }}>
                    + {s}
                  </button>
                ))}
              </div>

              {/* Selected skills */}
              {form.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.skills.map((s) => (
                    <span key={s} style={{ padding: '5px 10px', borderRadius: 8, background: '#f0faf4', border: '1px solid #16a34a', fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {s}
                      <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#16a34a' }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Budget */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 8 }}>Budget Type</label>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                {['fixed', 'hourly'].map((type) => (
                  <button key={type} onClick={() => set('budgetType', type)}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${form.budgetType === type ? '#16a34a' : '#e4e4e7'}`, background: form.budgetType === type ? '#f0faf4' : 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: form.budgetType === type ? '#16a34a' : '#52525b', fontFamily: 'inherit' }}>
                    {type === 'fixed' ? '💰 Fixed Price' : '⏱️ Hourly Rate'}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 6 }}>Min Budget (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="number" placeholder="Rs. 5000" value={form.budgetMin}
                    onChange={(e) => set('budgetMin', e.target.value)} style={inputStyle} min="0"
                    onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                    onBlur={(e) => e.target.style.borderColor = '#e4e4e7'} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 6 }}>Max Budget (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="number" placeholder="Rs. 50000" value={form.budgetMax}
                    onChange={(e) => set('budgetMax', e.target.value)} style={inputStyle} min="0"
                    onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                    onBlur={(e) => e.target.style.borderColor = '#e4e4e7'} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Location & Milestones */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 10 }}>Work Location</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
                <input type="checkbox" checked={form.location.isRemote}
                  onChange={(e) => set('location', { ...form.location, isRemote: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#16a34a' }} />
                <span style={{ fontSize: 14, color: '#3f3f46', fontWeight: 500 }}>Remote work accepted</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>City</label>
                  <input placeholder="Pune" value={form.location.city}
                    onChange={(e) => set('location', { ...form.location, city: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                    onBlur={(e) => e.target.style.borderColor = '#e4e4e7'} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#3f3f46', display: 'block', marginBottom: 5 }}>State</label>
                  <input placeholder="Maharashtra" value={form.location.state}
                    onChange={(e) => set('location', { ...form.location, state: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                    onBlur={(e) => e.target.style.borderColor = '#e4e4e7'} />
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46' }}>Payment Milestones</label>
                  <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>Optional — break project into paid stages</p>
                </div>
                <button onClick={addMilestone}
                  style={{ padding: '8px 14px', background: '#f0faf4', border: '1.5px solid #16a34a', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#16a34a', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={14} /> Add Milestone
                </button>
              </div>

              {form.milestones.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', border: '1.5px dashed #e4e4e7', borderRadius: 10, color: '#a1a1aa', fontSize: 13 }}>
                  No milestones added. Click "Add Milestone" to create payment stages.
                </div>
              )}

              {form.milestones.map((m, i) => (
                <div key={i} style={{ background: '#fafafa', borderRadius: 10, padding: 16, marginBottom: 10, border: '1px solid #e4e4e7', position: 'relative' }}>
                  <button onClick={() => removeMilestone(i)}
                    style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa' }}>
                    <X size={16} />
                  </button>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 10 }}>Milestone {i + 1}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input placeholder="Title" value={m.title}
                      onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                      style={{ ...inputStyle, fontSize: 13 }} />
                    <input type="number" placeholder="Amount (₹)" value={m.amount}
                      onChange={(e) => updateMilestone(i, 'amount', e.target.value)}
                      style={{ ...inputStyle, fontSize: 13 }} />
                  </div>
                  <input placeholder="Description (optional)" value={m.description}
                    onChange={(e) => updateMilestone(i, 'description', e.target.value)}
                    style={{ ...inputStyle, fontSize: 13, marginTop: 8 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f4f4f5' }}>
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/gigs')}
            style={{ padding: '10px 20px', border: '1.5px solid #e4e4e7', borderRadius: 10, background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#52525b', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={15} /> {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button onClick={() => setStep(step + 1)}
              style={{ padding: '10px 24px', background: '#0a2416', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
              Next <ArrowRight size={15} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isCreating}
              style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0a2416, #16a34a)', color: 'white', border: 'none', borderRadius: 10, cursor: isCreating ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', opacity: isCreating ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase size={15} /> {isCreating ? 'Posting...' : 'Post Gig'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGigPage;
