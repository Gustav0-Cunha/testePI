package projeto.integrador.backendfelipeco.dtos.clienteDto;

public class FormularioRiscoDTO {
    private Horizonte horizonte;
    private ToleranciaPerda toleranciaPerda;
    private NecessidadeLiquidez necessidadeLiquidez;
    private Experiencia experiencia;
    private ReacaoQueda reacaoQueda;

    public Horizonte getHorizonte() {
        return horizonte;
    }

    public void setHorizonte(Horizonte horizonte) {
        this.horizonte = horizonte;
    }

    public ToleranciaPerda getToleranciaPerda() {
        return toleranciaPerda;
    }

    public void setToleranciaPerda(ToleranciaPerda toleranciaPerda) {
        this.toleranciaPerda = toleranciaPerda;
    }

    public NecessidadeLiquidez getNecessidadeLiquidez() {
        return necessidadeLiquidez;
    }

    public void setNecessidadeLiquidez(NecessidadeLiquidez necessidadeLiquidez) {
        this.necessidadeLiquidez = necessidadeLiquidez;
    }

    public Experiencia getExperiencia() {
        return experiencia;
    }

    public void setExperiencia(Experiencia experiencia) {
        this.experiencia = experiencia;
    }

    public ReacaoQueda getReacaoQueda() {
        return reacaoQueda;
    }

    public void setReacaoQueda(ReacaoQueda reacaoQueda) {
        this.reacaoQueda = reacaoQueda;
    }

    public boolean completo() {
        return horizonte != null
                && toleranciaPerda != null
                && necessidadeLiquidez != null
                && experiencia != null
                && reacaoQueda != null;
    }

    public int calcularPontuacaoTotal() {
        return horizonte.pontos
                + toleranciaPerda.pontos
                + necessidadeLiquidez.pontos
                + experiencia.pontos
                + reacaoQueda.pontos;
    }

    public enum Horizonte {
        CURTO(0), MEDIO(1), LONGO(2);

        private final int pontos;

        Horizonte(int pontos) {
            this.pontos = pontos;
        }
    }

    public enum ToleranciaPerda {
        BAIXA(0), MEDIA(1), ALTA(2);

        private final int pontos;

        ToleranciaPerda(int pontos) {
            this.pontos = pontos;
        }
    }

    public enum NecessidadeLiquidez {
        ALTA(0), MEDIA(1), BAIXA(2);

        private final int pontos;

        NecessidadeLiquidez(int pontos) {
            this.pontos = pontos;
        }
    }

    public enum Experiencia {
        INICIANTE(0), INTERMEDIARIO(1), AVANCADO(2);

        private final int pontos;

        Experiencia(int pontos) {
            this.pontos = pontos;
        }
    }

    public enum ReacaoQueda {
        RESGATAR(0), AGUARDAR(1), APORTAR_MAIS(2);

        private final int pontos;

        ReacaoQueda(int pontos) {
            this.pontos = pontos;
        }
    }
}
