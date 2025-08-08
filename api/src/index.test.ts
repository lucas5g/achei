import { describe, expect, it } from "bun:test";
import { app } from ".";
import { treaty } from '@elysiajs/eden'


// const api = 'http://localhost:8000'
const api = treaty(app)

describe("api", () => {

  // it('downloads-pdfs', async () => {
  //   const { data } = await api["downloads-pdfs"].get()

  //   expect(data?.message).toContain('Arquivos criados com sucesso')
  // });

  it.only('pesquisar', async () => {
    const { data } = await api.pesquisar.get({
      query: {
        texto: 'estágio'
      }
    })

    expect(data?.length).toBeGreaterThan(0)
  })

})