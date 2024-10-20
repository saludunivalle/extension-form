import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';

function Step2FormSection3({ formData, handleNumberInputChange, totalIngresos, totalGastos, imprevistos, totalGastosImprevistos, totalAportesUnivalle, handleInputChange  }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>CONCEPTO</TableCell>
          <TableCell align="right">CANTIDAD</TableCell>
          <TableCell align="right">VALOR UNITARIO</TableCell>
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
          { label: '1. Costos de Personal', key: 'costos_personal' },
          { label: '1.1.Personal Nombrado de la Universidad (Max 70%)', key: 'personal_universidad' },
          { label: '1.2. Honorarios Docentes Externos (Horas)', key: 'honorarios_docentes' },
          { label: '1.3. Otro Personal - Subcontratos', key: 'otro_personal' },
          { label: '2. Materiales y Suministros', key: 'materiales_sumi' },
          { label: '3. Gastos de Alojamiento', key: 'gastos_alojamiento' },
          { label: '4. Gastos de Alimentación', key: 'gastos_alimentacion' },
          { label: '5. Gastos de Transporte', key: 'gastos_transporte' },
          { label: '6. Equipos Alquiler o Compra', key: 'equipos_alquiler_compra' },
          { label: '7. Dotación Participantes', key: 'dotacion_participantes' },
          { label: '7.1. Carpetas', key: 'carpetas' },
          { label: '7.2. Libretas', key: 'libretas' },
          { label: '7.3. Lapiceros', key: 'lapiceros' },
          { label: '7.4. Memorias', key: 'memorias' },
          { label: '7.5. Marcadores, papel, etc.', key: 'marcadores_papel_otros' },
          { label: '8. Impresos', key: 'impresos' },
          { label: '8.1. Labels', key: 'labels' },
          { label: '8.2. Certificados', key: 'certificados' },
          { label: '8.3. Escarapelas', key: 'escarapelas' },
          { label: '8.4. Fotocopias', key: 'fotocopias' },
          { label: '9. Impresos', key: 'impresos_2' }, // Para diferenciarlo del anterior 'Impresos'
          { label: '9.1. Estación de café', key: 'estacion_cafe' },
          { label: '9.2. Transporte de mensaje', key: 'transporte_mensaje' },
          { label: '9.3. Refrigerios', key: 'refrigerios' },
          { label: '10. Inversión en Infraestructura Física', key: 'infraestructura_fisica' },
          { label: '11. Gastos Generales', key: 'gastos_generales' },
          { label: '12. Valor Infraestructura Universitaria', key: 'infraestructura_universitaria' },
          { label: '13. Imprevistos (Max 5% del 1 al 8)', key: 'imprevistos' },
          { label: '14. Costos Administrativos del proyecto', key: 'costos_administrativos' }
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
        <TableRow>
          <TableCell colSpan={3} style={{ fontWeight: 'bold' }}>APORTES UNIVALLE</TableCell>
        </TableRow>
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
          <TableCell colSpan={1} style={{ fontWeight: 'bold' }}>Total Recursos</TableCell>
          <TableCell align="right" style={{ fontWeight: 'bold' }}>
            {totalAportesUnivalle}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default Step2FormSection3;
