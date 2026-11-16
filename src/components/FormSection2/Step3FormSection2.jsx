import { useEffect, useState } from 'react';
import { Grid, Table, TableBody, TableCell, TableHead, TableRow, TextField, Box, IconButton, Typography, Collapse, Button, Chip } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, AttachFile, PictureAsPdf } from '@mui/icons-material';
import PropTypes from 'prop-types';

const parseNumberOrFallback = (value, fallback) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseNumericInput = (value) => {
  if (value === undefined || value === null || value === '') return NaN;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;

  const normalized = String(value)
    .trim()
    .replace(/\s+/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');

  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
};

function Step3FormSection2({ formData, handleInputChange, handleFileChange, totalGastos, isReadOnly }) {
  const [observacionesExpanded, setObservacionesExpanded] = useState(true);
  const isExtensionSolidaria = String(formData.extension_solidaria || '').trim().toLowerCase() === 'si';
  const defaultSolidariaObservation = 'Actividad de extension solidaria sin recaudo por inscripcion.';

  useEffect(() => {
    if (!isExtensionSolidaria) return;

    if (!String(formData.observaciones || '').trim()) {
      handleInputChange({ target: { name: 'observaciones', value: defaultSolidariaObservation } });
    }
  }, [defaultSolidariaObservation, formData.observaciones, handleInputChange, isExtensionSolidaria]);
  
  // Calcular dinámicamente los totales según los datos en formData
  const ingresosCantidad = parseNumericInput(formData.ingresos_cantidad);
  const ingresosVrUnit = parseNumericInput(formData.ingresos_vr_unit);
  const totalIngresosFromInputs = (Number.isFinite(ingresosCantidad) && Number.isFinite(ingresosVrUnit))
    ? ingresosCantidad * ingresosVrUnit
    : NaN;
  const totalIngresosFallback = parseNumericInput(formData.total_ingresos);
  const totalIngresos = isExtensionSolidaria
    ? 0
    : (Number.isFinite(totalIngresosFromInputs)
      ? totalIngresosFromInputs
      : (Number.isFinite(totalIngresosFallback) ? totalIngresosFallback : 0));

  // Porcentaje para el fondo común (ajustable por el usuario)
  const fondoComunPorcentaje = parseNumberOrFallback(formData.fondo_comun_porcentaje, 30);

  // Cálculo del fondo común, facultad y escuela/departamento
  const fondoComun = (fondoComunPorcentaje / 100) * totalIngresos;
  const facultadInstitutoPorcentaje = 5;
  const facultadInstituto = totalIngresos * (facultadInstitutoPorcentaje / 100);
  const escuelaDepartamentoPorcentaje = parseNumberOrFallback(formData.escuela_departamento_porcentaje, 0);
  const escuelaDepartamento = (escuelaDepartamentoPorcentaje / 100) * totalIngresos;

  const isFondoComunModificado = Math.round(Number(fondoComunPorcentaje) * 100) / 100 !== 30;
  const hasSoporte = Boolean(formData.soporte || formData.url_soporte_fondo || formData.archivo_fondo_comun);

  // Suma total de los aportes
  const totalAportesUnivalle = fondoComun + facultadInstituto + escuelaDepartamento;

  // Formatear valores como moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>CONCEPTO</TableCell>
              <TableCell align="right">VALOR</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
             {/* Total Ingresos */}
            <TableRow>
              <TableCell style={{ fontWeight: 'bold' }}>Total Ingresos</TableCell>
              <TableCell align="right" style={{ fontWeight: 'bold' }}>
                {formatCurrency(totalIngresos)}
              </TableCell>
            </TableRow>

            {/* Total Gastos */}
            <TableRow>
              <TableCell style={{ fontWeight: 'bold' }}>Total Gastos</TableCell>
              <TableCell align="right" style={{ fontWeight: 'bold' }}>
                {formatCurrency(totalGastos)} {/* Usa el campo correspondiente a los gastos */}
              </TableCell>
            </TableRow>
            {/* Fondo Común */}
            <TableRow>
              <TableCell sx={{display:'flex', flexDirection:'row',alignItems:'center'}}>
                <span>Fondo Común</span>
                <Box sx={{display:'flex', alignItems:'center', ml: 1}}>
                  (
                  <TextField
                    type="number"
                    name="fondo_comun_porcentaje"
                    value={fondoComunPorcentaje}
                    onChange={(e) => {
                      let value = parseFloat(e.target.value) || 0;
                      if (value < 1) value = 1; // Limitar mínimo a 1%
                      if (value > 100) value = 100; // Limitar máximo a 100%
                      handleInputChange({ target: { name: 'fondo_comun_porcentaje', value } });
                    }}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      min: 1,
                      max: 100,
                      style: { width: '35px', height: '20px', fontSize: '12px', padding: '2px', textAlign: 'center'},
                    }}
                    size="small"
                  />
                  %)
                </Box>
              </TableCell>
              <TableCell align="right">{formatCurrency(fondoComun)}</TableCell>
            </TableRow>

            {/* Facultad o Instituto */}
            <TableRow>
              <TableCell sx={{display:'flex', flexDirection:'row',alignItems:'center'}}>
                <span>Facultad o Instituto</span>
                <Box sx={{display:'flex', alignItems:'center', ml: 1}}>
                  (
                  <TextField
                    type="number"
                    name="facultad_instituto_porcentaje"
                    value={facultadInstitutoPorcentaje}
                    disabled
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      min: 5,
                      max: 5,
                      style: { width: '35px', height: '20px', fontSize: '12px', padding: '2px', textAlign: 'center'},
                    }}
                    size="small"
                  />
                  %)
                </Box>
              </TableCell>
              <TableCell align="right">{formatCurrency(facultadInstituto)}</TableCell>
            </TableRow>

            {/* Escuela/Departamento */}
            <TableRow>
              <TableCell sx={{display:'flex', flexDirection:'row',alignItems:'center'}}>
                <span>Escuela, Departamento, Área</span>
                <Box sx={{display:'flex', alignItems:'center', ml: 1}}>
                  (
                  <TextField
                    type="number"
                    name="escuela_departamento_porcentaje"
                    value={escuelaDepartamentoPorcentaje}
                    onChange={(e) => {
                      let value = parseFloat(e.target.value) || 0;
                      if (value < 0) value = 0; // Limitar mínimo a 0%
                      if (value > 100) value = 100; // Limitar máximo a 100%
                      handleInputChange({ target: { name: 'escuela_departamento_porcentaje', value } });
                    }}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      min: 0,
                      max: 100,
                      style: { width: '35px', height: '20px', fontSize: '12px', padding: '2px', textAlign: 'center'},
                    }}
                    size="small"
                  />
                  %)
                </Box>
              </TableCell>
              <TableCell align="right">{formatCurrency(escuelaDepartamento)}</TableCell>
            </TableRow>

            {/* Total Aportes */}
            <TableRow>
              <TableCell colSpan={1} style={{ fontWeight: 'bold' }}>Total Recursos</TableCell>
              <TableCell align="right" style={{ fontWeight: 'bold' }}>
                {formatCurrency(totalAportesUnivalle)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Grid>

      {isFondoComunModificado && (
        <Grid item xs={12}>
          <Box
            sx={{
              p: 2.5,
              border: '1px solid #90caf9',
              borderRadius: 2,
              backgroundColor: '#f8fbff',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700, color: '#1565c0' }}>
              Soporte de modificación del Fondo Común (PDF) *
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Al modificarse el porcentaje del fondo común ({fondoComunPorcentaje}%, diferente de 30%), es obligatorio adjuntar el Formato de Viabilidad y aportes al fondo común en formato PDF, debidamente firmado por la Sección de Presupuesto.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <input
                type="file"
                id="soporte-fondo-file-input"
                name="soporte"
                accept="application/pdf,.pdf"
                style={{ display: 'none' }}
                disabled={isReadOnly}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                    alert('El archivo de soporte debe ser en formato PDF.');
                    e.target.value = '';
                    return;
                  }
                  if (typeof handleFileChange === 'function') {
                    handleFileChange(e);
                  } else {
                    handleInputChange({ target: { name: 'soporte', value: file } });
                  }
                }}
              />
              <label htmlFor="soporte-fondo-file-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<AttachFile />}
                  disabled={isReadOnly}
                  sx={{ backgroundColor: '#1976d2' }}
                >
                  {hasSoporte ? 'Cambiar archivo PDF' : 'Subir archivo PDF'}
                </Button>
              </label>

              {formData.soporte instanceof File && (
                <Chip
                  color="primary"
                  variant="outlined"
                  label={`Seleccionado: ${formData.soporte.name}`}
                  onDelete={
                    isReadOnly
                      ? undefined
                      : () => {
                          handleInputChange({ target: { name: 'soporte', value: null } });
                        }
                  }
                />
              )}

              {typeof formData.soporte === 'string' && formData.soporte && (
                <Button
                  variant="outlined"
                  size="small"
                  href={formData.soporte}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<PictureAsPdf color="error" />}
                >
                  Ver PDF cargado
                </Button>
              )}

              {!(formData.soporte instanceof File) &&
                (formData.url_soporte_fondo || formData.archivo_fondo_comun) && (
                  <Button
                    variant="outlined"
                    size="small"
                    href={formData.url_soporte_fondo || formData.archivo_fondo_comun}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<PictureAsPdf color="error" />}
                  >
                    Ver soporte en Drive
                  </Button>
                )}
            </Box>

            {!hasSoporte && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, fontWeight: 500 }}>
                * Debe adjuntar el archivo PDF de soporte para poder finalizar el formulario.
              </Typography>
            )}
          </Box>
        </Grid>
      )}
      
      {/* SECCIÓN DE OBSERVACIONES */}
      <Grid item xs={12}>
        <Box sx={{ mt: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Box 
            sx={{ 
              p: 2, 
              backgroundColor: '#f5f5f5', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              '&:hover': { backgroundColor: '#eeeeee' }
            }}
            onClick={() => setObservacionesExpanded(!observacionesExpanded)}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Observaciones
            </Typography>
            <IconButton size="small">
              {observacionesExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Box>
          
          <Collapse in={observacionesExpanded}>
            <Box sx={{ p: 2 }}>
              {isExtensionSolidaria && (
                <Typography variant="caption" color="warning.main" sx={{ display: 'block', mb: 1 }}>
                  Advertencia: al ser extension solidaria, los ingresos por inscripcion se mantienen en 0.
                </Typography>
              )}
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Ingrese aquí sus observaciones..."
                name="observaciones"
                value={formData.observaciones || ''}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
              />
            </Box>
          </Collapse>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Step3FormSection2;

Step3FormSection2.propTypes = {
  formData: PropTypes.shape({
    extension_solidaria: PropTypes.string,
    ingresos_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ingresos_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_ingresos: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fondo_comun_porcentaje: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    facultad_instituto_porcentaje: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    escuela_departamento_porcentaje: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    archivo_fondo_comun: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ name: PropTypes.string }),
    ]),
    soporte: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ name: PropTypes.string }),
    ]),
    url_soporte_fondo: PropTypes.string,
    observaciones: PropTypes.string,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func,
  isReadOnly: PropTypes.bool,
  totalGastos: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
