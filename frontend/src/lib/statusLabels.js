// French labels for the status enums returned by the API (listings and bookings).
export const STATUS_LABELS = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  completed: 'Terminée',
};

export const statusLabel = (status) => STATUS_LABELS[status] || status;

// Room.type enum → French label
export const ROOM_TYPE_LABELS = { single: 'Simple', double: 'Double', suite: 'Suite', family: 'Familiale' };
