import React, { useState } from 'react';
import {
  Grid, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Button, Box, Stepper, Step, StepLabel
} from '@mui/material';

function FormSection3({ formData, handleInputChange, setCurrentSection }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Datos Generales',
    'Ingresos y Gastos',
    'Aportes Univalle',
    'Resumen Financiero',
    'Visto Bueno'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleNumberInputChange = (event) => {
    const { name, value } = event.target;
    handleInputChange({ target: { name, value: parseFloat(value) || 0 } });
  };

  const calculateTotal = (keys) => {
    return keys.reduce((total, key) => {
      const cantidad = formData[key + '_cantidad'] || 0;
      const vr_unit = formData[key + '_vr_unit'] || 0;
      return total + (cantidad * vr_unit);
    }, 0);
  };

  const calculateTotalIngresos = (keys) => {
    return keys.reduce((total, key) => {
      return total * (formData[key] || 1);
    }, 1); // Inicializa con 1 para la multiplicación
  };

  const totalIngresos = calculateTotalIngresos(['ingresos_cantidad', 'ingresos_vr_unit']);
  const totalGastos = calculateTotal([
    'personal_universidad', 'honorarios_docentes', 'otro_personal',
    'materiales_suministros', 'gastos_alojamiento', 'gastos_alimentacion',
    'gastos_transporte', 'equipos_alquiler', 'carpetas', 'libretas',
    'lapiceros', 'memorias', 'marcadores', 'certificados', 'escarapelas',
    'fotocopias', 'estacion_cafe', 'transporte_menaje', 'refrigerios',
    'infraestructura_fisica', 'gastos_generales', 'valor_infraestructura',
    'costos_administrativos'
  ]);

  const imprevistos = totalGastos * 0.03;
  const totalGastosImprevistos = totalGastos + imprevistos;

  const fondoComun = totalIngresos * 0.3;
  const facultadInstituto = totalIngresos * 0.05;
  const escuelaDepartamento = formData.escuela_departamento || 0;
  const totalAportesUnivalle = fondoComun + facultadInstituto + escuelaDepartamento;

  const totalRecursos = totalIngresos - totalGastosImprevistos - totalAportesUnivalle;

  const handleSubmit = () => {
    setCurrentSection(5); // Cambia a la siguiente sección o finaliza el proceso
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Formulario de Solicitud Parte 3
      </Typography>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Grid container spacing={2} sx={{ padding: { xs: '0.5rem 0', sm: '1rem 0' } }}>
          <Grid item xs={12}>
            <TextField
              label="Nombre de la Actividad"
              fullWidth
              name="nombre_actividad"
              value={formData.nombre_actividad || ''}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Fecha"
              type="date"
              fullWidth
              name="fecha"
              value={formData.fecha || ''}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Grid>
        </Grid>
      )}

      {activeStep === 1 && (
        <Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>CONCEPTO</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Vr. Unit</TableCell>
                <TableCell align="right">VALOR TOTAL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* INGRESOS */}
              <TableRow>
                <TableCell colSpan={4} style={{ fontWeight: 'bold' }}>INGRESOS</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Ingresos por Inscripciones</TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    name="ingresos_cantidad"
                    value={formData.ingresos_cantidad || ''}
                    onChange={handleNumberInputChange}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    name="ingresos_vr_unit"
                    value={formData.ingresos_vr_unit || ''}
                    onChange={handleNumberInputChange}
                  />
                </TableCell>
                <TableCell align="right">
                  {(formData.ingresos_cantidad || 0) * (formData.ingresos_vr_unit || 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} style={{ fontWeight: 'bold' }}>TOTAL INGRESOS</TableCell>
                <TableCell align="right" style={{ fontWeight: 'bold' }}>{totalIngresos}</TableCell>
              </TableRow>

              {/* GASTOS */}
              <TableRow>
                <TableCell colSpan={4} style={{ fontWeight: 'bold' }}>GASTOS</TableCell>
              </TableRow>
              {[
                { label: 'Personal Nombrado de la Universidad (Max 70%)', key: 'personal_universidad' },
                { label: 'Honorarios Docentes Externos (Horas)', key: 'honorarios_docentes' },
                { label: 'Otro Personal - Subcontratos', key: 'otro_personal' },
                { label: 'Materiales y Suministros', key: 'materiales_suministros' },
                { label: 'Gastos de Alojamiento', key: 'gastos_alojamiento' },
                { label: 'Gastos de Alimentación', key: 'gastos_alimentacion' },
                { label: 'Gastos de Transporte', key: 'gastos_transporte' },
                { label: 'Equipos Alquiler o Compra', key: 'equipos_alquiler' },
                { label: 'Carpetas', key: 'carpetas' },
                { label: 'Libretas', key: 'libretas' },
                { label: 'Lapiceros', key: 'lapiceros' },
                { label: 'Memorias', key: 'memorias' },
                { label: 'Marcadores, papel, etc.', key: 'marcadores' },
                { label: 'Certificados', key: 'certificados' },
                { label: 'Escarapelas', key: 'escarapelas' },
                { label: 'Fotocopias', key: 'fotocopias' },
                { label: 'Estación de café', key: 'estacion_cafe' },
                { label: 'Transporte de menaje', key: 'transporte_menaje' },
                { label: 'Refrigerios', key: 'refrigerios' },
                { label: 'Inversión en Infraestructura Física', key: 'infraestructura_fisica' },
                { label: 'Gastos Generales', key: 'gastos_generales' },
                { label: 'Valor Infraestructura Universitaria', key: 'valor_infraestructura' },
                { label: 'Imprevistos (Max 5% del 1 al 8)', key: 'imprevistos' },
                { label: 'Costos Administrativos del Proyecto', key: 'costos_administrativos' }
              ].map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.label}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      name={item.key + '_cantidad'}
                      value={formData[item.key + '_cantidad'] || ''}
                      onChange={handleNumberInputChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      name={item.key + '_vr_unit'}
                      value={formData[item.key + '_vr_unit'] || ''}
                      onChange={handleNumberInputChange}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {(formData[item.key + '_cantidad'] || 0) * (formData[item.key + '_vr_unit'] || 0)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} style={{ fontWeight: 'bold' }}>SUB TOTAL GASTOS</TableCell>
                <TableCell align="right" style={{ fontWeight: 'bold' }}>{totalGastos}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} style={{ fontWeight: 'bold' }}>Imprevistos (3%)</TableCell>
                <TableCell align="right" style={{ fontWeight: 'bold' }}>{imprevistos}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} style={{ fontWeight: 'bold' }}>TOTAL GASTOS + IMPREVISTOS</TableCell>
                <TableCell align="right" style={{ fontWeight: 'bold' }}>{totalGastosImprevistos}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      )}

      {activeStep === 2 && (
        <Grid container spacing={2} sx={{ padding: { xs: '0.5rem 0', sm: '1rem 0' } }}>
          <Grid item xs={12}>
            <Typography variant="h6">Aportes Univalle</Typography>
          </Grid>
          <Grid item xs={12}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>CONCEPTO</TableCell>
                  <TableCell align="right">VALOR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Fondo Común (30%)</TableCell>
                  <TableCell align="right">{fondoComun}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Facultad o Instituto (5%)</TableCell>
                  <TableCell align="right">{facultadInstituto}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Escuela, Departamento, Área (XX%)</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      name="escuela_departamento_porcentaje"
                      value={formData.escuela_departamento_porcentaje || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const valor = totalIngresos * (value / 100);
                        handleInputChange({ target: { name: 'escuela_departamento', value: valor } });
                        handleInputChange({ target: { name: 'escuela_departamento_porcentaje', value } });
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={1} style={{ fontWeight: 'bold' }}>Total Aportes</TableCell>
                  <TableCell align="right" style={{ fontWeight: 'bold' }}>
                    {totalAportesUnivalle}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      )}

      {activeStep === 3 && (
        <Grid container spacing={2} sx={{ padding: { xs: '0.5rem 0', sm: '1rem 0' } }}>
          <Grid item xs={12}>
            <Typography variant="h6">Resumen Financiero</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Total Recursos"
              fullWidth
              name="total_recursos"
              value={formData.total_recursos || totalRecursos}
              onChange={handleNumberInputChange}
              required
            />
          </Grid>
        </Grid>
      )}

      {activeStep === 4 && (
        <Grid container spacing={2} sx={{ padding: { xs: '0.5rem 0', sm: '1rem 0' } }}>
          <Grid item xs={12}>
            <Typography variant="h6">Visto Bueno</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Coordinador de la Actividad de Extensión"
              fullWidth
              name="coordinador_actividad"
              value={formData.coordinador_actividad || ''}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Visto Bueno de la Unidad Académica"
              fullWidth
              name="visto_bueno_unidad"
              value={formData.visto_bueno_unidad || ''}
              onChange={handleInputChange}
              required
            />
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '20px' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Atrás
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
      </Box>
    </Box>
  );
}

export default FormSection3;
