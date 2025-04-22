// src/components/FormSection3/Step6FormSection3.jsx
import { Typography, Box } from '@mui/material';
import PropTypes from "prop-types";
import OtrosRiesgos from './OtrosRiesgos';

function Step6FormSection3({ idSolicitud, userData }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - OTROS</Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        En esta sección puede agregar riesgos adicionales que no se ajusten a las categorías anteriores.
      </Typography>
      
      {idSolicitud && userData && (
        <OtrosRiesgos 
          idSolicitud={idSolicitud} 
          userData={userData} 
          categoria="otros" 
        />
      )}
    </Box>
  );
}

Step6FormSection3.propTypes = {
  idSolicitud: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userData: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }).isRequired,
};

export default Step6FormSection3;