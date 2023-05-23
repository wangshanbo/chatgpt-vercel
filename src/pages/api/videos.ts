/* eslint-disable no-console */
import type { APIRoute } from 'astro';
import { loadBalancer } from '@utils/server';
import { apiKeyStrategy, apiKeys, baseURL, config, password as pwd } from '.';
import Replicate from 'replicate';
export { config };
export const post: APIRoute = async ({ request }) => {
  if (!baseURL) {
    return new Response(JSON.stringify({ msg: 'No LOCAL_PROXY provided' }), {
      status: 400,
    });
  }

  const body = await request.json();
  const { prompt, password } = body;
  let { key } = body;
  key = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) {
    const next = loadBalancer(apiKeys, apiKeyStrategy);
    key = next();
  }

  if (pwd && password !== pwd) {
    return new Response(
      JSON.stringify({ msg: 'No password or wrong password' }),
      {
        status: 401,
      }
    );
  }

  if (!key) {
    return new Response(JSON.stringify({ msg: 'No API key provided' }), {
      status: 400,
    });
  }
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const model =
      'deforum/deforum_stable_diffusion:e22e77495f2fb83c34d5fae2ad8ab63c0a87b6b573b6208e1535b23b89ea66d6';

    const input = {
      animation_prompts: prompt,
    };
    const data = await replicate.run(model, { input });
    return new Response(
      JSON.stringify({
        data: data ? [data] : [],
      }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ msg: e?.message || e?.stack || e }), {
      status: 500,
    });
  }
};
