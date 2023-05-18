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
        'prompthero/openjourney:9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb';

      const input = {
        prompt,
        num_outputs: Number(n),
        width: Number(size.split('x')[0]),
        height: Number(size.split('x')[1]),
      };
      const data = await replicate.run(model, { input });
      return new Response(
        JSON.stringify({
          data: data ? data : [],
        }),
        { status: 200 }
      );
    } else if ((model as SupportedImageModels) === 'kandinsky-2') {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });
      const model =
        'ai-forever/kandinsky-2:601eea49d49003e6ea75a11527209c4f510a93e2112c969d548fbb45b9c4f19f';

      const input = {
        prompt,
        width: Number(size.split('x')[0]),
        height: Number(size.split('x')[1]),
      };
      const data = await replicate.run(model, { input });
      console.log(data);

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
