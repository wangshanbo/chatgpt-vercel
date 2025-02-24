import { Conversation, GlobalConfig } from '@interfaces';
export const globalConfigLocalKey = 'GLOBAL_CONFIG_LOCAL';
export const localConversationKey = 'LOCAL_CONVERSATION';
export const supportedModels = [
  // 'gpt-4',
  // 'gpt-4-32k',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
] as const;

export type SupportedModel = (typeof supportedModels)[number];
export const defaultModel: SupportedModel = 'gpt-3.5-turbo-16k';
export const supportedImageModels = [
  'DALL-E',
  'Midjourney',
  'kandinsky-2',
] as const;
export type SupportedImageModels = (typeof supportedImageModels)[number];
export const defaultImageModel: SupportedImageModels = 'DALL-E';
export const supportedImgSizes = ['256x256', '512x512', '1024x1024'] as const;
export type SupportedImgSize = (typeof supportedImgSizes)[number];
export const supportedLanguages = [
  {
    label: '简体中文',
    value: 'zh',
  },
  {
    label: 'English',
    value: 'en',
  },
];

export const defaultGloablConfig: GlobalConfig = {
  password: '',
  openAIApiKey: '',
  model: defaultModel,
  imageModel: defaultImageModel,
  save: true,
  continuous: true,
  messagesCount: 4,
  temperature: 1,
  imagesCount: 1,
  imageSize: '256x256',
  lang: 'zh',
};

export const defaultConversation: Conversation = {
  id: '1',
  title: '',
  messages: [],
  mode: 'text',
  createdAt: Date.now(),
};
