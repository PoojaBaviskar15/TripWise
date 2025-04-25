export const getColor = (value) => {
    if (value > 80) return '#800026';
    if (value > 60) return '#BD0026';
    if (value > 40) return '#E31A1C';
    if (value > 20) return '#FC4E2A';
    if (value > 0) return '#FD8D3C';
    return '#FFEDA0';
  };
  