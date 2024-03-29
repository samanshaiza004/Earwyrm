# Elysia with Bun runtime

## Why use bun and Elysia
[Performance](https://elysiajs.com/at-glance.html#performance)

Building on Bun and extensive optimization like Static Code Analysis allows Elysia to generate optimized code on the fly.

Elysia can outperform most of the web frameworks available today[[1\]](https://elysiajs.com/at-glance.html#ref-1), and even match the performance of Golang and Rust framework[[2\]](https://elysiajs.com/at-glance.html#ref-2).

| Framework     | Runtime | Average     | Plain Text | Dynamic Parameters | JSON Body  |
| :------------ | :------ | :---------- | :--------- | :----------------- | :--------- |
| bun           | bun     | 262,660.433 | 326,375.76 | 237,083.18         | 224,522.36 |
| elysia        | bun     | 255,574.717 | 313,073.64 | 241,891.57         | 211,758.94 |
| hyper-express | node    | 234,395.837 | 311,775.43 | 249,675            | 141,737.08 |
| hono          | bun     | 203,937.883 | 239,229.82 | 201,663.43         | 170,920.4  |
| h3            | node    | 96,515.027  | 114,971.87 | 87,935.94          | 86,637.27  |
| oak           | deno    | 46,569.853  | 55,174.24  | 48,260.36          | 36,274.96  |
| fastify       | bun     | 65,897.043  | 92,856.71  | 81,604.66          | 23,229.76  |
| fastify       | node    | 60,322.413  | 71,150.57  | 62,060.26          | 47,756.41  |
| koa           | node    | 39,594.14   | 46,219.64  | 40,961.72          | 31,601.06  |
| express       | bun     | 29,715.537  | 39,455.46  | 34,700.85          | 14,990.3   |
| express       | node    | 15,913.153  | 17,736.92  | 17,128.7           | 12,873.84  |


## Development
To start the development server run:
```bash
bun run dev
```

## Build app
To start the development server run:
```bash
bun run build
```

Open http://localhost:3000/ with your browser to see the result.