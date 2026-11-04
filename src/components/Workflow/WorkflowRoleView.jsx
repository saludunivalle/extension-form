import { Box, Button, Typography } from "@mui/material";
import PropTypes from "prop-types";

const ROLE_CONFIG = {
  solicitante: {
    title: "Mis solicitudes",
    description:
      "Consulta el avance, completa formularios y atiende las observaciones de tus solicitudes.",
    ownTitle: "Mis solicitudes",
  },
  revisor_1: {
    title: "Bandeja de Revisión 1",
    description:
      "Revisa, observa y aprueba solicitudes de la primera etapa. También puedes cerrar solicitudes que estén en Decanato.",
    receivedTitle: "Solicitudes asignadas a Revisión 1",
  },
  revisor_2: {
    title: "Bandeja de Revisión 2",
    description:
      "Verifica las solicitudes y atiende las devoluciones provenientes de Presupuesto.",
    receivedTitle: "Solicitudes asignadas a Revisión 2",
  },
  presupuesto: {
    title: "Bandeja de Presupuesto",
    description:
      "Revisa la información financiera y devuelve observaciones a Revisión 2 cuando sea necesario.",
    receivedTitle: "Solicitudes para revisión presupuestal",
  },
  director: {
    title: "Firmas pendientes",
    description:
      "Consulta las solicitudes que requieren tu firma como director de escuela.",
    receivedTitle: "Solicitudes pendientes de firma",
  },
  decanato: {
    title: "Bandeja de Decanato",
    description:
      "Registra la decisión final y la resolución de las solicitudes recibidas en Decanato.",
    receivedTitle: "Solicitudes pendientes de decisión",
  },
  admin: {
    title: "Administración",
    description:
      "Supervisa solicitudes propias y solicitudes recibidas para revisión.",
    ownTitle: "Mis solicitudes",
    receivedTitle: "Solicitudes recibidas",
  },
};

const normalizeRole = (role) => {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();
  return ROLE_CONFIG[normalizedRole] ? normalizedRole : "solicitante";
};

function WorkflowRoleView({
  role = "solicitante",
  ownRequests,
  receivedRequests,
  renderOwnRequests,
  renderReceivedRequests,
  onCreateRequest,
}) {
  const normalizedRole = normalizeRole(role);
  const config = ROLE_CONFIG[normalizedRole];
  const isRequester = normalizedRole === "solicitante";
  const isAdmin = normalizedRole === "admin";

  const statusLegend = (
    <div className="workflow-status-legend" aria-label="Leyenda de estados">
      <span>
        <i className="workflow-status-dot workflow-status-dot--ok" />
        En orden
      </span>
      <span>
        <i className="workflow-status-dot workflow-status-dot--pending" />
        Pendiente
      </span>
      <span>
        <i className="workflow-status-dot workflow-status-dot--correction" />
        Requiere corrección
      </span>
      <span>
        <i className="workflow-status-dot workflow-status-dot--rejected" />
        Rechazada y finalizada
      </span>
    </div>
  );

  return (
    <Box className={`workflow-role-view workflow-role-view--${normalizedRole}`}>
      {isRequester || isAdmin ? (
        <section
          className="workflow-role-section"
          aria-labelledby="workflow-own-title"
        >
          <Box className="workflow-section-heading">
            <Box className="workflow-section-heading__content">
              <Typography
                id="workflow-own-title"
                className="workflow-section-title"
                variant="h6"
              >
                {config.ownTitle || "Mis solicitudes"}
              </Typography>
              {statusLegend}
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={onCreateRequest}
            >
              Crear nueva solicitud
            </Button>
          </Box>
          {renderOwnRequests(ownRequests)}
        </section>
      ) : null}

      {!isRequester && !isAdmin && (
        <section
          className="workflow-role-section"
          aria-labelledby="workflow-received-title"
        >
          <Box className="workflow-section-heading__content">
            <Typography
              id="workflow-received-title"
              className="workflow-section-title"
              variant="h6"
            >
              {config.receivedTitle}
            </Typography>
            {statusLegend}
          </Box>
          {renderReceivedRequests(receivedRequests)}
        </section>
      )}

      {isAdmin && (
        <section
          className="workflow-role-section"
          aria-labelledby="workflow-admin-received-title"
        >
          <Box className="workflow-section-heading__content">
            <Typography
              id="workflow-admin-received-title"
              className="workflow-section-title"
              variant="h6"
            >
              {config.receivedTitle}
            </Typography>
            {statusLegend}
          </Box>
          {renderReceivedRequests(receivedRequests)}
        </section>
      )}
    </Box>
  );
}

WorkflowRoleView.propTypes = {
  role: PropTypes.string,
  ownRequests: PropTypes.arrayOf(PropTypes.object).isRequired,
  receivedRequests: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderOwnRequests: PropTypes.func.isRequired,
  renderReceivedRequests: PropTypes.func.isRequired,
  onCreateRequest: PropTypes.func.isRequired,
};

export default WorkflowRoleView;
