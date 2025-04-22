import { useState, useEffect, useMemo } from 'react';
import { Typography, Box, Grid, Checkbox, TextField, Button, CircularProgress, Tabs, Tab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from "prop-types";
import axios from 'axios';
import RiesgosDinamicos from './RiesgosDinamicos';


const solicitud3Step5Fields = [
  'aplicaCierre1', 'aplicaCierre2', 'aplicaCierre3',
  'riesgoExtra1', 'riesgoExtra2', 'riesgoExtra3',
  'aplicaExtra1', 'aplicaExtra2', 'aplicaExtra3',
  'mitigaExtra1', 'mitigaExtra2', 'mitigaExtra3'
];

// Función para determinar estilo de fila basado en estado 'aplicado'
const getRiskRowStyle = (isApplied) => ({
  padding: '16px 0', // Aumentado para mejor espaciado
  opacity: isApplied ? 1 : 0.7, // Contraste más sutil
  backgroundColor: isApplied ? '#FFFFFF' : 'rgba(0, 0, 0, 0.02)', // Fondo blanco para seleccionados
  transition: 'all 0.25s ease',
  borderRadius: '4px',
  boxShadow: isApplied ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', // Sombra sutil en lugar de borde
  border: 'none', // Eliminamos bordes visibles
  marginBottom: '12px', // Más espacio entre filas
});

const handleSubmit = async (formData, idSolicitud, userData, setIsLoading, navigate, setCurrentSection) => {
  setIsLoading(true);

  // Construir los datos a enviar para el step 5:
  // Se usan valores por defecto: en checkboxes "No" y en campos de texto vacío.
  const step5Data = {};
  solicitud3Step5Fields.forEach(field => {
    if (field.startsWith('aplica')) {
      step5Data[field] = formData[field] || 'No';
    } else {
      step5Data[field] = formData[field] || '';
    }
  });
  
  try {
    await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
      ...step5Data,
      id_solicitud: idSolicitud,
      paso: 5,
      hoja: 3,
      id_usuario: userData.id_usuario,
      name: userData.name
    });
    // Una vez enviado con éxito, puedes cambiar de sección o notificar al usuario:
    setCurrentSection(4); // Por ejemplo, pasar a la siguiente sección
    navigate(`/formulario/4?solicitud=${idSolicitud}&paso=0`);
  } catch (error) {
    console.error('Error al guardar los datos del último paso:', error.response?.data || error.message);
  } finally {
    setIsLoading(false);
  }
};

