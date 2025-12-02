/**
 * Client List Component
 */

import ClientCard from './ClientCard';

const ClientList = ({ clients, onEdit, onDelete }) => {
  if (clients.length === 0) {
    return (
      <div className="empty-state">
        <p>No clients yet. Add your first client to get started!</p>
      </div>
    );
  }

  return (
    <div className="client-list">
      {clients.map(client => (
        <ClientCard
          key={client.id}
          client={client}
          onEdit={() => onEdit(client)}
          onDelete={() => onDelete(client.id)}
        />
      ))}
    </div>
  );
};

export default ClientList;
