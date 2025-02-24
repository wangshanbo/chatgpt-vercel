import { Conversation, Message, RecordCardItem } from '@interfaces';

export const getMaxIndex = (tabs: RecordCardItem[]) => {
  let max = tabs.length;
  tabs.forEach((tab) => {
    const index = Number(tab.key);
    if (!Number.isNaN(index) && Number(tab.key) >= max) {
      max = index + 1;
    }
  });
  return max;
};

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

export function downloadAs(text: string, filename: string) {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
  );
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export const isMatchMobile = () =>
  window.matchMedia('(max-width: 768px)').matches;

// surrounded by $$ or $
export const hasMath = (str: string) => /\$\$(.*?)\$\$|\$(.*?)\$/.test(str);

export const parseConversation = (text: string): Omit<Conversation, 'id'> => {
  const texts = text.split(/## (user|assistant):\n/).filter(Boolean);
  const messages: Message[] = [];
  texts.forEach((content, index) => {
    if (!['user', 'assistant'].includes(content)) {
      if (texts[index - 1] === 'assistant') {
        messages.push({
          role: 'assistant',
          content,
        });
      } else {
        messages.push({
          role: 'user',
          content,
        });
      }
    }
  });
  return {
    title: texts[0],
    messages,
    createdAt: Date.now(),
  };
};
