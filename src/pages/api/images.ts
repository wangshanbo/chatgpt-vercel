/* eslint-disable no-console */
import type { APIRoute } from 'astro';
import { loadBalancer } from '@utils/server';
// import { createOpenjourney } from 'replicate-fetch';
import { SupportedImageModels } from '@configs';
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
  const { prompt, model, size = '256x256', n = 1, password } = body;
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
    if ((model as SupportedImageModels) === 'Midjourney') {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      const model =
        'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf';
      const input = { prompt };
      const data = await replicate.run(model, { input });
      return new Response(
        JSON.stringify({
          data: data ? data : [],
        }),
        { status: 200 }
      );
    } else {
      const image = await fetch(`https://${baseURL}/v1/images/generations`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        method: 'POST',
        body: JSON.stringify({
          prompt,
          size,
          n,
        }),
      });
      const data = await image.json();
      const { data: images = [], error } = data;
      // error from openapi
      if (error?.message) {
        throw new Error(error.message);
      }

      return new Response(
        JSON.stringify({
          data: images?.map((img) => img.url) || [],
        }),
        { status: 200 }
      );
    }
  } catch (e) {
    return new Response(JSON.stringify({ msg: e?.message || e?.stack || e }), {
      status: 500,
    });
  }
};
