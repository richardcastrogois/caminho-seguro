import styles from "./protected-journey.module.css";

const reducedMotionSteps = [
  "Crianca sai de casa com a jornada iniciada as 07:15.",
  "Responsavel recebe notificacao do inicio do trajeto.",
  "Ponto Seguro Avenida Brasil detecta, valida e confirma a passagem as 07:21.",
  "Crianca chega a parada, o transporte e identificado e o embarque e confirmado as 07:28.",
  "Onibus percorre a cidade com checkpoints intermediarios, pontos disponiveis e area de atencao.",
  "Escola Municipal Central valida a chegada segura as 07:46.",
  "Mapa final mostra rota completa, rede conectada e areas sem cobertura direta.",
];

export function ReducedMotionJourneySummary() {
  return (
    <aside
      className={styles.reducedMotionSummary}
      aria-label="Resumo estatico da Jornada Protegida"
    >
      <p>Resumo sem movimento prolongado</p>
      <h3>Uma crianca nao precisa estar sozinha durante o caminho.</h3>
      <ol>
        {reducedMotionSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </aside>
  );
}