function Step5FormSection3({ formData, handleInputChange, idSolicitud, userData, setIsLoading, navigate, setCurrentSection }) {
  const [additionalRisks, setAdditionalRisks] = useState([]);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    handleInputChange({
      target: {
        name,
        value: checked ? 'Sí' : 'No',
      },
    });
  };

  const addNewRisk = () => {
    const newIndex = additionalRisks.length + 1;
    
    // Inicializar todos los campos para el nuevo riesgo
    handleInputChange({
      target: { name: `riesgoExtra${newIndex}`, value: '' }
    });
    handleInputChange({
      target: { name: `aplicaExtra${newIndex}`, value: 'No' }
    });
    handleInputChange({
      target: { name: `mitigaExtra${newIndex}`, value: '' }
    });
  
    setAdditionalRisks([...additionalRisks, newIndex]);
  };

  const handleCustomRiskChange = (index, field, value) => {
    const fieldMap = {
      riesgo: `riesgoExtra${index + 1}`,
      aplica: `aplicaExtra${index + 1}`,
      mitigacion: `mitigaExtra${index + 1}`
    };
    
    handleInputChange({
      target: {
        name: fieldMap[field],
        value: value
      }
    });
  };

  const removeRisk = (indexPositionToRemove) => {
    // Obtener el índice real del riesgo desde el array additionalRisks
    const riskIndex = additionalRisks[indexPositionToRemove];
    
    // Activar indicador de carga
    setLoadingDeleteId(indexPositionToRemove)

    // Limpiar los valores del formulario para este riesgo
    handleInputChange({
      target: { name: `riesgoExtra${riskIndex}`, value: '' }
    });
    handleInputChange({
      target: { name: `aplicaExtra${riskIndex}`, value: 'No' }
    });
    handleInputChange({
      target: { name: `mitigaExtra${riskIndex}`, value: '' }
    });
    
    syncRiskRemovalWithBackend(riskIndex)
      .finally(() => {
        // Eliminar el índice del array additionalRisks
        const updatedRisks = additionalRisks.filter((_, i) => i !== indexPositionToRemove);
        setAdditionalRisks(updatedRisks);
        // Desactivar indicador de carga
        setLoadingDeleteId(null);
      });
  };

  const syncRiskRemovalWithBackend = async (riskIndex) => {
    try {
      const response = await axios.post('https://siac-extension-server.vercel.app/eliminarRiesgo', {
        id_solicitud: idSolicitud,
        indice_riesgo: riskIndex,
        id_usuario: userData.id_usuario,
        name: userData.name
      });
      
      // Podemos agregar una notificación de éxito si se desea
      return response;
    } catch (error) {
      console.error('Error al eliminar el riesgo:', error.response?.data || error.message);
      // Podríamos manejar un estado para mostrar un mensaje de error
      throw error;
    }
  };

  

  const CierreRiskSystem = () => (
    <Box>
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - CIERRE</Typography>

      <Grid container spacing={2} sx={{ marginBottom: '8px', fontWeight: 'bold', padding: '8px 0' }}>
        {/* Encabezados */}
        <Grid item xs={4}>
          <Typography variant="subtitle1">RIESGO</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle1">¿APLICA?</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle1">MITIGACIÓN</Typography>
        </Grid>
      </Grid>

      {/* Riesgo 1 */}
      <Grid 
        container 
        spacing={2} 
        marginTop={1}
        sx={getRiskRowStyle(formData.aplicaCierre1 === 'Sí')}
      >
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación de la ejecución de los programas debido a la falta de estrategias de comunicación y baja asistencia por parte de la audiencia (estudiantes) invitados.
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            name="aplicaCierre1"
            checked={formData.aplicaCierre1 === 'Sí'}
            onChange={handleCheckboxChange}
          />
          <Typography variant="body2" color="textSecondary">
            {formData.aplicaCierre1 === 'Sí' ? 'Sí aplica' : 'No aplica'}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Tener en cuenta que la participación se realiza con el 30% del público invitado.
          </Typography>
        </Grid>
      </Grid>

      {/* Riesgo 2 */}
      <Grid 
        container 
        spacing={2} 
        sx={getRiskRowStyle(formData.aplicaCierre2 === 'Sí')}
      >
        <Grid item xs={4}>
          <Typography variant="body1">
            Debilidades en el proceso de verificación del cumplimiento de los requisitos.
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            name="aplicaCierre2"
            checked={formData.aplicaCierre2 === 'Sí'}
            onChange={handleCheckboxChange}
          />
          <Typography variant="body2" color="textSecondary">
            {formData.aplicaCierre2 === 'Sí' ? 'Sí aplica' : 'No aplica'}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Verificar los requisitos para la certificación.
          </Typography>
        </Grid>
      </Grid>
      
      {/* Riesgo 3 */}
      <Grid 
        container 
        spacing={2} 
        sx={getRiskRowStyle(formData.aplicaCierre3 === 'Sí')}
      >
        <Grid item xs={4}>
          <Typography variant="body1">
            Pérdida de imagen de la institución por insatisfacción en calidad de contenidos.
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            name="aplicaCierre3"
            checked={formData.aplicaCierre3 === 'Sí'}
            onChange={handleCheckboxChange}
          />
          <Typography variant="body2" color="textSecondary">
            {formData.aplicaCierre3 === 'Sí' ? 'Sí aplica' : 'No aplica'}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Seguimiento a encuestas de satisfacción.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );



  return (
    <Box>
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="Sistema de gestión de riesgos"
        >
          <Tab label="MATRIZ DE RIESGOS - CIERRE" />
          <Tab label="MATRIZ DE RIESGOS - OTROS" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <CierreRiskSystem />
      ) : (
        <RiesgosDinamicos 
          idSolicitud={idSolicitud} 
          userData={userData} 
        />
      )}
    </Box>
  );
}

Step5FormSection3.defaultProps = {
  navigate: () => {},
  setCurrentSection: () => {},
};

Step5FormSection3.propTypes = {
  formData: PropTypes.shape({}).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  idSolicitud: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userData: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }).isRequired,
  setIsLoading: PropTypes.func.isRequired,
  navigate: PropTypes.func,
  setCurrentSection: PropTypes.func,
};

export default Step5FormSection3;
