import { TextField, Grid, Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import PropTypes from "prop-types";

function Step3FormSection4({ formData, handleInputChange, errors }) {
  
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    handleInputChange({
      target: {
        name,
        value: checked ? 'Sí' : 'No',
      },
    });
  };

  return (
    <Box>
      {/* Grupo 1: Indicadores previos */}
      <Typography variant="h6" gutterBottom>
        ¿Cuáles son los indicadores previos para medir la acogida de este programa de Educación Continua?
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.personasInteresChecked === 'Sí'}
                onChange={handleCheckboxChange}
                name="personasInteresChecked"
              />
            }
            label="Cantidad de personas que mostraron interés por algún medio"
          />
        </Grid>
        <Grid item xs={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.personasMatriculadasChecked === 'Sí'}
                onChange={handleCheckboxChange}
                name="personasMatriculadasChecked"
              />
            }
            label="Cantidad de personas matriculadas previamente"
          />
        </Grid>
        <Grid item xs={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.otroInteresChecked === 'Sí'}
                onChange={handleCheckboxChange}
                name="otroInteresChecked"
              />
            }
            label="Otro"
          />
          {formData.otroInteresChecked === 'Sí' && (
            <TextField
              label="¿Cuál?"
              name="otroInteres"
              value={formData.otroInteres || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!errors.otroInteres}
              helperText={errors.otroInteres}
            />
          )}
        </Grid>
      </Grid>
      {errors.indicadoresPrevios && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.indicadoresPrevios}
        </Typography>
      )}

      {/* Grupo 2: Variables de mercadeo */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        ¿Cuáles son las variables de mercadeo utilizadas por su área para abrir un nuevo programa de Educación Continua?
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.innovacion === 'Sí'}
            onChange={handleCheckboxChange}
            name="innovacion"
          />
        }
        label="Innovación"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.solicitudExterno === 'Sí'}
            onChange={handleCheckboxChange}
            name="solicitudExterno"
          />
        }
        label="Solicitud cliente externo"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.interesSondeo === 'Sí'}
            onChange={handleCheckboxChange}
            name="interesSondeo"
          />
        }
        label="El público ha manifestado interés mediante sondeo previo"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.otroMercadeoChecked === 'Sí'}
            onChange={handleCheckboxChange}
            name="otroMercadeoChecked"
          />
        }
        label="Otro"
      />
      {formData.otroMercadeoChecked === 'Sí' && (
        <TextField
          label="¿Cuál?"
          name="otroMercadeo"
          value={formData.otroMercadeo || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
      )}
      {errors.variablesMercadeo && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.variablesMercadeo}
        </Typography>
      )}

      {/* Grupo 3: Estrategias de sondeo */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        ¿Cuál de las siguientes estrategias han utilizado para sondear previamente el interés de las personas?
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.llamadas === 'Sí'}
            onChange={handleCheckboxChange}
            name="llamadas"
          />
        }
        label="Llamadas"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.encuestas === 'Sí'}
            onChange={handleCheckboxChange}
            name="encuestas"
          />
        }
        label="Encuestas"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.webinar === 'Sí'}
            onChange={handleCheckboxChange}
            name="webinar"
          />
        }
        label="Webinar"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.pautas_redes === 'Sí'}
            onChange={handleCheckboxChange}
            name="pautas_redes"
          />
        }
        label="Pautas Redes Sociales"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.otroEstrategiasChecked === 'Sí'}
            onChange={handleCheckboxChange}
            name="otroEstrategiasChecked"
          />
        }
        label="Otro"
      />
      {formData.otroEstrategiasChecked === 'Sí' && (
        <TextField
          label="¿Cuál?"
          name="otroEstrategias"
          value={formData.otroEstrategias || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
      )}
      {errors.estrategiasSondeo && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.estrategiasSondeo}
        </Typography>
      )}

      {/* Grupo 4: Preregistro */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        ¿Cuentan con un preregistro, bases de datos o formularios diligenciados para aperturar el programa?
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.preregistroFisico === 'Sí'}
            onChange={handleCheckboxChange}
            name="preregistroFisico"
          />
        }
        label="Físico"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.preregistroGoogle === 'Sí'}
            onChange={handleCheckboxChange}
            name="preregistroGoogle"
          />
        }
        label="Google"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.preregistroOtroChecked === 'Sí'}
            onChange={handleCheckboxChange}
            name="preregistroOtroChecked"
          />
        }
        label="Otro"
      />
      {formData.preregistroOtroChecked === 'Sí' && (
        <TextField
          label="¿Cuál?"
          name="preregistroOtro"
          value={formData.preregistroOtro || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
      )}
      {errors.preregistro && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.preregistro}
        </Typography>
      )}
    </Box>
  );
}

Step3FormSection4.propTypes = {
  formData: PropTypes.shape({
    personasInteresChecked: PropTypes.string,
    personasMatriculadasChecked: PropTypes.string,
    otroInteresChecked: PropTypes.string,
    otroInteres: PropTypes.string,
    innovacion: PropTypes.string,
    solicitudExterno: PropTypes.string,
    interesSondeo: PropTypes.string,
    otroMercadeoChecked: PropTypes.string,
    otroMercadeo: PropTypes.string,
    llamadas: PropTypes.string,
    encuestas: PropTypes.string,
    webinar: PropTypes.string,
    pautas_redes: PropTypes.string,
    otroEstrategiasChecked: PropTypes.string,
    otroEstrategias: PropTypes.string,
    preregistroFisico: PropTypes.string,
    preregistroGoogle: PropTypes.string,
    preregistroOtroChecked: PropTypes.string,
    preregistroOtro: PropTypes.string,
    errors: PropTypes.object,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    indicadoresPrevios: PropTypes.string,
    variablesMercadeo: PropTypes.string,
    estrategiasSondeo: PropTypes.string,
    preregistro: PropTypes.string,
    otroInteres: PropTypes.string,
  }),
};

Step3FormSection4.defaultProps = {
  errors: {},
};

export default Step3FormSection4;
