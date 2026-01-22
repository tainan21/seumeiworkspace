import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface WaitlistConfirmationTemplateProps {
  userName?: string;
}

const WaitlistConfirmationTemp: React.FC<
  Readonly<WaitlistConfirmationTemplateProps>
> = ({ userName }) => {
  const displayName = userName
    ? userName.split(" ")[0]
    : "você";

  return (
    <Html>
      <Head />
      <Preview>Você está na lista! 🎉</Preview>
      <Tailwind>
        <Body className="bg-gray-100">
          <Container className="p-6 m-10 mx-auto bg-white">
            <Text className="mb-4 text-lg">Olá, {displayName}!</Text>
            <Text className="text-base font-semibold text-center">
              Você está na lista! 🎉
            </Text>
            <Section className="mt-4">
              <Text className="text-base">
                Obrigado por se inscrever na nossa lista de espera! Estamos
                trabalhando duro para trazer algo incrível para você.
              </Text>
              <Text className="mt-4 text-base">
                Você será um dos primeiros a saber quando nosso produto estiver
                disponível. Enquanto isso, fique de olho no seu email para
                atualizações e novidades exclusivas.
              </Text>
            </Section>
            <Text className="mt-8 text-base">
              Best,
              <br />
              <span className="font-bold">Seumei</span>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WaitlistConfirmationTemp;

