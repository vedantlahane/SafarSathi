export const formatTime = (timestamp) => {
  if (!timestamp) {
    return '—';
  }

  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.warn('Failed to format time', error);
    return '—';
  }
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) {
    return '—';
  }

  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short'
    });
  } catch (error) {
    console.warn('Failed to format date-time', error);
    return '—';
  }
};
