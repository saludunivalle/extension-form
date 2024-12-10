import React from 'react';
import { Grid, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';

function Step3FormSection3({ formData, handleInputChange, totalGastos}) {
  // Calcular dinámicamente los totales según los datos en formData
  const totalIngresos = (formData.ingresos_cantidad || 0) * (formData.ingresos_vr_unit || 0);

  // Porcentaje para el fondo común (ajustable por el usuario)
  const fondoComunPorcentaje = formData.fondo_comun_porcentaje || 30;

  // Cálculo del fondo común, facultad y escuela/departamento
  const fondoComun = (fondoComunPorcentaje / 100) * totalIngresos;
  const facultadInstituto = totalIngresos * 0.05; // 5% del total de ingresos
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
                {formatCurrency(formData.totalGastos || 0)} {/* Usa el campo correspondiente a los gastos */}
              </TableCell>
            </TableRow>
            {/* Fondo Común */}
            <TableRow>
              <TableCell sx={{display:'flex', flexDirection:'row',alignItems:'center'}}>
                Fondo Común (
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
                    style: { width: '50px', height: '30px', fontSize: '14px', padding: '5px'},
                  }}
                />
                %)
              </TableCell>
              <TableCell align="right">{formatCurrency(fondoComun)}</TableCell>
            </TableRow>

            {/* Facultad o Instituto */}
            <TableRow>
              <TableCell>Facultad o Instituto (5%)</TableCell>
              <TableCell align="right">{formatCurrency(facultadInstituto)}</TableCell>
            </TableRow>

            {/* Escuela/Departamento */}
            <TableRow>
              <TableCell sx={{display:'flex', flexDirection:'row',alignItems:'center'}}>
                Escuela, Departamento, Área (
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
                    style: { width: '50px', height: '30px', fontSize: '14px', padding: '5px' },
                  }}
                />
                %)
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
    </Grid>
  );
}

export default Step3FormSection3;
