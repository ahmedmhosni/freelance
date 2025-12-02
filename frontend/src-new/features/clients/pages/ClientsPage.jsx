/**
 * Clients Page
 */

import { useState } from 'react';
import { useClients } from '../hooks/useClients';
import ClientList from '../components/ClientList';
import ClientForm from '../components/ClientForm';

const ClientsPage = () => {
  const { clients, loading, error, createClient, updateClient, deleteClient } = useClients();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const handleCreate = async (clientData) => {
    try {
      await createClient(clientData);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create client:', err);
    }
  };

  const handleUpdate = async (clientData) => {
    try {
      await updateClient(editingClient.id, clientData);
      setEditingClient(null);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to update client:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
      } catch (err) {
        console.error('Failed to delete client:', err);
      }
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Clients</h1>
        <button onClick={() => setShowForm(true)}>Add Client</button>
      </div>

      {showForm && (
        <ClientForm
          client={editingClient}
          onSubmit={editingClient ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      )}

      <ClientList
        clients={clients}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ClientsPage;
