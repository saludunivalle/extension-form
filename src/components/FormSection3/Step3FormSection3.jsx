import React from 'react';
import { Grid, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';

function Step3FormSection3({ formData, handleInputChange, totalAportesUnivalle, totalIngresos }) {
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
            <TableRow>
              <TableCell>Fondo Común (30%)</TableCell>
              <TableCell align="right">{totalIngresos * 0.3}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Facultad o Instituto (5%)</TableCell>
              <TableCell align="right">{totalIngresos * 0.05}</TableCell>
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
  );
}

export default Step3FormSection3;
