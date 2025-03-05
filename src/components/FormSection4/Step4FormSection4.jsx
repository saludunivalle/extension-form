import { TextField, Box, Typography, FormControlLabel, Checkbox, RadioGroup, Radio, Grid } from '@mui/material';
import PropTypes from "prop-types";

function Step4FormSection4({ formData, handleInputChange, errors }) {

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
      {/* Grupo 1: Mesas de trabajo */}
      <Typography variant="h6" gutterBottom>
        ¿Participa en mesas de trabajo sectoriales?
      </Typography>
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.gremios === 'Sí'} // Corregir verificación
            onChange={handleCheckboxChange} 
            name="gremios" 
          />
        } 
        label="Gremios" 
      />
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.sectores_empresariales === 'Sí'}
            onChange={handleCheckboxChange} 
            name="sectores_empresariales" 
          />
        } 
        label="Sectores Empresariales" 
      />
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.politicas_publicas === 'Sí'}
            onChange={handleCheckboxChange} 
            name="politicas_publicas" 
          />
        } 
        label="Políticas Públicas" 
      />
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.otros_mesas_trabajoChecked === 'Sí'} // Cambiar nombre del checkbox
            onChange={handleCheckboxChange} 
            name="otros_mesas_trabajoChecked" 
          />
        } 
        label="Otro" 
      />
      {formData.otros_mesas_trabajoChecked === 'Sí' && (
        <TextField
          label="¿Cuál?"
          name="otros_mesas_trabajo"
          value={formData.otros_mesas_trabajo || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          error={!!errors.otros_mesas_trabajo}
          helperText={errors.otros_mesas_trabajo}
        />
      )}
      {errors.mesasTrabajo && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.mesasTrabajo}
        </Typography>
      )}

      {/* Grupo 2: Actividades de mercadeo */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        ¿Qué actividades de mercadeo relacional se realizan?
      </Typography>
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.focusGroup === 'Sí'}
            onChange={handleCheckboxChange} 
            name="focusGroup" 
          />
        } 
        label="Focus Group" 
      />
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.desayunosTrabajo === 'Sí'}
            onChange={handleCheckboxChange} 
            name="desayunosTrabajo" 
          />
        } 
        label="Desayunos de trabajo" 
      />
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.almuerzosTrabajo === 'Sí'}
            onChange={handleCheckboxChange} 
            name="almuerzosTrabajo" 
          />
        } 
        label="Almuerzos de trabajo" 
      />
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.openHouse === 'Sí'}
            onChange={handleCheckboxChange} 
            name="openHouse" 
          />
        } 
        label="Open House" 
      />
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.ferias_colegios === 'Sí'}
            onChange={handleCheckboxChange} 
            name="ferias_colegios" 
          />
        } 
        label="Ferias en Colegios" 
      />
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.ferias_empresarial === 'Sí'}
            onChange={handleCheckboxChange} 
            name="ferias_empresarial" 
          />
        } 
        label="Ferias empresariales" 
      />
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.otros_mercadeoChecked === 'Sí'} // Cambiar nombre del checkbox
            onChange={handleCheckboxChange} 
            name="otros_mercadeoChecked" 
          />
        } 
        label="Otro" 
      />
      {formData.otros_mercadeoChecked === 'Sí' && (
        <TextField
          label="¿Cuál?"
          name="otros_mercadeo"
          value={formData.otros_mercadeo || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          error={!!errors.otros_mercadeo}
          helperText={errors.otros_mercadeo}
        />
      )}
      {errors.actividadesMercadeo && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.actividadesMercadeo}
        </Typography>
      )}

      {/* Grupo 3: Valor económico (radio) */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        ¿El valor económico es competitivo?
      </Typography>
      <RadioGroup 
        name="valorEconomico" 
        value={formData.valorEconomico || ''} 
        onChange={handleInputChange}
      >
        <FormControlLabel value="Sí" control={<Radio />} label="Sí" />
        <FormControlLabel value="No" control={<Radio />} label="No" />
      </RadioGroup>
      {errors.valorEconomico && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.valorEconomico}
        </Typography>
      )}

      {/* Grupo 4: Modalidades */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        ¿Bajo qué modalidad se ofrece?
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.modalidadPresencial || false} onChange={handleCheckboxChange} name="modalidadPresencial" />} label="Presencial" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.modalidadVirtual || false} onChange={handleCheckboxChange} name="modalidadVirtual" />} label="Virtual" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.modalidadSemipresencial || false} onChange={handleCheckboxChange} name="modalidadSemipresencial" />} label="Semipresencial" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.traslados_docente || false} onChange={handleCheckboxChange} name="traslados_docente" />} label="Traslados del docente a un punto de capacitación determinado" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.modalidad_asistida_tecnologia || false} onChange={handleCheckboxChange} name="modalidad_asistida_tecnologia" />} label="Presencialidad asistida por tecnologías" /></Grid>
        {/* Checkboxes de modalidades... */}
      </Grid>
      {errors.modalidades && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.modalidades}
        </Typography>
      )}
    </Box>
  );
}

// Actualizar PropTypes
Step4FormSection4.propTypes = {
  formData: PropTypes.shape({
    gremios: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    sectores_empresariales: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    politicas_publicas: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    otros_mesas_trabajo: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    focusGroup: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    desayunosTrabajo: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    almuerzosTrabajo: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    openHouse: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    ferias_colegios: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    ferias_empresarial: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    otros_mercadeo: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    valorEconomico: PropTypes.string,
    modalidadPresencial: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    modalidadVirtual: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    modalidadSemipresencial: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    traslados_docente: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    modalidad_asistida_tecnologia: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    // Campos añadidos para validación de checkbox modificados
    otros_mesas_trabajoChecked: PropTypes.string,
    otros_mercadeoChecked: PropTypes.string,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  errors: PropTypes.object, // Añadir prop para errores
};

Step4FormSection4.defaultProps = {
  errors: {},
};

export default Step4FormSection4;
