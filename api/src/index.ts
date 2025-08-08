import { Elysia, t } from "elysia";
import { Service } from "./service";
import cors from "@elysiajs/cors";
import { file } from "bun";

const service = new Service()

export const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .get('/downloads-pdfs', () => service.downloadsPdfs())
  .get(
    '/pesquisar',
    ({ query }) => service.searchPdf(query.texto),
    {
      query: t.Object({
        texto: t.String({
          minLength: 4
        }),
      }),
    }
  )
  .get('/pdf/:uuid', ({ params }) => file(`pdfs/${params.uuid}`))
  .use(cors())
  .listen(8000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
