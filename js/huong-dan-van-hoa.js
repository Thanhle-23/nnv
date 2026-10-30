/* HƯỚNG DẪN VĂN HÓA — chỉ phụ trách FAQ và câu hỏi demo.
 * Không can thiệp vào script.js hoặc content-pages.js.
 * Câu hỏi chỉ nằm trong localStorage, KHÔNG gửi đến máy chủ.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const normalize = value => String(value ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd').toLowerCase().trim();

  // 1. Tìm kiếm và lọc câu hỏi thường gặp.
  const search = document.getElementById('faq-search');
  const topic = document.getElementById('faq-filter');
  const items = [...document.querySelectorAll('#faq-list .faq-item')];
  const count = document.getElementById('faq-count');
  const empty = document.getElementById('faq-empty');

  function filterFaqs() {
    const keyword = normalize(search?.value);
    const category = topic?.value || 'all';
    let visible = 0;

    items.forEach(item => {
      const matchesTopic = category === 'all' || item.dataset.topic === category;
      const matchesText = !keyword || normalize(item.textContent).includes(keyword);
      const match = matchesTopic && matchesText;
      item.hidden = !match;
      if (!match) item.open = false;
      if (match) visible++;
    });

    if (count) count.textContent = `${visible} / ${items.length} câu trả lời`;
    if (empty) empty.hidden = visible !== 0;
  }

  search?.addEventListener('input', filterFaqs);
  search?.addEventListener('search', filterFaqs);
  topic?.addEventListener('change', filterFaqs);
  items.forEach(item => item.addEventListener('toggle', () => {
    if (item.open) items.forEach(other => { if (other !== item) other.open = false; });
  }));
  filterFaqs();

  // 2. Form câu hỏi mẫu — KHÔNG lưu thông tin liên hệ / KHÔNG gửi qua mạng.
  const STORAGE_KEY = 'nepVietDemoQuestions';
  const form = document.getElementById('question-form');
  const textarea = document.getElementById('question-text');
  const counter = document.getElementById('question-length');
  const status = document.getElementById('question-status');
  const box = document.getElementById('saved-questions');
  const list = document.getElementById('saved-question-list');
  const savedCount = document.getElementById('saved-count');
  const allowedTopics = ['Nghệ nhân', 'Sản phẩm & Nghề', 'Câu chuyện văn hóa', 'Trải nghiệm', 'Sử dụng website', 'Khác'];

  const safeRead = () => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(data)) return [];
      return data.filter(item => item && typeof item.question === 'string' && typeof item.id === 'string').slice(0, 20);
    } catch {
      return [];
    }
  };

  function updateCounter() {
    if (counter && textarea) counter.textContent = `${textarea.value.length}/500`;
  }

  function renderSaved() {
    if (!list || !box) return;
    const questions = safeRead();
    box.hidden = questions.length === 0;
    if (savedCount) savedCount.textContent = `${questions.length} câu`;
    list.replaceChildren();

    questions.forEach(item => {
      const li = document.createElement('li');
      const body = document.createElement('div');
      const label = document.createElement('span');
      const p = document.createElement('p');
      const del = document.createElement('button');

      label.className = 'saved-topic';
      label.textContent = allowedTopics.includes(item.topic) ? item.topic : 'Khác';
      p.textContent = item.question;
      del.type = 'button';
      del.className = 'remove-question';
      del.textContent = 'Xóa';
      del.setAttribute('aria-label', `Xóa câu hỏi: ${item.question.slice(0, 55)}`);
      del.addEventListener('click', () => {
        try {
          const remaining = safeRead().filter(q => q.id !== item.id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
          if (status) {
            status.textContent = 'Đã xóa câu hỏi trên trình duyệt này.';
            status.className = 'question-status';
          }
          renderSaved();
        } catch {
          if (status) {
            status.textContent = 'Không thể xóa dữ liệu trên trình duyệt hiện tại.';
            status.className = 'question-status is-error';
          }
        }
      });
      body.append(label, p);
      li.append(body, del);
      list.append(li);
    });
  }

  textarea?.addEventListener('input', updateCounter);
  updateCounter();
  renderSaved();

  form?.addEventListener('submit', event => {
    event.preventDefault();
    const question = textarea.value.trim();
    const topicValue = document.getElementById('question-topic')?.value || 'Khác';

    if (question.length < 10 || question.length > 500 || !allowedTopics.includes(topicValue)) {
      if (status) {
        status.textContent = 'M hãy nhập câu hỏi dài từ 10 đến 500 ký tự và chọn chủ đề phù hợp.';
        status.className = 'question-status is-error';
      }
      textarea.focus();
      return;
    }

    try {
      const questions = safeRead();
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      questions.unshift({ id, topic: topicValue, question, createdAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions.slice(0, 20)));
      form.reset();
      updateCounter();
      renderSaved();
      if (status) {
        status.textContent = 'Đã lưu câu hỏi demo trên trình duyệt này. Câu hỏi chưa được gửi đến người quản trị hoặc nghệ nhân.';
        status.className = 'question-status is-success';
      }
    } catch {
      if (status) {
        status.textContent = 'Không thể lưu câu hỏi trên trình duyệt này. Hãy kiểm tra quyền lưu trữ hoặc thử mở website bằng máy chủ cục bộ.';
        status.className = 'question-status is-error';
      }
    }
  });
});
