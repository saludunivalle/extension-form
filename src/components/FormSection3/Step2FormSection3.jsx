import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';

function Step2FormSection3({ formData, handleNumberInputChange, totalIngresos, totalGastos, imprevistos, totalGastosImprevistos }) {
  return (
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
          // Otros items...
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
  );
}

export default Step2FormSection3;
