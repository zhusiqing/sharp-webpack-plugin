type colorType = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';

export const sizeUnitConvert = (size: number) => {
  if (size === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + sizes[i];
};

export const terminalColor = (color: colorType, text: string) => {
  const colors = {
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
  };
  const _color = colors[color];
  if (_color) {
    return `\u001b[${_color}m ${text} \u001b[0m`;
  }
  return text;
};
