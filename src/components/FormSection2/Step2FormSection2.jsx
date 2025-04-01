import React,{  useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Box, IconButton, Typography, CircularProgress,Tooltip} from '@mui/material';
import { NumericFormat } from 'react-number-format';
import { Add, Remove, Delete, Restore } from '@mui/icons-material';
import PropTypes from "prop-types";

function Step2FormSection2({
  formData,
  handleNumberInputChange,
  updateTotalGastos, 
  extraExpenses,
  onExtraExpensesChange
}) {
  const [expandedSections, setExpandedSections] = useState({});
  const [hiddenConcepts, setHiddenConcepts] = useState([]);
  const [setExtraExpenses] = useState([]);
  const [isAddingExtraExpense, setIsAddingExtraExpense] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estructura jerárquica de gastos
  const gastosStructure = [
    {
      label: '1. Costos de Personal',
      key: '1',
      children: [
        { label: '1,1. Personal Nombrado de la Universidad (Max 70%)', key: '1,1' },
        { label: '1,2. Honorarios Docentes Externos (Horas)', key: '1,2' },
        { label: '1,3. Otro Personal - Subcontratos', key: '1,3' },
      ],
    },
    {
      label: '2. Materiales y Suministros',
      key: '2',
      children: [],
    },
    {
      label: '3. Gastos de Alojamiento',
      key: '3',
      children: [],
    },
    {
      label: '4. Gastos de Alimentación',
      key: '4',
      children: [],
    },
    {
      label: '5. Gastos de Transporte',
      key: '5',
      children: [],
    },
    {
      label: '6. Equipos Alquiler o Compra',
      key: '6',
      children: [],
    },
    {
      label: '7. Dotación Participantes',
      key: '7',
      children: [
        { label: '7,1. Carpetas', key: '7,1' },
        { label: '7,2. Libretas', key: '7,2' },
        { label: '7,3. Lapiceros', key: '7,3' },
        { label: '7,4. Memorias', key: '7,4' },
        { label: '7,5. Marcadores, papel, etc.', key: '7,5' },
      ],
    },
    {
      label: '8. Impresos',
      key: '8',
      children: [
        { label: '8,1. Labels', key: '8,1' },
        { label: '8,2. Certificados', key: '8,2' },
        { label: '8,3. Escarapelas', key: '8,3' },
        { label: '8,4. Fotocopias', key: '8,4' },
      ],
    },
    {
      label: '9. Impresos',
      key: '9',
      children: [
        { label: '9,1. Estación de café', key: '9,1' },
        { label: '9,2. Transporte de mensaje', key: '9,2' },
        { label: '9,3. Refrigerios', key: '9,3' },
      ],
    },
    {
      label: '10. Inversión en Infraestructura Física',
      key: '10',
      children: [],
    },
    {
      label: '11. Gastos Generales',
      key: '11',
      children: [],
    },
    {
      label: '12. Valor Infraestructura Universitaria',
      key: '12',
      children: [],
    },
    {
      label: '13. Imprevistos (Max 5% del 1 al 8)',
      key: '13',
      children: [],
    },
    {
      label: '14. Costos Administrativos del proyecto',
      key: '14',
      children: [],
    },
    {
      label: '15. Gastos Extras',
      key: '15',
      children: [],
      isCustomExpenses: true
    },
  ];

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const newExpanded = {};
    gastosStructure.forEach(item => {
      if (item.children.length > 0) newExpanded[item.key] = true;
    });
    setExpandedSections(newExpanded);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const handleDeleteConcept = (key) => {
    const cantidadKey = `${key}_cantidad`;
    const valorUnitKey = `${key}_vr_unit`;
  
    // Verificar si los campos correspondientes están vacíos
    const cantidad = parseFloat(formData[cantidadKey]);
    const valorUnit = parseFloat(formData[valorUnitKey]);
  
    if (cantidad > 0 || valorUnit > 0) {
      alert('⚠️ No se puede eliminar el concepto porque tiene valores ingresados.');
      return; // Detener el proceso si el campo no está vacío
    }
  
    // Si los campos están vacíos, proceder con la eliminación
    setLoadingDeleteId(key);
  
    setTimeout(() => {
      setExtraExpenses((prevExpenses) => prevExpenses.filter(expense => expense.id !== key));
      setHiddenConcepts((prev) => [...prev, key]);
      setLoadingDeleteId(null);
    }, 500); // Simula una pequeña espera
  };

  const handleRestoreConcepts = () => {
    setHiddenConcepts([]);
  };

  // Calcular dinámicamente el total de ingresos
  const totalIngresos = (formData.ingresos_cantidad) * (formData.ingresos_vr_unit);

  // Calcular el subtotal de gastos
  const calculateSubtotalGastos = () => {
    let subtotal = gastosStructure.reduce((total, item) => {
      if (item.children.length === 0) {
        const cantidad = parseFloat(formData[`${item.key}_cantidad`]) || 0;
        const valorUnitario = parseFloat(formData[`${item.key}_vr_unit`]) || 0;
        return total + cantidad * valorUnitario;
      } else {
        // Sumar tanto el item padre como sus hijos
        const parentCantidad = parseFloat(formData[`${item.key}_cantidad`]) || 0;
        const parentValorUnitario = parseFloat(formData[`${item.key}_vr_unit`]) || 0;
        const parentTotal = parentCantidad * parentValorUnitario;
        const childrenTotal = item.children.reduce((childTotal, child) => {
          const cantidad = parseFloat(formData[`${child.key}_cantidad`]) || 0;
          const valorUnitario = parseFloat(formData[`${child.key}_vr_unit`]) || 0;
          return childTotal + cantidad * valorUnitario;
        }, 0);
        return total + parentTotal + childrenTotal;
      }
    }, 0);
    
    // Sumamos los gastos extras (asegurando que si estén vacíos se tome 0)
    const extraExpensesTotal = extraExpenses.reduce((total, expense) => {
      const cantidad = parseFloat(expense.cantidad) || 0;
      const valorUnit = parseFloat(expense.vr_unit) || 0;
      return total + (cantidad * valorUnit);
    }, 0);
  
    return subtotal + extraExpensesTotal;
  };

  const subtotalGastos = calculateSubtotalGastos();
  const imprevistos = subtotalGastos * 0.03; // 3% de los gastos
  const totalGastosImprevistos = subtotalGastos + imprevistos;

  // Llama a la función callback cada vez que se calcule el total
  useEffect(() => {
    updateTotalGastos(totalGastosImprevistos);
  }, [totalGastosImprevistos, updateTotalGastos]);

  // Formatear valores como moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  
  const handleCurrencyChange = (name, values) => {
    const numericValue = values.value
      .replace(/[^0-9.]/g, '') // Permitir puntos decimales
      .replace(/\.+/g, '.'); // Evitar múltiples puntos
  
    handleNumberInputChange({
      target: { name, value: numericValue }
    });
  };

  const handleAddCustomExpense = () => {
    setIsAddingExtraExpense(true);
  
    setTimeout(() => {
      const newId = Date.now();
      const newExtraExpenses = [
        ...extraExpenses,
        { 
          id: newId, 
          name: '', 
          cantidad: '', 
          vr_unit: '',
          key: `15.${extraExpenses.length + 1}`
        }
      ];
      onExtraExpensesChange(newExtraExpenses);
      setIsAddingExtraExpense(false);
    }, 300);
  };
  
  const handleExtraExpenseChange = (id, field, value) => {
    const newExtraExpenses = extraExpenses.map(expense =>
      expense.id === id ? { ...expense, [field]: value } : expense
    );
    onExtraExpensesChange(newExtraExpenses);
  };

  const handleRemoveExtraExpense = (id) => {
    setLoadingDeleteId(id);
    
    setTimeout(() => {
      const updatedExpenses = extraExpenses
        .filter(expense => expense.id !== id)
        .map((expense, idx) => ({
          ...expense,
          key: `15.${idx + 1}`
        }));
      
      onExtraExpensesChange(updatedExpenses);
      setLoadingDeleteId(null);
    }, 300);
  };

  const isValidExpense = (expense) => {
    const cantidad = parseFloat(expense.cantidad);
    const vr_unit = parseFloat(expense.vr_unit);
    return cantidad > 0 && vr_unit > 0;
  };
  

  const handleFocusPlaceholder = (e) => {
    if (e.target.placeholder === "0") {
      e.target.placeholder = "";
    }
  };
  
  const handleBlurPlaceholder = (e) => {
    if (!e.target.value || e.target.value === "0") {
      e.target.placeholder = "0";
    }
  };

  const displayValue = (val) => (val === 0 || val === "0" ? "" : (val || ""));
  
  // Common props for numeric inputs
  const numericInputProps = {
    inputMode: 'numeric',
    min: "0",
    pattern: '[0-9]*',
    required: true,
    placeholder: "", // sin 0
    onFocus: handleFocusPlaceholder,
    onBlur: handleBlurPlaceholder,
  };

  const isPositiveBalance = totalIngresos >= totalGastosImprevistos;

  return (
    <Table sx={{ 
      '& .MuiTableCell-root': { 
        padding: '12px 16px',
        borderBottom: '1px solid rgba(224, 224, 224, 0.3)'
      },
      '& .MuiTableHead-root': {
        backgroundColor: '#fafafa'
      }
    }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600 }}>CONCEPTO</TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>CANTIDAD</TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>VALOR UNITARIO (COP)</TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>VALOR TOTAL (COP)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 600 }}>ACCIÓN</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {/* SECCIÓN INGRESOS */}
        <TableRow>
          <TableCell colSpan={5} sx={{ 
            backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0',
            py: 1, fontWeight: 600
          }}>
            INGRESOS
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Ingresos por Inscripciones</TableCell>
          <TableCell align="right">
            <TextField
              type="number"
              name="ingresos_cantidad"
              value={formData.ingresos_cantidad}
              onChange={handleNumberInputChange}
              inputProps={numericInputProps}
              sx={{ 
                width: 100, 
                '& .MuiInputBase-input': { 
                  textAlign: 'right', 
                  p: '8px 10px',
                  '&::placeholder': { opacity: 0.6 }
                }
              }}
            />
          </TableCell>
          <TableCell align="right">
            <NumericFormat
              customInput={TextField}
              thousandSeparator="."
              decimalSeparator=","
              prefix="$ "
              name="ingresos_vr_unit"
              value={formData.ingresos_vr_unit}
              onValueChange={(values) => handleCurrencyChange('ingresos_vr_unit', values)}
              onKeyPress={(e) => {
                if (e.key === '.' || e.key === ',') e.preventDefault();
              }}
              inputProps={numericInputProps}
              allowNegative={false}
              sx={{
                width: 150,
                '& .MuiInputBase-input': {
                  textAlign: 'right',
                  p: '8px 10px',
                  '&::placeholder': { opacity: 0.6 }
                }
              }}
            />
          </TableCell>
          <TableCell align="right">{formatCurrency(totalIngresos)}</TableCell>
          <TableCell></TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>TOTAL INGRESOS</TableCell>
          <TableCell 
            align="right"
            sx={{ 
              fontWeight: 'bold',
              backgroundColor: isPositiveBalance ? '#e8f5e9' : '#ffebee',
              color: isPositiveBalance ? '#2e7d32' : '#c62828'
            }}
          >
            {formatCurrency(totalIngresos)}
          </TableCell>
          <TableCell></TableCell>
        </TableRow>
    
        {/* GASTOS HEADER */}
        <TableRow>
          <TableCell colSpan={5} sx={{ mr: 1, color: '#616161', borderColor: '#e0e0e0',
                        '&:hover': { backgroundColor: '#eeeeee', borderColor: '#bdbdbd' },
            py: 1
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>GASTOS</Typography>
              <Box >
                <Button variant="outlined" startIcon={<Add />} onClick={expandAll}>
                  Expandir Todo
                </Button>
                <Button variant="outlined" startIcon={<Remove />} onClick={collapseAll}>
                  Colapsar Todo
                </Button>
                <Button variant="outlined" startIcon={<Restore />} onClick={handleRestoreConcepts}>
                  Restaurar Conceptos
                </Button>
              </Box>
            </Box>
          </TableCell>
        </TableRow>
    
        {/* GASTOS ITEMS */}
        {gastosStructure.map(item => (
          !hiddenConcepts.includes(item.key) && (
            <React.Fragment key={item.key}>
              <TableRow>
                <TableCell>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={500}>{item.label}</Typography>
                    {/* Botón especial para gastos extras o botón normal para otras categorías */}
                    {item.isCustomExpenses ? (
                      <Tooltip title={extraExpenses.length === 0 ? "Crear gastos extras" : "Agregar gasto extra"}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleAddCustomExpense()}
                          disabled={isAddingExtraExpense}
                          sx={{
                            width: 28,
                            height: 28,
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.12)',
                            },
                            border: '1px solid rgba(25, 118, 210, 0.5)',
                          }}
                        >
                          <Add fontSize="small" />
                          {isAddingExtraExpense && (
                            <CircularProgress
                              size={16}
                              sx={{
                                position: 'absolute',
                                color: 'primary.main',
                              }}
                            />
                          )}
                        </IconButton>
                      </Tooltip>
                    ) : (
                      item.children.length > 0 && (
                        <IconButton size="small" onClick={() => toggleSection(item.key)}>
                          {expandedSections[item.key] ? <Remove /> : <Add />}
                        </IconButton>
                      )
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    name={`${item.key}_cantidad`}
                    value={formData[`${item.key}_cantidad`]}
                    onChange={handleNumberInputChange}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <NumericFormat
                    customInput={TextField}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="$ "
                    name={`${item.key}_vr_unit`}
                    value={formData[`${item.key}_vr_unit`]}
                    onValueChange={(values) =>
                      handleNumberInputChange({ target: { name: `${item.key}_vr_unit`, value: values.value } })
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {formatCurrency((formData[`${item.key}_cantidad`]) * (formData[`${item.key}_vr_unit`]))}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Eliminar concepto">
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteConcept(item.key)} 
                      disabled={loadingDeleteId === item.key}>
                      {loadingDeleteId === item.key ? <CircularProgress size={20} /> : <Delete />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>

              {/* Renderizar los gastos extras dinámicos justo después de la categoría principal */}
              {item.isCustomExpenses && extraExpenses.length > 0 && (
                extraExpenses.map((expense, index) => (
                  <TableRow key={`extra-${expense.id}`}>
                    <TableCell sx={{ pl: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Nombre del gasto extra"
                        value={expense.name}
                        onChange={(e) => handleExtraExpenseChange(expense.id, 'name', e.target.value)}
                        sx={{ minWidth: 200 }}
                        InputProps={{
                          startAdornment: <Typography variant="caption" sx={{ mr: 1, color: '#666' }}>15.{index+1}.</Typography>
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        name={`extra-${expense.id}-cantidad`}
                        value={expense.cantidad}
                        onChange={(e) => handleExtraExpenseChange(expense.id, 'cantidad', e.target.value)}
                        inputProps={numericInputProps}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <NumericFormat
                        customInput={TextField}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="$ "
                        size="small"
                        value={expense.vr_unit}
                        onValueChange={(values) => 
                          handleExtraExpenseChange(expense.id, 'vr_unit', values.value)
                        }
                        inputProps={numericInputProps}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(parseFloat(expense.cantidad || 0) * parseFloat(expense.vr_unit || 0))}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Eliminar gasto extra">
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveExtraExpense(expense.id)}
                          disabled={loadingDeleteId === expense.id}
                        >
                          {loadingDeleteId === expense.id ? <CircularProgress size={20} /> : <Delete />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
                {/* Subpuntos */}
                {item.children.length > 0 && expandedSections[item.key] && item.children.map(child => (
                  !hiddenConcepts.includes(child.key) && ( // Oculta los subpuntos correctamente
              <TableRow key={child.key}>
                <TableCell sx={{ pl: 4 }}>{child.label}</TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    name={`${child.key}_cantidad`} // Ej: using child.key for unique name
                    value={formData[`${child.key}_cantidad`]}
                    onChange={handleNumberInputChange}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <NumericFormat
                    customInput={TextField}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="$ "
                    name={`${child.key}_vr_unit`}
                    value={formData[`${child.key}_vr_unit`]}
                    onValueChange={(values) =>
                      handleNumberInputChange({ target: { name: `${child.key}_vr_unit`, value: values.value } })
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {formatCurrency((formData[`${child.key}_cantidad`]) * (formData[`${child.key}_vr_unit`]))}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Eliminar concepto">
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteConcept(child.key)} 
                      disabled={loadingDeleteId === child.key}
                    >
                      {loadingDeleteId === child.key ? <CircularProgress size={20} /> : <Delete />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
                  )
              ))}
            </React.Fragment>
          )
        ))}
        
        {/* TOTALES */}
        <TableRow>
          <TableCell colSpan={3} sx={{ fontWeight: 600, borderTop: '1px solid #e0e0e0', pt: 2 }}>
            SUBTOTAL GASTOS
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 600, borderTop: '1px solid #e0e0e0', pt: 2 }}>
            {formatCurrency(subtotalGastos)}
          </TableCell>
          <TableCell></TableCell>
        </TableRow>

        {/* Imprevistos (3%) */}
        <TableRow>
          <TableCell colSpan={3} sx={{ fontWeight: 600 }}>
            Imprevistos (3%)
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>
            {formatCurrency(imprevistos)}
          </TableCell>
          <TableCell></TableCell>
        </TableRow>

        {/* Total Gastos + Imprevistos con color */}
        <TableRow>
          <TableCell colSpan={3} sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>
            TOTAL GASTOS + IMPREVISTOS
          </TableCell>
          <TableCell 
            align="right"
            sx={{ 
              fontWeight: 600, 
              backgroundColor: isPositiveBalance ? '#e8f5e9' : '#ffebee',
              color: isPositiveBalance ? '#2e7d32' : '#c62828'
            }}
          >
            {formatCurrency(totalGastosImprevistos)}
          </TableCell>
          <TableCell>

          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
  }
  

Step2FormSection2.propTypes = {
  formData: PropTypes.shape({
    ingresos_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ingresos_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  handleNumberInputChange: PropTypes.func.isRequired,
  updateTotalGastos: PropTypes.func.isRequired,
};

export default Step2FormSection2;