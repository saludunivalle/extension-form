import React, { useState } from 'react';
import { Grid, Table, TableBody, TableCell, TableHead, TableRow, TextField, Box, IconButton, Typography, Collapse } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

function Step3FormSection2({ formData, handleInputChange, totalGastos}) {
  const [observacionesExpanded, setObservacionesExpanded] = useState(true);
  
  // Calcular dinámicamente los totales según los datos en formData
  const totalIngresos = (formData.ingresos_cantidad || 0) * (formData.ingresos_vr_unit || 0);

  // Porcentaje para el fondo común (ajustable por el usuario)
  const fondoComunPorcentaje = formData.fondo_comun_porcentaje || 30;

  // Cálculo del fondo común, facultad y escuela/departamento
  const fondoComun = (fondoComunPorcentaje / 100) * totalIngresos;
  const facultadInstitutoPorcentaje = formData.facultad_instituto_porcentaje || 5; // Ahora editable
  const facultadInstituto = totalIngresos * (facultadInstitutoPorcentaje / 100);
  const escuelaDepartamento = ((formData.escuela_departamento_porcentaje || 0) / 100) * totalIngresos;

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
                    onChange={(e) => {
                      let value = parseFloat(e.target.value) || 0;
                      if (value < 0) value = 0; // Limitar mínimo a 0%
                      if (value > 100) value = 100; // Limitar máximo a 100%
                      handleInputChange({ target: { name: 'facultad_instituto_porcentaje', value } });
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
                    value={formData.escuela_departamento_porcentaje || ''}
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
