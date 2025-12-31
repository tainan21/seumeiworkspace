import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Seumei",
  version: packageJson.version,
  copyright: `© ${currentYear}, Seumei.`,
  meta: {
    title:
      "Seumei - Seu espaço de trabalho - o sistema que trabalha por você e para você",
    description:
      "Criando um mundo para o seu negócio, automação de vendas, agentes e relatórios. Seumei é um sistema que trabalha por você e para você. Ele é um espaço de trabalho online que você pode usar para gerenciar seu negócio. Ele é um sistema que trabalha por você e para você. Ele é um espaço de trabalho online que você pode usar para gerenciar seu negócio. Ele é um sistema que trabalha por você e para você. Ele é um espaço de trabalho online que você pode usar para gerenciar seu negócio. Ele é um sistema que trabalha por você e para você. Ele é um espaço de trabalho online que você pode usar para gerenciar seu negócio.",
  },
};
