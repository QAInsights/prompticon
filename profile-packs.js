(function initializeProfilePacks(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PrompticonProfilePacks = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const PROFILE_ORDER = ['general', 'developer', 'writing', 'student', 'support', 'recruiter', 'sales', 'quiz'];

  const DEFAULT_PROFILES = {
    general: {
      icon: '🌐', name: 'General',
      quickReplies: [
        { emoji: '👍', label: 'Yes', text: 'Yes' }, { emoji: '👎', label: 'No', text: 'No' },
        { emoji: '➡️', label: 'Continue', text: 'Continue' }, { emoji: '📝', label: 'More detail', text: 'Can you go into more detail?' },
        { emoji: '✂️', label: 'Shorter', text: 'Can you make that shorter?' }, { emoji: '🙏', label: 'Thanks', text: "Thanks, that's exactly what I needed." }
      ]
    },
    developer: {
      icon: '💻', name: 'Developer',
      quickReplies: [
        { emoji: '🐛', label: 'Debug', text: 'Can you help me debug this error and identify the root cause?' },
        { emoji: '⚡', label: 'Optimize', text: 'Can you optimize this code for better performance and efficiency?' },
        { emoji: '🧪', label: 'Add Tests', text: 'Write comprehensive unit tests with edge cases for this code.' },
        { emoji: '📖', label: 'Explain', text: 'Explain how this code works step-by-step.' },
        { emoji: '♻️', label: 'Refactor', text: 'Refactor this code following clean code and SOLID principles.' },
        { emoji: '📝', label: 'Docs', text: 'Add clear documentation and type annotations for this function/class.' }
      ]
    },
    writing: {
      icon: '✍️', name: 'Writer',
      quickReplies: [
        { emoji: '✨', label: 'Polish', text: 'Proofread and polish this text for clarity, tone, and grammar.' },
        { emoji: '👔', label: 'Professional', text: 'Rewrite this in a professional, executive corporate tone.' },
        { emoji: '✂️', label: 'Concise', text: 'Make this shorter and more concise while keeping all key points.' },
        { emoji: '💡', label: 'Expand', text: 'Elaborate and go into greater detail with concrete examples.' },
        { emoji: '🎯', label: 'Persuasive', text: 'Make this more compelling, engaging, and persuasive.' },
        { emoji: '🔤', label: 'ELI5', text: "Explain this in simple terms like I'm 5 years old." }
      ]
    },
    student: {
      icon: '🎓', name: 'Student',
      quickReplies: [
        { emoji: '🧠', label: 'Teach me', text: 'Teach me this concept step-by-step, starting with the fundamentals.' },
        { emoji: '❓', label: 'Quiz me', text: 'Quiz me on this topic one question at a time and wait for my answer.' },
        { emoji: '🗂️', label: 'Flashcards', text: 'Create concise flashcards from this material with question-and-answer pairs.' },
        { emoji: '📅', label: 'Study plan', text: 'Create a practical study plan for this topic with clear milestones.' },
        { emoji: '🔎', label: 'Examples', text: 'Give me concrete examples that make this easier to understand.' },
        { emoji: '📚', label: 'Sources', text: 'Suggest reliable sources I can use to learn more about this.' }
      ]
    },
    support: {
      icon: '🎧', name: 'Support Team',
      quickReplies: [
        { emoji: '👋', label: 'Acknowledge', text: 'Thanks for reaching out. I understand how disruptive this can be.' },
        { emoji: '🔍', label: 'Clarify', text: 'Could you share the exact steps, expected result, and what happened instead?' },
        { emoji: '🛠️', label: 'Troubleshoot', text: 'Please try these steps and let me know which result you get.' },
        { emoji: '📌', label: 'Escalate', text: 'I am escalating this to the appropriate team and will keep you updated.' },
        { emoji: '⏱️', label: 'Follow up', text: 'I wanted to follow up and check whether this is now resolved.' },
        { emoji: '✅', label: 'Resolved', text: 'I am glad this is resolved. Please let us know if anything else comes up.' }
      ]
    },
    recruiter: {
      icon: '🤝', name: 'Recruiter',
      quickReplies: [
        { emoji: '📋', label: 'Screening', text: 'Draft a concise screening question set for this role.' },
        { emoji: '🧑‍💼', label: 'Interview', text: 'Create structured interview questions and a scorecard for this candidate.' },
        { emoji: '📝', label: 'Summary', text: 'Summarize this candidate profile against the role requirements.' },
        { emoji: '✉️', label: 'Outreach', text: 'Write a personalized, professional candidate outreach message.' },
        { emoji: '🔁', label: 'Follow up', text: 'Write a concise follow-up message that is respectful of the candidate’s time.' },
        { emoji: '📆', label: 'Schedule', text: 'Write a clear interview scheduling message with next steps.' }
      ]
    },
    sales: {
      icon: '📈', name: 'Sales',
      quickReplies: [
        { emoji: '🧭', label: 'Discovery', text: 'Suggest thoughtful discovery questions for this prospect.' },
        { emoji: '💎', label: 'Value', text: 'Explain the most relevant value proposition for this prospect.' },
        { emoji: '🛡️', label: 'Objections', text: 'Help me respond to this objection with empathy and evidence.' },
        { emoji: '📄', label: 'Proposal', text: 'Draft a concise proposal outline tailored to this prospect.' },
        { emoji: '🔁', label: 'Follow up', text: 'Write a helpful follow-up that moves this conversation forward.' },
        { emoji: '➡️', label: 'Next step', text: 'Suggest a clear, low-friction next step for this deal.' }
      ]
    },
    quiz: {
      icon: '🔤', name: 'Quiz',
      quickReplies: [
        { emoji: '🇦', label: 'A', text: 'A' }, { emoji: '🇧', label: 'B', text: 'B' },
        { emoji: '🇨', label: 'C', text: 'C' }, { emoji: '🇩', label: 'D', text: 'D' },
        { emoji: '🇪', label: 'E', text: 'E' }
      ]
    }
  };

  return { PROFILE_ORDER, DEFAULT_PROFILES };
});
