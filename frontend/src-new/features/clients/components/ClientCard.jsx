/**
 * Client Card Component
 */

const ClientCard = ({ client, onEdit, onDelete }) => {
  return (
    <div className="client-card">
      <div className="client-card-header">
        <h3>{client.name}</h3>
        <div className="client-card-actions">
          <button onClick={onEdit}>Edit</button>
          <button onClick={onDelete} className="danger">Delete</button>
        </div>
      </div>
      
      <div className="client-card-body">
        {client.company && <p><strong>Company:</strong> {client.company}</p>}
        {client.email && <p><strong>Email:</strong> {client.email}</p>}
        {client.phone && <p><strong>Phone:</strong> {client.phone}</p>}
        {client.address && <p><strong>Address:</strong> {client.address}</p>}
        {client.notes && <p><strong>Notes:</strong> {client.notes}</p>}
      </div>
    </div>
  );
};

export default ClientCard;
