import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MdAdd, MdDelete, MdAccessTime } from 'react-icons/md';

const InvoiceForm = ({ invoice, onClose, onSuccess }) => {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    client_id: invoice?.client_id || '',
    invoice_number: invoice?.invoice_number || '',
    status: invoice?.status || 'draft',
    issue_date: invoice?.issue_date 
      ? new Date(invoice.issue_date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',
    sent_date: invoice?.sent_date ? new Date(invoice.sent_date).toISOString().split('T')[0] : '',
    paid_date: invoice?.paid_date ? new Date(invoice.paid_date).toISOString().split('T')[0] : '',
    notes: invoice?.notes || '',
    tax_rate: invoice?.tax_rate || 0
  });
  const [allInvoices, setAllInvoices] = useState([]);

  // Generate invoice number on mount for new invoices
  useEffect(() => {
    if (!invoice?.id) {
      fetchAllInvoices();
    }
  }, [invoice]);

  const fetchAllInvoices = async () => {
    try {
      const response = await api.get('/api/invoices');
      const invoices = response.data.data || response.data;
      setAllInvoices(invoices);
      
      // Generate next invoice number
      const nextNumber = generateNextInvoiceNumber(invoices);
      setFormData(prev => ({ ...prev, invoice_number: nextNumber }));
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const generateNextInvoiceNumber = (invoices) => {
    if (!invoices || invoices.length === 0) return 'INV-0001';
    
    const numbers = invoices
      .map(inv => {
        const match = inv.invoice_number?.match(/INV-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);
    
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNumber = maxNumber + 1;
    return `INV-${String(nextNumber).padStart(4, '0')}`;
  };
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    type: 'fixed', // 'fixed' or 'hourly'
    project_id: '',
    task_id: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    hours_worked: 0,
    rate_per_hour: 0,
    apply_tax: false,
    tax_rate: 0
  });

  useEffect(() => {
    fetchClients();
    fetchProjects();
    fetchTasks();
    if (invoice) {
      fetchInvoiceItems();
    }
  }, [invoice]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/clients');
      setClients(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      setProjects(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks');
      setTasks(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchInvoiceItems = async () => {
    try {
      const response = await api.get(`/api/invoices/${invoice.id}/items`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching invoice items:', error);
    }
  };

  const handleAddItem = () => {
    // Validation
    if (!newItem.description || newItem.description.trim() === '') {
      toast.error('Please enter a description for the item');
      return;
    }
    
    if (newItem.type === 'hourly') {
      if (!newItem.hours_worked || parseFloat(newItem.hours_worked) <= 0) {
        toast.error('Please enter hours worked (must be greater than 0)');
        return;
      }
      if (!newItem.rate_per_hour || parseFloat(newItem.rate_per_hour) <= 0) {
        toast.error('Please enter hourly rate (must be greater than 0)');
        return;
      }
    } else {
      if (!newItem.quantity || parseFloat(newItem.quantity) <= 0) {
        toast.error('Please enter quantity (must be greater than 0)');
        return;
      }
      if (!newItem.unit_price || parseFloat(newItem.unit_price) <= 0) {
        toast.error('Please enter unit price (must be greater than 0)');
        return;
      }
    }
    
    const baseAmount = newItem.type === 'hourly' 
      ? parseFloat(newItem.hours_worked) * parseFloat(newItem.rate_per_hour)
      : parseFloat(newItem.quantity) * parseFloat(newItem.unit_price);
    
    const taxAmount = newItem.apply_tax ? baseAmount * (parseFloat(newItem.tax_rate) / 100) : 0;
    const totalAmount = baseAmount + taxAmount;
    
    const item = {
      ...newItem,
      base_amount: baseAmount,
      tax_amount: taxAmount,
      amount: totalAmount,
      id: Date.now() // Temporary ID for new items
    };
    
    setItems([...items, item]);
    toast.success('Item added!');
    
    setNewItem({
      type: 'fixed',
      project_id: '',
      task_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      hours_worked: 0,
      rate_per_hour: 0,
      apply_tax: false,
      tax_rate: 0
    });
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + parseFloat(item.base_amount || item.amount || 0), 0);
  };

  const calculateTotalTax = () => {
    return items.reduce((sum, item) => sum + parseFloat(item.tax_amount || 0), 0);
  };

  const calculateTax = () => {
    const taxRate = parseFloat(formData.tax_rate) || 0;
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let invoiceId = invoice?.id;
      
      // Validate
      if (!formData.client_id) {
        toast.error('Please select a client');
        return;
      }
      
      if (items.length === 0) {
        toast.error('Please add at least one line item to the invoice');
        return;
      }
      
      const subtotal = calculateSubtotal();
      
      // Create or update invoice
      if (invoice?.id) {
        const updateData = {
          client_id: parseInt(formData.client_id),
          status: formData.status,
          issue_date: formData.issue_date || null,
          due_date: formData.due_date || null,
          sent_date: formData.sent_date || null,
          paid_date: formData.paid_date || null,
          notes: formData.notes || null,
          amount: subtotal
        };
        
        console.log('Updating invoice with:', updateData);
        await api.put(`/api/invoices/${invoice.id}`, updateData);
        toast.success('Invoice updated!');
        invoiceId = invoice.id;
      } else {
        const createData = {
          client_id: parseInt(formData.client_id),
          invoice_number: formData.invoice_number,
          status: formData.status,
          issue_date: formData.issue_date || null,
          due_date: formData.due_date || null,
          notes: formData.notes || null,
          amount: subtotal
        };
        
        console.log('Creating invoice with:', createData);
        const response = await api.post('/api/invoices', createData);
        invoiceId = response.data.id;
        toast.success('Invoice created!');
      }

      // Save items
      for (const item of items) {
        if (item.id > 1000000000) { // New item (temporary ID)
          await api.post(`/api/invoices/${invoiceId}/items`, {
            project_id: item.project_id || null,
            task_id: item.task_id || null,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            hours_worked: item.hours_worked || null,
            rate_per_hour: item.rate_per_hour || null
          });
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(error.response?.data?.error || 'Failed to save invoice');
    }
  };

  return (
    <div className="card" style={{ marginBottom: '20px', animation: 'slideIn 0.2s ease-out' }}>
      <h3>{invoice ? 'Edit Invoice' : 'New Invoice'}</h3>
      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: 'rgba(55, 53, 47, 0.9)' }}>
              Invoice Number *
            </label>
            <input
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              required
              disabled={!!invoice?.id}
              style={{ 
                background: invoice?.id ? 'rgba(55, 53, 47, 0.03)' : 'white',
                cursor: invoice?.id ? 'not-allowed' : 'text'
              }}
            />
            <p style={{ fontSize: '11px', color: 'rgba(55, 53, 47, 0.5)', margin: '4px 0 0 0', fontFamily: 'inherit' }}>
              {!invoice?.id ? 'Auto-generated sequentially' : 'Cannot be changed after creation'}
            </p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>
              Client *
            </label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              required
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <p style={{ fontSize: '11px', color: 'rgba(55, 53, 47, 0.5)', margin: '4px 0 0 0' }}>
              Who you're billing
            </p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>
              Issue Date *
            </label>
            <input
              type="date"
              value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              required
            />
            <p style={{ fontSize: '11px', color: 'rgba(55, 53, 47, 0.5)', margin: '4px 0 0 0' }}>
              When invoice was created
            </p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>
              Due Date *
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
            <p style={{ fontSize: '11px', color: 'rgba(55, 53, 47, 0.5)', margin: '4px 0 0 0' }}>
              When payment is expected
            </p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <p style={{ fontSize: '11px', color: 'rgba(55, 53, 47, 0.5)', margin: '4px 0 0 0' }}>
              Current payment status
            </p>
          </div>
        </div>

        {/* Status-based dates (editable) */}
        {(formData.status === 'sent' || formData.status === 'paid' || formData.status === 'overdue' || formData.sent_date || formData.paid_date) && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px', 
            marginBottom: '20px',
            padding: '12px',
            background: 'rgba(46, 170, 220, 0.1)',
            borderRadius: '4px',
            border: '1px solid rgba(46, 170, 220, 0.2)'
          }}>
            {(formData.status === 'sent' || formData.status === 'paid' || formData.status === 'overdue' || formData.sent_date) && (
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: 'rgba(55, 53, 47, 0.9)' }}>
                  Sent Date
                </label>
                <input
                  type="date"
                  value={formData.sent_date}
                  onChange={(e) => setFormData({ ...formData, sent_date: e.target.value })}
                />
                <p style={{ fontSize: '11px', color: 'rgba(55, 53, 47, 0.65)', margin: '4px 0 0 0' }}>
                  When invoice was sent to client
                </p>
              </div>
            )}
            {(formData.status === 'paid' || formData.paid_date) && (
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: 'rgba(55, 53, 47, 0.9)' }}>
                  Paid Date
                </label>
                <input
                  type="date"
                  value={formData.paid_date}
                  onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
                />
                <p style={{ fontSize: '11px', color: 'rgba(55, 53, 47, 0.65)', margin: '4px 0 0 0' }}>
                  When payment was received
                </p>
              </div>
            )}
          </div>
        )}

        {/* Line Items */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '12px' }}>Line Items</h4>
          
          {/* Existing Items */}
          {items.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Project/Task</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Qty/Hours</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Rate</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Tax</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Amount</th>
                    <th style={{ textAlign: 'center', padding: '8px', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>
                        {item.description}
                        {item.apply_tax && (
                          <div style={{ fontSize: '10px', color: 'rgba(46, 170, 220, 0.8)', marginTop: '2px' }}>
                            Tax: {item.tax_rate}%
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '8px', fontSize: '12px', color: 'rgba(55, 53, 47, 0.65)' }}>
                        {item.project_name || item.task_name || '-'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>
                        {item.hours_worked || item.quantity}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>
                        ${parseFloat(item.rate_per_hour || item.unit_price || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px', fontSize: '12px', color: 'rgba(55, 53, 47, 0.65)' }}>
                        {item.apply_tax ? `$${parseFloat(item.tax_amount || 0).toFixed(2)}` : '-'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px', fontWeight: '500' }}>
                        ${parseFloat(item.amount).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="btn-delete"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add New Item */}
          <div style={{ background: 'rgba(55, 53, 47, 0.03)', padding: '16px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setNewItem({ ...newItem, type: 'fixed' })}
                className={newItem.type === 'fixed' ? 'btn-primary' : 'btn-edit'}
                style={{ flex: 1, fontSize: '13px' }}
              >
                Fixed Price
              </button>
              <button
                type="button"
                onClick={() => setNewItem({ ...newItem, type: 'hourly' })}
                className={newItem.type === 'hourly' ? 'btn-primary' : 'btn-edit'}
                style={{ flex: 1, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <MdAccessTime /> Hourly
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <select
                  value={newItem.project_id}
                  onChange={(e) => setNewItem({ ...newItem, project_id: e.target.value })}
                >
                  <option value="">Select Project (Optional)</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', margin: '2px 0 0 0' }}>
                  Link to a project
                </p>
              </div>
              <div>
                <select
                  value={newItem.task_id}
                  onChange={(e) => setNewItem({ ...newItem, task_id: e.target.value })}
                >
                  <option value="">Select Task (Optional)</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
                <p style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', margin: '2px 0 0 0' }}>
                  Link to a specific task
                </p>
              </div>
            </div>

            <input
              placeholder="Description *"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              style={{ marginBottom: '4px' }}
            />
            <p style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', margin: '0 0 10px 0' }}>
              What work was done
            </p>

            {newItem.type === 'fixed' ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Quantity"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    />
                    <p style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', margin: '2px 0 0 0' }}>
                      How many
                    </p>
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Unit Price"
                      value={newItem.unit_price}
                      onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
                    />
                    <p style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', margin: '2px 0 0 0' }}>
                      Price per unit
                    </p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: 'white', borderRadius: '4px', border: '1px solid rgba(55, 53, 47, 0.16)', height: '40px' }}>
                      <strong>${(newItem.quantity * newItem.unit_price).toFixed(2)}</strong>
                    </div>
                    <p style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', margin: '2px 0 0 0' }}>
                      Total
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <input
                      type="number"
                      step="0.25"
                      placeholder="Hours Worked"
                      value={newItem.hours_worked}
                      onChange={(e) => setNewItem({ ...newItem, hours_worked: e.target.value })}
                    />
                    <p style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', margin: '2px 0 0 0' }}>
                      Time spent
                    </p>
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Rate/Hour"
                      value={newItem.rate_per_hour}
                      onChange={(e) => setNewItem({ ...newItem, rate_per_hour: e.target.value })}
                    />
                    <p style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', margin: '2px 0 0 0' }}>
                      Hourly rate
                    </p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: 'white', borderRadius: '4px', border: '1px solid rgba(55, 53, 47, 0.16)', height: '40px' }}>
                      <strong>${(newItem.hours_worked * newItem.rate_per_hour).toFixed(2)}</strong>
                    </div>
                    <p style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', margin: '2px 0 0 0' }}>
                      Total
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Option */}
            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '4px', border: '1px solid rgba(55, 53, 47, 0.1)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', marginBottom: newItem.apply_tax ? '12px' : '0', fontFamily: 'inherit' }}>
                <input
                  type="checkbox"
                  checked={newItem.apply_tax}
                  onChange={(e) => setNewItem({ ...newItem, apply_tax: e.target.checked })}
                  style={{ cursor: 'pointer', marginTop: '2px', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(55, 53, 47, 0.9)', fontFamily: 'inherit' }}>Apply tax to this item</span>
              </label>
              
              {newItem.apply_tax && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px', alignItems: 'start' }}>
                  <div>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="Tax %"
                      value={newItem.tax_rate}
                      onChange={(e) => setNewItem({ ...newItem, tax_rate: e.target.value })}
                      style={{ padding: '8px 10px', fontSize: '13px', width: '100%', fontFamily: 'inherit' }}
                    />
                    <p style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)', margin: '4px 0 0 0', fontFamily: 'inherit' }}>
                      Tax rate (%)
                    </p>
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.65)', padding: '8px 0', fontFamily: 'inherit' }}>
                    {newItem.type === 'fixed' ? (
                      <>
                        Base: ${(newItem.quantity * newItem.unit_price).toFixed(2)} + 
                        Tax: ${((newItem.quantity * newItem.unit_price) * (newItem.tax_rate / 100)).toFixed(2)} = 
                        <strong> ${((newItem.quantity * newItem.unit_price) * (1 + newItem.tax_rate / 100)).toFixed(2)}</strong>
                      </>
                    ) : (
                      <>
                        Base: ${(newItem.hours_worked * newItem.rate_per_hour).toFixed(2)} + 
                        Tax: ${((newItem.hours_worked * newItem.rate_per_hour) * (newItem.tax_rate / 100)).toFixed(2)} = 
                        <strong> ${((newItem.hours_worked * newItem.rate_per_hour) * (1 + newItem.tax_rate / 100)).toFixed(2)}</strong>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              disabled={!newItem.description}
              className="btn-primary"
              style={{ marginTop: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <MdAdd /> Add Item
            </button>
          </div>
        </div>

        {/* Totals */}
        <div style={{ borderTop: '2px solid #ddd', paddingTop: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <div style={{ width: '250px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Subtotal:</span>
              <strong>${calculateSubtotal().toFixed(2)}</strong>
            </div>
          </div>
          {calculateTotalTax() > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <div style={{ width: '250px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Tax (from items):</span>
                <strong>${calculateTotalTax().toFixed(2)}</strong>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '250px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
              <span>Total:</span>
              <strong>${(calculateSubtotal() + calculateTotalTax()).toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Notes */}
        <textarea
          placeholder="Notes (optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          style={{ marginBottom: '16px', minHeight: '60px' }}
        />

        {/* Actions */}
        <div>
          <button type="submit" className="btn-primary" style={{ marginRight: '10px' }}>
            {invoice ? 'Update Invoice' : 'Create Invoice'}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
