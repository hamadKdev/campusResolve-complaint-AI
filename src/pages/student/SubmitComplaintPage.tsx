import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../context/ToastContext';
import { formatApiErrorMessage } from '../../services/apiClient';
import { Complaint } from '../../types';
import {
  FileText,
  MapPin,
  Tag,
  AlignLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const COMMON_CATEGORIES = [
  'Electrical',
  'HVAC & Air Conditioning',
  'Plumbing',
  'IT & Network Infrastructure',
  'Classroom Projectors & Audio',
  'Laboratory Equipment',
  'Sanitation & Cleanliness',
  'Campus Security & Access',
  'Hostel Facilities',
  'Library Resources',
];

export const SubmitComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedCategory = category === 'Other' ? customCategory : category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanTitle = title.trim();
    const cleanCat = selectedCategory.trim();
    const cleanLoc = location.trim();
    const cleanDesc = description.trim();

    if (cleanTitle.length < 5 || cleanTitle.length > 150) {
      setValidationError('Title must be between 5 and 150 characters.');
      return;
    }
    if (cleanCat.length < 2 || cleanCat.length > 80) {
      setValidationError('Category must be between 2 and 80 characters.');
      return;
    }
    if (cleanLoc.length < 2 || cleanLoc.length > 200) {
      setValidationError('Location must be between 2 and 200 characters.');
      return;
    }
    if (cleanDesc.length < 10 || cleanDesc.length > 3000) {
      setValidationError('Description must be between 10 and 3000 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await complaintService.createComplaint({
        title: cleanTitle,
        category: cleanCat,
        location: cleanLoc,
        description: cleanDesc,
      });

      setCreatedComplaint(result);
      success(
        'Complaint Submitted Successfully',
        `Tracking ID: ${result.id ? result.id.slice(0, 8) : 'Generated'}`
      );
    } catch (err) {
      const msg = formatApiErrorMessage(err);
      setValidationError(msg);
      error('Submission Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#F1F5F9] tracking-tight">
          File Campus Complaint
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B4CC] mt-1">
          Submit details for autonomous agentic triage and verified department dispatch.
        </p>
      </div>

      {createdComplaint ? (
        /* Submission Success & Triage Display Screen */
        <div className="p-8 rounded-2xl bg-[#10182B] border border-cyan-500/30 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F1F5F9]">Complaint Successfully Filed!</h2>
              <p className="text-xs text-[#A7B4CC]">
                Recorded with initial status <span className="text-cyan-400 font-semibold">Submitted</span> and priority <span className="text-amber-400 font-semibold">Medium</span>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#151F35] border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#A7B4CC]">Complaint ID:</span>
              <span className="font-mono text-cyan-300 font-medium select-all tabular-nums">
                {createdComplaint.id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A7B4CC]">Title:</span>
              <span className="text-[#F1F5F9] font-medium">{createdComplaint.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A7B4CC]">Location:</span>
              <span className="text-[#F1F5F9]">{createdComplaint.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A7B4CC]">Category:</span>
              <span className="text-[#F1F5F9]">{createdComplaint.category}</span>
            </div>
          </div>

          {/* AI Triage Result card if returned by API */}
          {createdComplaint.triage ? (
            <div className="p-5 rounded-xl bg-violet-950/20 border border-violet-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-300">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>AI Agent Triage Results</span>
              </div>
              <p className="text-xs text-[#A7B4CC] leading-relaxed">
                {createdComplaint.triage.summary ||
                  `Suggested routing to ${createdComplaint.triage.department || 'designated department'} with priority ${createdComplaint.triage.priority || 'medium'}.`}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#151F35]/60 border border-white/5 text-xs text-[#A7B4CC] flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Ticket queued for background autonomous triage and admin department assignment.
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
            <button
              onClick={() => {
                setCreatedComplaint(null);
                setTitle('');
                setLocation('');
                setDescription('');
                setCategory('');
                setCustomCategory('');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#151F35] hover:bg-[#1C2942] text-[#F1F5F9] text-xs font-medium border border-white/10 transition-colors"
            >
              Submit Another Ticket
            </button>
            <button
              onClick={() => navigate(`/student/complaints/${createdComplaint.id}`)}
              className="px-5 py-2.5 rounded-xl bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
            >
              <span>View Case Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-[#10182B] border border-white/5 space-y-6">
          {validationError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>{validationError}</div>
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#A7B4CC] flex items-center gap-1.5" htmlFor="c-title">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Complaint Title</span>
              </label>
              <span className="text-[11px] text-[#A7B4CC] tabular-nums">
                {title.length}/150
              </span>
            </div>
            <input
              id="c-title"
              type="text"
              required
              minLength={5}
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Projector power failure in Lecture Hall 2"
              className="w-full bg-[#151F35] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="text-xs font-medium text-[#A7B4CC] mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-violet-400" />
              <span>Incident Category</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setCustomCategory('');
                  }}
                  className={`px-3 py-2 rounded-lg text-left text-xs transition-colors border ${
                    category === cat
                      ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 font-semibold'
                      : 'bg-[#151F35] border-white/5 text-[#A7B4CC] hover:text-[#F1F5F9] hover:bg-[#1C2942]'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCategory('Other')}
                className={`px-3 py-2 rounded-lg text-left text-xs transition-colors border ${
                  category === 'Other'
                    ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 font-semibold'
                    : 'bg-[#151F35] border-white/5 text-[#A7B4CC] hover:text-[#F1F5F9] hover:bg-[#1C2942]'
                }`}
              >
                Other Category...
              </button>
            </div>

            {category === 'Other' && (
              <div className="mt-3">
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Specify custom category (e.g. Laboratory Chemicals)"
                  className="w-full bg-[#151F35] border border-white/10 rounded-xl px-4 py-2 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400/60 transition-all"
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#A7B4CC] flex items-center gap-1.5" htmlFor="c-location">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Campus Location</span>
              </label>
              <span className="text-[11px] text-[#A7B4CC] tabular-nums">
                {location.length}/200
              </span>
            </div>
            <input
              id="c-location"
              type="text"
              required
              minLength={2}
              maxLength={200}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Science Block B, Room 304, North Wing"
              className="w-full bg-[#151F35] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#A7B4CC] flex items-center gap-1.5" htmlFor="c-desc">
                <AlignLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Detailed Description</span>
              </label>
              <span className="text-[11px] text-[#A7B4CC] tabular-nums">
                {description.length}/3000
              </span>
            </div>
            <textarea
              id="c-desc"
              required
              minLength={10}
              maxLength={3000}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide full details of the malfunction or issue. Include when you noticed it and if it creates a safety risk or disrupts classes."
              className="w-full bg-[#151F35] border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all resize-y"
            />
          </div>

          {/* Information Notice */}
          <div className="p-3.5 rounded-xl bg-[#151F35] border border-white/5 flex items-start gap-2.5 text-xs text-[#A7B4CC]">
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Once submitted, your complaint will be processed through our autonomous AI triage pipeline to determine urgency and recommend the appropriate department.
            </span>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => navigate('/student')}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#A7B4CC] hover:text-[#F1F5F9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title || !selectedCategory || !location || !description}
              className="px-6 py-2.5 rounded-xl bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] font-semibold text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20 inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-[#080D1B] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Complaint</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
